"""
Integração Sympla → HubSpot via Webhook
----------------------------------------
Recebe eventos de compra do Sympla e cria/atualiza contatos no HubSpot.

Dependências:
    pip install flask requests python-dotenv

Variáveis de ambiente (.env):
    HUBSPOT_TOKEN=seu_token_aqui
    SYMPLA_TOKEN=seu_token_aqui (usado para validar requisições)
    WEBHOOK_SECRET=uma_chave_secreta_qualquer
"""

import hashlib
import hmac
import logging
import os

import requests
from dotenv import load_dotenv
from flask import Flask, abort, jsonify, request

load_dotenv()

app = Flask(__name__)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Configurações
# ──────────────────────────────────────────────

HUBSPOT_TOKEN   = os.getenv("HUBSPOT_TOKEN")
WEBHOOK_SECRET  = os.getenv("WEBHOOK_SECRET", "")   # segredo compartilhado com o Sympla
SYMPLA_TOKEN    = os.getenv("SYMPLA_TOKEN")

HUBSPOT_API_URL = "https://api.hubapi.com/crm/v3/objects/contacts"

# ──────────────────────────────────────────────
# Helpers — HubSpot
# ──────────────────────────────────────────────

def hubspot_headers():
    return {
        "Authorization": f"Bearer {HUBSPOT_TOKEN}",
        "Content-Type": "application/json",
    }


def find_contact_by_email(email: str) -> str | None:
    """Retorna o ID do contato no HubSpot se ele já existir."""
    url = f"{HUBSPOT_API_URL}/{email}"
    params = {"idProperty": "email"}
    resp = requests.get(url, headers=hubspot_headers(), params=params)
    if resp.status_code == 200:
        return resp.json().get("id")
    return None


def build_contact_properties(participant: dict, event: dict) -> dict:
    """
    Mapeia os campos do Sympla para as propriedades do HubSpot.

    Mapeamento:
        Sympla: Nome completo         → HubSpot: mkt_nome_completo
        Sympla: E-mail                → HubSpot: email
        Sympla: Nome da empresa       → HubSpot: company_name
        Sympla: Telefone              → HubSpot: mkt_telefone
        Sympla: Tamanho da frota      → HubSpot: qual_o_tamanho_da_sua_frota_
        Sympla: (preenchido no código)→ HubSpot: lm_ou_dm  (Gatilho LM ou DM)
        Sympla: Nome do evento        → HubSpot: ultima_fonte_conversao
    """

    # Extrai campos customizados do formulário Sympla
    # O Sympla envia em "custom_form_answers" como lista de dicts
    # {"token": "nome_do_campo", "value": "valor"}
    custom = {}
    for answer in participant.get("custom_form_answers", []):
        token = answer.get("token", "").lower().replace(" ", "_")
        custom[token] = answer.get("value", "")

    # Nome completo — tenta campo direto, senão monta a partir de first+last
    nome_completo = custom.get("nome", "").strip()
    if not nome_completo:
        primeiro = participant.get("first_name", "")
        ultimo   = participant.get("last_name", "")
        nome_completo = f"{primeiro} {ultimo}".strip()

    company = participant.get("company", custom.get("nome_da_empresa", ""))
    telefone = participant.get("phone_number", custom.get("telefone", ""))
    frota    = custom.get("qual_o_tamanho_da_frota_",
               custom.get("tamanho_da_frota",
               participant.get("fleet_size", "")))

    event_name = event.get("name", "")  # ex: "Prolog Day Curitiba"

    # [MKT] Gatilho LM ou DM:
    # "LM" = Lead Marketing (veio de evento/Sympla)
    # "DM" = Direct Marketing
    # Como o contato veio do Sympla, marcamos como "LM"
    gatilho = "LM"

    return {
        # ── Campos do HubSpot ──────────────────────────────
        "email":                       participant.get("email", ""),
        "mkt_nome_completo":           nome_completo,
        "company_name":                company,
        "mkt_telefone":                telefone,
        "qual_o_tamanho_da_sua_frota_": frota,
        "lm_ou_dm":                    gatilho,
        # Última Fonte de Conversão = nome do evento (ex: "Prolog Day Curitiba")
        "ultima_fonte_conversao":      event_name,
    }


def create_contact(properties: dict) -> dict:
    payload = {"properties": properties}
    resp = requests.post(HUBSPOT_API_URL, headers=hubspot_headers(), json=payload)
    resp.raise_for_status()
    logger.info(f"Contato criado: {properties['email']}")
    return resp.json()


def update_contact(contact_id: str, properties: dict) -> dict:
    url = f"{HUBSPOT_API_URL}/{contact_id}"
    payload = {"properties": properties}
    resp = requests.patch(url, headers=hubspot_headers(), json=payload)
    resp.raise_for_status()
    logger.info(f"Contato atualizado: {properties['email']} (id={contact_id})")
    return resp.json()


def upsert_contact(participant: dict, event: dict):
    """Cria o contato se não existir; atualiza se já existir."""
    email = participant.get("email", "").strip().lower()
    if not email:
        logger.warning("Participante sem e-mail, pulando.")
        return

    props = build_contact_properties(participant, event)
    existing_id = find_contact_by_email(email)

    if existing_id:
        update_contact(existing_id, props)
    else:
        create_contact(props)


# ──────────────────────────────────────────────
# Helpers — Sympla
# ──────────────────────────────────────────────

def validate_signature(payload: bytes, signature_header: str) -> bool:
    """
    Valida a assinatura HMAC-SHA256 enviada pelo Sympla no header
    'X-Sympla-Signature'. Retorna True se válida.
    Deixe WEBHOOK_SECRET vazio para pular a validação (não recomendado em produção).
    """
    if not WEBHOOK_SECRET:
        return True

    expected = hmac.new(
        WEBHOOK_SECRET.encode(), payload, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature_header or "")


def fetch_event_details(event_id: str) -> dict:
    """Busca detalhes do evento diretamente na API do Sympla (opcional)."""
    if not SYMPLA_TOKEN:
        return {"id": event_id, "name": ""}

    url = f"https://api.sympla.com.br/public/v3/events/{event_id}"
    headers = {"s_authorization": SYMPLA_TOKEN}
    resp = requests.get(url, headers=headers)
    if resp.status_code == 200:
        return resp.json().get("data", {})
    logger.warning(f"Não foi possível buscar o evento {event_id}: {resp.status_code}")
    return {"id": event_id, "name": ""}


# ──────────────────────────────────────────────
# Endpoint do Webhook
# ──────────────────────────────────────────────

@app.route("/webhook/sympla", methods=["POST"])
def sympla_webhook():
    raw_body = request.get_data()
    signature = request.headers.get("X-Sympla-Signature", "")

    # 1. Valida assinatura
    if not validate_signature(raw_body, signature):
        logger.warning("Assinatura inválida recebida.")
        abort(401, "Assinatura inválida")

    data = request.get_json(force=True, silent=True)
    if not data:
        abort(400, "Payload inválido")

    logger.info(f"Webhook recebido: {data}")

    event_type = data.get("type", "")

    # 2. Filtra apenas eventos de ordem concluída / novo participante
    if event_type not in ("order.approved", "participant.confirmed", "order.completed"):
        logger.info(f"Evento '{event_type}' ignorado.")
        return jsonify({"status": "ignored", "type": event_type}), 200

    # 3. Extrai dados do payload
    order      = data.get("data", {})
    event_id   = str(order.get("event_id", ""))
    participants = order.get("participants", [])

    # Se participantes não vieram no payload, tenta pegar o comprador
    if not participants:
        buyer = {
            "email":       order.get("buyer_email", ""),
            "first_name":  order.get("buyer_first_name", ""),
            "last_name":   order.get("buyer_last_name", ""),
            "phone_number": order.get("buyer_phone", ""),
            "order_id":    order.get("id", ""),
            "ticket_num":  "",
        }
        participants = [buyer]

    # 4. Busca detalhes do evento (nome, etc.)
    event = fetch_event_details(event_id) if event_id else {"id": "", "name": ""}

    # 5. Faz upsert de cada participante no HubSpot
    processed = 0
    for participant in participants:
        try:
            upsert_contact(participant, event)
            processed += 1
        except requests.HTTPError as e:
            logger.error(f"Erro ao sincronizar contato: {e} | Resposta: {e.response.text}")

    return jsonify({"status": "ok", "processed": processed}), 200


# ──────────────────────────────────────────────
# Health check
# ──────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "running"}), 200


# ──────────────────────────────────────────────
# Entry point
# ──────────────────────────────────────────────

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
