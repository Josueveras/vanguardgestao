
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
    Client, Task, Lead, Campaign, SOPItem, ContentItem, 
    PerformanceReport 
} from '../types';
import { 
    MOCK_CLIENTS, MOCK_TASKS, MOCK_LEADS, MOCK_CAMPAIGNS, 
    MOCK_SOP, MOCK_CONTENT, MOCK_PERFORMANCE 
} from '../constants';

interface VanguardContextType {
    clients: Client[];
    tasks: Task[];
    leads: Lead[];
    campaigns: Campaign[];
    sops: SOPItem[];
    content: ContentItem[];
    performance: PerformanceReport;
    
    // UI State
    projectFilter: 'all' | 'high';
    setProjectFilter: (filter: 'all' | 'high') => void;

    // Actions
    addClient: (client: Client) => void;
    updateClient: (client: Client) => void;
    
    addTask: (task: Task) => void;
    updateTask: (task: Task) => void;
    deleteTask: (id: string) => void;

    addLead: (lead: Lead) => void;
    updateLead: (lead: Lead) => void;
    deleteLead: (id: string) => void;

    addContent: (item: ContentItem) => void;
    updateContent: (item: ContentItem) => void;
    deleteContent: (id: string) => void;

    addSOP: (item: SOPItem) => void;
    updateSOP: (item: SOPItem) => void;
    deleteSOP: (id: string) => void;
}

const VanguardContext = createContext<VanguardContextType | undefined>(undefined);

// Helper to load from LocalStorage or fallback to Mocks
function loadState<T>(key: string, fallback: T): T {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch (e) {
        console.warn(`Error loading ${key} from localStorage`, e);
        return fallback;
    }
}

export const VanguardProvider = ({ children }: { children: ReactNode }) => {
    // State Initialization
    const [clients, setClients] = useState<Client[]>(() => loadState('vg_clients', MOCK_CLIENTS));
    const [tasks, setTasks] = useState<Task[]>(() => loadState('vg_tasks', MOCK_TASKS));
    const [leads, setLeads] = useState<Lead[]>(() => loadState('vg_leads', MOCK_LEADS));
    const [campaigns, setCampaigns] = useState<Campaign[]>(() => loadState('vg_campaigns', MOCK_CAMPAIGNS));
    const [sops, setSops] = useState<SOPItem[]>(() => loadState('vg_sops', MOCK_SOP));
    const [content, setContent] = useState<ContentItem[]>(() => loadState('vg_content', MOCK_CONTENT));
    const [performance, setPerformance] = useState<PerformanceReport>(() => loadState('vg_performance', MOCK_PERFORMANCE));

    // UI State
    const [projectFilter, setProjectFilter] = useState<'all' | 'high'>('all');

    // Persistence Effects
    useEffect(() => localStorage.setItem('vg_clients', JSON.stringify(clients)), [clients]);
    useEffect(() => localStorage.setItem('vg_tasks', JSON.stringify(tasks)), [tasks]);
    useEffect(() => localStorage.setItem('vg_leads', JSON.stringify(leads)), [leads]);
    useEffect(() => localStorage.setItem('vg_campaigns', JSON.stringify(campaigns)), [campaigns]);
    useEffect(() => localStorage.setItem('vg_sops', JSON.stringify(sops)), [sops]);
    useEffect(() => localStorage.setItem('vg_content', JSON.stringify(content)), [content]);
    useEffect(() => localStorage.setItem('vg_performance', JSON.stringify(performance)), [performance]);

    // Actions
    const addClient = (c: Client) => setClients(prev => [...prev, c]);
    const updateClient = (c: Client) => setClients(prev => prev.map(item => item.id === c.id ? c : item));

    const addTask = (t: Task) => setTasks(prev => [...prev, t]);
    const updateTask = (t: Task) => setTasks(prev => prev.map(item => item.id === t.id ? t : item));
    const deleteTask = (id: string) => setTasks(prev => prev.filter(item => item.id !== id));

    const addLead = (l: Lead) => setLeads(prev => [...prev, l]);
    const updateLead = (l: Lead) => setLeads(prev => prev.map(item => item.id === l.id ? l : item));
    const deleteLead = (id: string) => setLeads(prev => prev.filter(item => item.id !== id));

    const addContent = (c: ContentItem) => setContent(prev => [...prev, c]);
    const updateContent = (c: ContentItem) => setContent(prev => prev.map(item => item.id === c.id ? c : item));
    const deleteContent = (id: string) => setContent(prev => prev.filter(item => item.id !== id));

    const addSOP = (s: SOPItem) => setSops(prev => [...prev, s]);
    const updateSOP = (s: SOPItem) => setSops(prev => prev.map(item => item.id === s.id ? s : item));
    const deleteSOP = (id: string) => setSops(prev => prev.filter(item => item.id !== id));

    return (
        <VanguardContext.Provider value={{
            clients, tasks, leads, campaigns, sops, content, performance,
            projectFilter, setProjectFilter,
            addClient, updateClient,
            addTask, updateTask, deleteTask,
            addLead, updateLead, deleteLead,
            addContent, updateContent, deleteContent,
            addSOP, updateSOP, deleteSOP
        }}>
            {children}
        </VanguardContext.Provider>
    );
};

export const useVanguard = () => {
    const context = useContext(VanguardContext);
    if (context === undefined) {
        throw new Error('useVanguard must be used within a VanguardProvider');
    }
    return context;
};
