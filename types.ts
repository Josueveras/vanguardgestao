

export type ViewState = 'HOME' | 'CRM' | 'CLIENTS' | 'PROJECTS' | 'PERFORMANCE' | 'SOP' | 'MEDIA' | 'SETTINGS';

export interface ClientLink {
  id: string;
  title: string;
  url: string;
  category: 'CRM' | 'Ads' | 'Analytics' | 'Drive' | 'Site' | 'Outros';
}

export interface ClientStrategy {
  icp?: string;
  offer?: string;
  channels?: string;
  plan30_60_90?: string;
}

export interface ClientSalesSnapshot {
  funnelStage: string;
  bottleneck: string;
  conversionRate: number;
  lastReviewDate: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Client {
  id: string;
  name: string;
  logo: string;
  mrr: number;
  status: 'ativo' | 'cancelado' | 'onboarding' | 'em_risco';
  plan: string;
  healthScore: number;
  lastInteraction: string;
  // New fields for Profile
  strategy?: ClientStrategy;
  links?: ClientLink[];
  salesSnapshot?: ClientSalesSnapshot;
  onboardingChecklist?: ChecklistItem[];
  nextMeeting?: string;
  // New metrics fields
  clientRevenue?: number;
  clientRoas?: number;
  clientLeads?: number;
}

export interface Campaign {
  id: string;
  clientId: string;
  name: string;
  platform: 'Google Ads' | 'Meta Ads' | 'TikTok Ads' | 'LinkedIn Ads';
  status: 'Ativa' | 'Pausada';
  spend: number;
  roas: number;
  ctr: number;
  cpa: number;
}

export interface LeadHistoryItem {
  id: string;
  type: 'creation' | 'status_change' | 'note' | 'contact' | 'update';
  date: string; // ISO
  author: string;
  description: string;
}

export interface Lead {
  id: string;
  // Basic Data
  company: string;
  segment?: string;
  size?: string;
  city?: string;
  website?: string;

  // Value & Stage
  value: number;
  stage: 'prospect' | 'qualificacao' | 'diagnostico' | 'proposta' | 'fechado';
  leadScore?: number; // 0 to 100

  // Primary Contact
  name: string; // Contact Name
  role?: string;
  phone?: string;
  email?: string;
  lastContact: string;

  // Diagnosis (ICP)
  origin: string;
  maturity?: 'Baixa' | 'Média' | 'Alta';
  budget?: number; // Estimated budget
  buyingMoment?: 'Pesquisa' | 'Comparação' | 'Decisão';
  tools?: string;
  infrastructure?: string;
  painPoints?: string;

  // Scheduling
  nextMeeting?: string; // ISO Date

  // Extras
  timeline?: LeadHistoryItem[];
  notes?: string;
}

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  author: string;
  text: string;
  date: string; // ISO
}

export interface Task {
  id: string;
  title: string;
  description?: string; // Added description
  project: string;
  status: 'a_fazer' | 'fazendo' | 'revisao' | 'concluido';
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  tag: 'marketing' | 'tecnologia' | 'vendas';
  assignees: string[];
  dueDate: string;
  checklist?: ChecklistItem[];
  subtasks?: Subtask[];
  comments?: TaskComment[];
  timeSpent?: number; // in seconds
}

export interface KPIMetric {
  label: string;
  value: string | number;
  change: number; // percentage
  trend: 'up' | 'down' | 'neutral';
  prefix?: string;
  suffix?: string;
}

export interface PerformanceReport {
  clientId: string;
  month: string;
  investment: number;
  leads: number;
  sales: number;
  revenue: number;
  roi: number;
  roas: number;
  cpl: number;
  cac: number;
  insights: {
    bestCampaign: string;
    worstCampaign: string;
    bottleneck: string;
    opportunity: string;
    recommendations: string[];
  };
  history: {
    month: string;
    revenue: number;
    investment: number;
  }[];
}

export interface SOPItem {
  id: string;
  title: string;
  category: 'Onboarding' | 'Vendas' | 'Técnico' | 'Geral';
  lastUpdated: string;
  content?: string; // Content of the SOP
}

export interface ContentItem {
  id: string;
  title: string;
  client: string;
  platform: 'instagram' | 'linkedin' | 'tiktok' | 'youtube' | 'blog';
  format: 'imagem' | 'video' | 'carrossel' | 'artigo' | 'stories';
  status: 'ideia' | 'briefing' | 'producao' | 'revisao' | 'agendado' | 'publicado';
  date: string; // ISO or display date
  assignee: string;
  creativeUrl?: string; // Added for visual preview
  caption?: string; // New Field for Post Caption
}

export interface Moonshot {
  id: string;
  codename: string;
  objective: string;
  impact: string;
  probability: number;
  status: 'ignition' | 'orbit' | 'landing' | 'abort';
  progress: number;
}