import os
import time
import json
import logging
import threading
import requests
from datetime import datetime
from flask import Flask, jsonify

app = Flask(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

HUBSPOT_TOKEN = os.environ.get('HUBSPOT_TOKEN')
SYMPLA_TOKEN = os.environ.get('SYMPLA_TOKEN')
SYMPLA_EVENT_ID = os.environ.get('SYMPLA_EVENT_ID', '3290957')
POLL_INTERVAL = int(os.environ.get('POLL_INTERVAL', '300'))

PROCESSED_FILE = '/tmp/processed_orders.json'


def load_processed():
    try:
        with open(PROCESSED_FILE, 'r') as f:
            return set(json.load(f))
    except:
        return set()


def save_processed(processed):
    with open(PROCESSED_FILE, 'w') as f:
        json.dump(list(processed), f)


def get_sympla_participants(page=1):
    url = f'https://api.sympla.com.br/public/v3/events/{SYMPLA_EVENT_ID}/orders'
    headers = {
        's_token': SYMPLA_TOKEN,
        'Authorization': f'Bearer {SYMPLA_TOKEN}'
    }
    params = {'page': page, 'page_size': 100}

    response = requests.get(url, headers=headers, params=params)
    logger.info(f"Sympla API status: {response.status_code}")
    if response.status_code != 200:
        logger.error(f"Sympla API erro: {response.text}")
    response.raise_for_status()
    data = response.json()
    logger.info(f"Sympla retornou {len(data.get('data', []))} registros na pagina {page}")
    return data


def get_field_value(participant, field_name):
    form_data = participant.get('form_data', [])
    for field in form_data:
        if field.get('field_token') == field_name or field.get('name') == field_name:
            return field.get('value', '')
    return ''


def send_to_hubspot(participant):
    first_name = participant.get('first_name', '')
    last_name = participant.get('last_name', '')
    email = participant.get('email', '')

    if not email:
        logger.warning(f"Participante sem email: {participant.get('order_id')}")
        return False

    nome_completo = get_field_value(participant, 'mkt_nome_completo') or f"{first_name} {last_name}".strip()
    empresa = get_field_value(participant, 'company_name')
    telefone = get_field_value(participant, 'mkt_telefone')
    tamanho_frota = get_field_value(participant, 'qual_o_tamanho_da_sua_frota_')
    lm_dm = get_field_value(participant, 'lm_ou_dm')
    ultima_fonte = get_field_value(participant, 'ultima_fonte_conversao') or 'Sympla'

    properties = {
        'email': email,
        'firstname': first_name,
        'lastname': last_name,
        'mkt_nome_completo': nome_completo,
        'company': empresa,
        'phone': telefone,
        'qual_o_tamanho_da_sua_frota_': tamanho_frota,
        'lm_ou_dm': lm_dm,
        'ultima_fonte_conversao': ultima_fonte,
    }
    properties = {k: v for k, v in properties.items() if v}

    url = 'https://api.hubapi.com/crm/v3/objects/contacts/upsert'
    headers = {
        'Authorization': f'Bearer {HUBSPOT_TOKEN}',
        'Content-Type': 'application/json'
    }
    payload = {
        'inputs': [{
            'properties': properties,
            'idProperty': 'email'
        }]
    }

    response = requests.post(url, headers=headers, json=payload)
    if response.status_code in [200, 201]:
        logger.info(f"Contato enviado ao HubSpot: {email}")
        return True
    else:
        logger.error(f"Erro HubSpot ({response.status_code}): {response.text}")
        return False


def poll_sympla(reset=False):
    logger.info(f"Iniciando polling do evento {SYMPLA_EVENT_ID}...")
    processed = set() if reset else load_processed()
    new_count = 0
    page = 1

    while True:
        try:
            data = get_sympla_participants(page)
            participants = data.get('data', [])

            if not participants:
                break

            for participant in participants:
                order_id = str(participant.get('order_id', ''))
                if order_id and order_id not in processed:
                    if send_to_hubspot(participant):
                        processed.add(order_id)
                        new_count += 1
                        time.sleep(0.2)

            pagination = data.get('pagination', {})
            if page >= pagination.get('total_page', 1):
                break
            page += 1

        except Exception as e:
            logger.error(f"Erro no polling pagina {page}: {e}")
            break

    save_processed(processed)
    logger.info(f"Polling concluido. {new_count} novos contatos enviados ao HubSpot.")
    return new_count


def run_scheduler():
    while True:
        try:
            poll_sympla()
        except Exception as e:
            logger.error(f"Erro no scheduler: {e}")
        logger.info(f"Proximo polling em {POLL_INTERVAL} segundos...")
        time.sleep(POLL_INTERVAL)


scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
scheduler_thread.start()


@app.route('/')
def index():
    return jsonify({
        'status': 'online',
        'evento': SYMPLA_EVENT_ID,
        'poll_interval': f'{POLL_INTERVAL}s',
        'message': 'Sympla HubSpot sync ativo'
    })


@app.route('/sync', methods=['POST', 'GET'])
def manual_sync():
    logger.info("Sincronizacao manual solicitada")
    count = poll_sympla()
    return jsonify({
        'status': 'ok',
        'novos_contatos': count,
        'timestamp': datetime.now().isoformat()
    })


@app.route('/reset', methods=['POST', 'GET'])
def reset_and_sync():
    logger.info("Reset solicitado - reprocessando todos os inscritos")
    count = poll_sympla(reset=True)
    return jsonify({
        'status': 'ok',
        'contatos_sincronizados': count,
        'timestamp': datetime.now().isoformat()
    })


@app.route('/health')
def health():
    return jsonify({'status': 'healthy'})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
