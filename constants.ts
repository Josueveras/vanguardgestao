

import { Client, Lead, Task, PerformanceReport, SOPItem, ContentItem, Campaign, Moonshot } from './types';

export const MOCK_CLIENTS: Client[] = [
  { 
    id: '1', 
    name: 'TechSolutions', 
    logo: 'TE', 
    mrr: 13000, 
    status: 'active', 
    plan: 'Scale', 
    healthScore: 92,
    lastInteraction: '20/11/2023 às 14:00',
    strategy: {
        icp: 'CTOs de empresas SaaS com faturamento > 1M/ano.',
        offer: 'Consultoria de Cloud Optimization com garantia de redução de 20% em custos.',
        channels: 'LinkedIn Ads, Cold Email, Content Marketing.'
    },
    links: [
        { id: '1', title: 'CRM Hubspot', url: 'https://hubspot.com', category: 'CRM' },
        { id: '2', title: 'Dashboard DataStudio', url: 'https://datastudio.google.com', category: 'Analytics' }
    ],
    salesSnapshot: {
        funnelStage: 'Fechamento',
        bottleneck: 'Jurídico',
        conversionRate: 12.5,
        lastReviewDate: '15/11/2023'
    },
    onboardingChecklist: [
        { id: 'c1', text: 'Reunião de Kickoff', completed: true },
        { id: 'c2', text: 'Acesso às contas de anúncios', completed: true },
        { id: 'c3', text: 'Configuração de Pixel', completed: false }
    ]
  },
  { 
    id: '2', 
    name: 'Padaria Alpha', 
    logo: 'AL', 
    mrr: 4500, 
    status: 'onboarding', 
    plan: 'Growth', 
    healthScore: 75,
    lastInteraction: '22/11/2023 às 10:00',
    strategy: {
        icp: 'Moradores do bairro Alpha num raio de 5km.',
        offer: 'Clube de Assinatura de Pães Artesanais.',
        channels: 'Instagram (Local), Google Meu Negócio.'
    }
  },
  { 
    id: '3', 
    name: 'Construtora Elite', 
    logo: 'EL', 
    mrr: 25000, 
    status: 'risk', 
    plan: 'Enterprise', 
    healthScore: 45,
    lastInteraction: '21/11/2023 às 16:00',
    nextMeeting: '2023-11-28T14:00:00'
  },
];

export const MOCK_CAMPAIGNS: Campaign[] = [
    { id: 'c1', clientId: '1', name: '[Search] Institucional', platform: 'Google Ads', status: 'Ativa', spend: 1500, roas: 5.2, ctr: 4.5, cpa: 45.00 },
    { id: 'c2', clientId: '1', name: '[Display] Remarketing', platform: 'Google Ads', status: 'Ativa', spend: 800, roas: 3.1, ctr: 1.2, cpa: 60.00 },
    { id: 'c3', clientId: '1', name: '[LI] Lead Gen Forms', platform: 'LinkedIn Ads', status: 'Pausada', spend: 2000, roas: 2.1, ctr: 0.8, cpa: 120.00 },
    { id: 'c4', clientId: '2', name: '[IG] Reels Delivery', platform: 'Meta Ads', status: 'Ativa', spend: 500, roas: 4.0, ctr: 2.1, cpa: 15.00 },
];

export const MOCK_LEADS: Lead[] = [
  { 
      id: '1', 
      name: 'João Silva', 
      role: 'Diretor Comercial',
      company: 'Construtora Beta', 
      segment: 'Construção Civil',
      city: 'São Paulo/SP',
      value: 12000, 
      stage: 'proposta', 
      origin: 'Indicação', 
      lastContact: '2h atrás',
      maturity: 'Alta',
      painPoints: 'Baixa qualificação dos leads vindos do Google Ads.',
      timeline: [
          { id: 't1', type: 'creation', date: '2023-10-01', author: 'Sistema', description: 'Lead criado via Indicação' },
          { id: 't2', type: 'status_change', date: '2023-10-05', author: 'Admin', description: 'Moveu para Qualificação' }
      ]
  },
  { 
      id: '2', 
      name: 'Maria Souza', 
      company: 'E-commerce Beauty', 
      role: 'CEO',
      value: 4500, 
      stage: 'diagnostico', 
      origin: 'Meta Ads', 
      lastContact: '1d atrás',
      buyingMoment: 'Comparação',
      timeline: []
  },
  { 
      id: '3', 
      name: 'Pedro Santos', 
      company: 'SaaS Financeiro', 
      value: 25000, 
      stage: 'qualificacao', 
      origin: 'Google Ads', 
      lastContact: '3d atrás',
      timeline: [] 
  },
  { 
      id: '4', 
      name: 'Ana Costa', 
      company: 'Varejo X', 
      value: 3000, 
      stage: 'prospect', 
      origin: 'Outbound', 
      lastContact: '5d atrás',
      timeline: [] 
  },
  { 
      id: '5', 
      name: 'Lucas Lima', 
      company: 'Agro Tech', 
      value: 50000, 
      stage: 'fechado', 
      origin: 'Evento', 
      lastContact: '1sem atrás',
      timeline: [] 
  },
];

export const MOCK_TASKS: Task[] = [
  { 
      id: '1', 
      title: 'Criar Landing Page Black Friday', 
      description: 'Desenvolver LP focada em conversão para a campanha de Black Friday. Incluir contador regressivo e prova social.',
      project: 'E-commerce Beauty', 
      status: 'doing', 
      priority: 'high', 
      tag: 'tech', 
      assignee: 'Dev Lead', 
      dueDate: 'Hoje' 
  },
  { 
      id: '2', 
      title: 'Revisar Criativos Mensais', 
      description: 'Aprovar o pacote de 12 artes para redes sociais referente ao mês de Dezembro.',
      project: 'Bakery House', 
      status: 'review', 
      priority: 'medium', 
      tag: 'marketing', 
      assignee: 'Designer', 
      dueDate: 'Amanhã' 
  },
  { 
      id: '3', 
      title: 'Configurar CRM PipeDrive', 
      description: 'Implementar funil de vendas padrão e integrar com formulário do site.',
      project: 'Dr. Silva', 
      status: 'todo', 
      priority: 'high', 
      tag: 'sales', 
      assignee: 'Consultor', 
      dueDate: '15 Nov' 
  },
  { 
      id: '4', 
      title: 'Relatório Mensal', 
      description: 'Compilar dados de performance de Ads e enviar para o cliente via email.',
      project: 'TechSolution', 
      status: 'done', 
      priority: 'low', 
      tag: 'marketing', 
      assignee: 'Account', 
      dueDate: '01 Nov' 
  },
];

export const MOCK_PERFORMANCE: PerformanceReport = {
  clientId: '1',
  month: 'Outubro 2023',
  investment: 15000,
  leads: 450,
  sales: 28,
  revenue: 145000,
  roi: 866, 
  roas: 9.6,
  cpl: 33.33,
  cac: 535.71,
  insights: {
    bestCampaign: '[Meta] Scale_Advantage+',
    worstCampaign: '[Google] Institucional_Amplo',
    bottleneck: 'Baixa conversão de agendamento para comparecimento (No-show de 40%)',
    opportunity: 'Aumentar verba em Stories (CPL 20% menor que Feed)',
    recommendations: [
      'Implementar automação de confirmação via WhatsApp para reduzir No-shows.',
      'Redistribuir 15% da verba do Google para Meta Ads Stories.',
      'Testar novos criativos de prova social em vídeo.'
    ]
  },
  history: [
    { month: 'Jul', revenue: 80000, investment: 10000 },
    { month: 'Ago', revenue: 95000, investment: 12000 },
    { month: 'Set', revenue: 110000, investment: 12000 },
    { month: 'Out', revenue: 145000, investment: 15000 },
  ]
};

export const MOCK_SOP: SOPItem[] = [
  { 
      id: '1', 
      title: 'Checklist Onboarding Cliente Novo', 
      category: 'Onboarding', 
      lastUpdated: '2 dias atrás',
      content: '1. Criar grupo no WhatsApp\n2. Enviar formulário de onboarding\n3. Agendar Kickoff\n4. Solicitar acessos (Google, Meta, Analytics)'
  },
  { 
      id: '2', 
      title: 'Script de Qualificação (SDR)', 
      category: 'Vendas', 
      lastUpdated: '1 semana atrás',
      content: 'Introdução: "Olá, falo com..."\n\nPerguntas de SPIN Selling:\n- Situação: Como vocês geram leads hoje?\n- Problema: Qual o maior gargalo?\n- Implicação: O quanto isso custa?\n- Necessidade: Se resolvermos isso, qual o impacto?'
  },
  { 
      id: '3', 
      title: 'Padrão de Tagueamento UTM', 
      category: 'Técnico', 
      lastUpdated: '1 mês atrás',
      content: 'utm_source: google, facebook, instagram\nutm_medium: cpc, organic, social\nutm_campaign: [objetivo]_[nome]\nutm_content: [formato]_[variacao]'
  },
  { 
      id: '4', 
      title: 'Playbook de Crise em Redes Sociais', 
      category: 'Geral', 
      lastUpdated: '3 meses atrás',
      content: '1. Não apague o comentário (salvo ofensa grave)\n2. Responda publicamente pedindo contato inbox\n3. Leve para o privado\n4. Documente a resolução'
  },
];

export const MOCK_CONTENT: ContentItem[] = [
  { id: '1', title: 'Carrossel: 5 Dicas de Investimento', client: 'TechSolutions', platform: 'instagram', format: 'carousel', status: 'production', date: '25 Nov', assignee: 'Designer' },
  { id: '2', title: 'Reels: Bastidores da Obra', client: 'Construtora Elite', platform: 'instagram', format: 'video', status: 'review', date: '26 Nov', assignee: 'Videomaker' },
  { id: '3', title: 'Artigo: Tendências de Mercado 2024', client: 'TechSolutions', platform: 'linkedin', format: 'article', status: 'scheduled', date: '28 Nov', assignee: 'Copywriter' },
  { id: '4', title: 'Story: Enquete Pães Artesanais', client: 'Padaria Alpha', platform: 'instagram', format: 'stories', status: 'idea', date: '30 Nov', assignee: 'Social Media' },
  { id: '5', title: 'Vídeo Institucional: Quem somos', client: 'Construtora Elite', platform: 'youtube', format: 'video', status: 'briefing', date: '05 Dez', assignee: 'Videomaker' },
  { id: '6', title: 'Carrossel: Benefícios do Pão Fermentação Natural', client: 'Padaria Alpha', platform: 'instagram', format: 'carousel', status: 'published', date: '20 Nov', assignee: 'Designer' },
];

export const MOCK_MOONSHOTS: Moonshot[] = [
    {
        id: '1',
        codename: 'Project Orion',
        objective: 'Dominar o mercado LATAM de SaaS',
        impact: '100x',
        probability: 45,
        status: 'orbit',
        progress: 68
    },
    {
        id: '2',
        codename: 'Deep Dive',
        objective: 'Aquisição de concorrente direto',
        impact: '10x',
        probability: 78,
        status: 'landing',
        progress: 92
    },
    {
        id: '3',
        codename: 'Velocity',
        objective: 'Automatização total de vendas via AI',
        impact: '100x',
        probability: 20,
        status: 'ignition',
        progress: 15
    }
];