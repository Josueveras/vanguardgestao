import { Client, Lead, Task, PerformanceReport, SOPItem, ContentItem, Campaign, Moonshot } from './types';

// Arrays vazios - sistema inicia sem dados de exemplo
export const MOCK_CLIENTS: Client[] = [];

export const MOCK_CAMPAIGNS: Campaign[] = [];

export const MOCK_LEADS: Lead[] = [];

export const MOCK_TASKS: Task[] = [];

export const MOCK_SOP: SOPItem[] = [];

export const MOCK_CONTENT: ContentItem[] = [];

export const MOCK_MOONSHOTS: Moonshot[] = [];

// Performance zerada - mantém estrutura da interface
export const MOCK_PERFORMANCE: PerformanceReport = {
    clientId: '',
    month: '',
    investment: 0,
    leads: 0,
    sales: 0,
    revenue: 0,
    roi: 0,
    roas: 0,
    cpl: 0,
    cac: 0,
    insights: {
        bestCampaign: '',
        worstCampaign: '',
        bottleneck: '',
        opportunity: '',
        recommendations: []
    },
    history: []
};