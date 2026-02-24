import { NextRequest, NextResponse } from 'next/server';

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const ipRequests = new Map<string, number[]>();

function clean(ip: string, now: number) {
  const recent = (ipRequests.get(ip) || []).filter((time) => now - time < WINDOW_MS);
  ipRequests.set(ip, recent);
  return recent;
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  const now = Date.now();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  const recent = clean(ip, now);
  if (recent.length >= MAX_PER_WINDOW) {
    return NextResponse.json(
      { message: 'Muitas tentativas. Aguarde um minuto e tente novamente.' },
      { status: 429 },
    );
  }

  let payload: { name?: string; email?: string; company?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: 'Corpo da requisição inválido.' }, { status: 400 });
  }

  const name = payload.name?.trim() || '';
  const email = payload.email?.trim() || '';
  const company = payload.company?.trim() || '';

  if (name.length < 2 || company.length < 2 || !validEmail(email)) {
    return NextResponse.json(
      { message: 'Revise os dados: nome, e-mail corporativo e empresa são obrigatórios.' },
      { status: 422 },
    );
  }

  ipRequests.set(ip, [...recent, now]);

  return NextResponse.json(
    {
      message: 'Lead recebido com sucesso.',
      data: { name, email, company },
    },
    { status: 200 },
  );
}
