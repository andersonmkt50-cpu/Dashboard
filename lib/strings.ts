export type Locale = 'pt' | 'en';

type FAQItem = { question: string; answer: string };
type Testimonial = { name: string; role: string; quote: string };
type ComparisonRow = { criteria: string; spreadsheet: string; genericApps: string; faturaLens: string };

export type LandingCopy = {
  seo: {
    title: string;
    description: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cta: string;
  };
  form: {
    title: string;
    name: string;
    email: string;
    company: string;
    submit: string;
    loading: string;
    success: string;
    genericError: string;
  };
  howItWorks: {
    title: string;
    steps: string[];
    screenshotAlt: string;
  };
  testimonials: {
    title: string;
    items: Testimonial[];
  };
  comparison: {
    title: string;
    rows: ComparisonRow[];
    headers: {
      criteria: string;
      spreadsheet: string;
      genericApps: string;
      faturaLens: string;
    };
  };
  faq: {
    title: string;
    items: FAQItem[];
  };
};

export const strings: Record<Locale, LandingCopy> = {
  pt: {
    seo: {
      title: 'FaturaLensLP | Reduza erros de faturamento com IA',
      description:
        'Automatize análise de faturas, detecte divergências e acelere decisões financeiras com o FaturaLens.',
    },
    hero: {
      eyebrow: 'Plataforma para operações financeiras',
      title: 'Transforme faturamento em insights acionáveis',
      subtitle:
        'Consolide dados, monitore variações e tome decisões em minutos — não em dias.',
      cta: 'Quero uma demonstração',
    },
    form: {
      title: 'Solicite contato',
      name: 'Nome completo',
      email: 'E-mail corporativo',
      company: 'Empresa',
      submit: 'Enviar',
      loading: 'Enviando...',
      success: 'Recebemos seus dados! Nosso time entrará em contato em breve.',
      genericError: 'Não foi possível enviar agora. Tente novamente em instantes.',
    },
    howItWorks: {
      title: 'Como funciona',
      steps: [
        'Conecte suas fontes de faturamento em poucos cliques.',
        'O motor de IA identifica divergências e anomalias automaticamente.',
        'Receba alertas e recomendações priorizadas por impacto financeiro.',
      ],
      screenshotAlt: 'Painel do FaturaLens com indicadores e alertas de fatura',
    },
    testimonials: {
      title: 'Prova social',
      items: [
        { name: 'Camila Souza', role: 'Head Financeiro, LogMobi', quote: 'Reduzimos 38% das inconsistências em 60 dias.' },
        { name: 'Renato Lima', role: 'COO, TransRio', quote: 'A equipe ganhou velocidade e confiança nas conciliações.' },
      ],
    },
    comparison: {
      title: 'Comparativo rápido',
      headers: { criteria: 'Critério', spreadsheet: 'Planilha', genericApps: 'Apps genéricos', faturaLens: 'FaturaLens' },
      rows: [
        { criteria: 'Detecção de anomalias', spreadsheet: 'Manual', genericApps: 'Limitada', faturaLens: 'IA contínua' },
        { criteria: 'Escalabilidade', spreadsheet: 'Baixa', genericApps: 'Média', faturaLens: 'Alta' },
        { criteria: 'Tempo para decisão', spreadsheet: 'Dias', genericApps: 'Horas', faturaLens: 'Minutos' },
      ],
    },
    faq: {
      title: 'Perguntas frequentes',
      items: [
        { question: 'Preciso trocar meu ERP?', answer: 'Não. O FaturaLens integra com seus sistemas existentes via API.' },
        { question: 'Quanto tempo para ativar?', answer: 'A maioria dos clientes ativa o ambiente inicial em menos de uma semana.' },
        { question: 'Há suporte na implantação?', answer: 'Sim, nosso time acompanha onboarding e primeiras análises.' },
      ],
    },
  },
  en: {
    seo: {
      title: 'FaturaLensLP | Cut billing errors with AI',
      description:
        'Automate invoice analysis, detect discrepancies, and speed up financial decisions with FaturaLens.',
    },
    hero: {
      eyebrow: 'Platform for finance operations',
      title: 'Turn billing into actionable insights',
      subtitle:
        'Consolidate data, monitor changes, and make confident decisions in minutes.',
      cta: 'Book a demo',
    },
    form: {
      title: 'Request contact',
      name: 'Full name',
      email: 'Work email',
      company: 'Company',
      submit: 'Send',
      loading: 'Sending...',
      success: 'We got your details! Our team will contact you soon.',
      genericError: 'Could not submit right now. Please try again shortly.',
    },
    howItWorks: {
      title: 'How it works',
      steps: [
        'Connect your billing sources in a few clicks.',
        'Our AI engine detects discrepancies and anomalies automatically.',
        'Get alerts and recommendations prioritized by financial impact.',
      ],
      screenshotAlt: 'FaturaLens dashboard showing billing alerts and KPIs',
    },
    testimonials: {
      title: 'Social proof',
      items: [
        { name: 'Camila Souza', role: 'Finance Lead, LogMobi', quote: 'We reduced inconsistencies by 38% in 60 days.' },
        { name: 'Renato Lima', role: 'COO, TransRio', quote: 'The team now reconciles data with speed and confidence.' },
      ],
    },
    comparison: {
      title: 'Quick comparison',
      headers: { criteria: 'Criteria', spreadsheet: 'Spreadsheet', genericApps: 'Generic apps', faturaLens: 'FaturaLens' },
      rows: [
        { criteria: 'Anomaly detection', spreadsheet: 'Manual', genericApps: 'Limited', faturaLens: 'Continuous AI' },
        { criteria: 'Scalability', spreadsheet: 'Low', genericApps: 'Medium', faturaLens: 'High' },
        { criteria: 'Decision speed', spreadsheet: 'Days', genericApps: 'Hours', faturaLens: 'Minutes' },
      ],
    },
    faq: {
      title: 'Frequently asked questions',
      items: [
        { question: 'Do I need to replace my ERP?', answer: 'No. FaturaLens integrates with your current stack through APIs.' },
        { question: 'How long does setup take?', answer: 'Most customers get the first workspace live in under one week.' },
        { question: 'Is onboarding support included?', answer: 'Yes. Our team supports onboarding and first analyses.' },
      ],
    },
  },
};

export const defaultLocale: Locale = 'pt';
