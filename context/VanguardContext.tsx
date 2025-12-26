
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    Client, Task, Lead, Campaign, SOPItem, ContentItem,
    PerformanceReport
} from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface VanguardContextType {
    clients: Client[];
    tasks: Task[];
    leads: Lead[];
    campaigns: Campaign[];
    sops: SOPItem[];
    content: ContentItem[];
    performance: PerformanceReport | null;
    loading: boolean;

    // UI State
    projectFilter: 'all' | 'high';
    setProjectFilter: (filter: 'all' | 'high') => void;

    // Actions
    addClient: (client: Omit<Client, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
    updateClient: (client: Client) => Promise<void>;

    addTask: (task: Omit<Task, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
    updateTask: (task: Task) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;

    addLead: (lead: Omit<Lead, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
    updateLead: (lead: Lead) => Promise<void>;
    deleteLead: (id: string) => Promise<void>;

    addContent: (item: Omit<ContentItem, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
    updateContent: (item: ContentItem) => Promise<void>;
    deleteContent: (id: string) => Promise<void>;

    addSOP: (item: Omit<SOPItem, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
    updateSOP: (item: SOPItem) => Promise<void>;
    deleteSOP: (id: string) => Promise<void>;
}

const VanguardContext = createContext<VanguardContextType | undefined>(undefined);

export const VanguardProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [sops, setSops] = useState<SOPItem[]>([]);
    const [content, setContent] = useState<ContentItem[]>([]);
    const [performance, setPerformance] = useState<PerformanceReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [projectFilter, setProjectFilter] = useState<'all' | 'high'>('all');

    const fetchData = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const [
                { data: clientsData },
                { data: tasksData },
                { data: leadsData },
                { data: campaignsData },
                { data: sopsData },
                { data: contentData },
                { data: perfData }
            ] = await Promise.all([
                supabase.from('clients').select('*').order('created_at', { ascending: false }),
                supabase.from('tasks').select('*').order('created_at', { ascending: false }),
                supabase.from('leads').select('*').order('created_at', { ascending: false }),
                supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
                supabase.from('sop_documents').select('*').order('created_at', { ascending: false }),
                supabase.from('content_posts').select('*').order('created_at', { ascending: false }),
                supabase.from('performance_metrics').select('*').maybeSingle()
            ]);

            // Mappers
            const mappedClients = (clientsData || []).map(c => ({
                ...c,
                healthScore: c.health_score || 0,
                lastInteraction: c.created_at ? new Date(c.created_at).toLocaleString('pt-BR') : '',
                strategy: c.strategy || {},
                links: c.links || [],
                salesSnapshot: c.sales_snapshot || {},
                onboardingChecklist: c.onboarding_checklist || []
            }));

            const mappedTasks = (tasksData || []).map(t => ({
                ...t,
                dueDate: t.deadline ? t.deadline.split('T')[0] : '',
                assignee: t.assignee_id ? 'Admin' : 'Unassigned' // Basic mapping for now
            }));

            const mappedLeads = (leadsData || []).map(l => ({
                ...l,
                name: l.contact_name || l.company,
                stage: l.status || 'prospect',
                painPoints: l.pain_points,
                nextMeeting: l.meeting_date,
                timeline: l.history || []
            }));

            const mappedSops = (sopsData || []).map(s => ({
                ...s,
                lastUpdated: s.last_updated ? new Date(s.last_updated).toLocaleDateString('pt-BR') : ''
            }));

            const mappedContent = (contentData || []).map(c => ({
                ...c,
                date: c.publish_date,
                creativeUrl: c.creative_url
            }));

            setClients(mappedClients as Client[]);
            setTasks(mappedTasks as Task[]);
            setLeads(mappedLeads as Lead[]);
            setCampaigns(campaignsData || []);
            setSops(mappedSops as SOPItem[]);
            setContent(mappedContent as ContentItem[]);

            if (perfData) {
                setPerformance({
                    ...perfData,
                    investment: perfData.invested || 0,
                    history: perfData.history || []
                } as any);
            } else {
                setPerformance(null);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    // Actions
    const addClient = async (c: Omit<Client, 'id' | 'user_id' | 'created_at'>) => {
        const payload = {
            name: c.name,
            logo: c.logo,
            mrr: c.mrr,
            status: c.status,
            plan: c.plan,
            health_score: c.healthScore,
            strategy: c.strategy,
            links: c.links,
            sales_snapshot: c.salesSnapshot,
            onboarding_checklist: c.onboardingChecklist,
            user_id: user?.id
        };
        const { data, error } = await supabase.from('clients').insert([payload]).select();
        if (!error && data) {
            const newClient = { ...c, id: data[0].id, created_at: data[0].created_at } as Client;
            setClients(prev => [newClient, ...prev]);
        }
    };

    const updateClient = async (c: Client) => {
        const payload = {
            name: c.name,
            logo: c.logo,
            mrr: c.mrr,
            status: c.status,
            plan: c.plan,
            health_score: c.healthScore,
            strategy: c.strategy,
            links: c.links,
            sales_snapshot: c.salesSnapshot,
            onboarding_checklist: c.onboardingChecklist,
        };
        const { error } = await supabase.from('clients').update(payload).eq('id', c.id);
        if (!error) setClients(prev => prev.map(item => item.id === c.id ? c : item));
    };

    const addTask = async (t: Omit<Task, 'id' | 'user_id' | 'created_at'>) => {
        const payload = {
            title: t.title,
            description: t.description,
            project: t.project,
            status: t.status,
            priority: t.priority,
            deadline: t.dueDate,
            user_id: user?.id
        };
        const { data, error } = await supabase.from('tasks').insert([payload]).select();
        if (!error && data) {
            const newTask = { ...t, id: data[0].id, created_at: data[0].created_at } as Task;
            setTasks(prev => [newTask, ...prev]);
        }
    };

    const updateTask = async (t: Task) => {
        const payload = {
            title: t.title,
            description: t.description,
            project: t.project,
            status: t.status,
            priority: t.priority,
            deadline: t.dueDate,
        };
        const { error } = await supabase.from('tasks').update(payload).eq('id', t.id);
        if (!error) setTasks(prev => prev.map(item => item.id === t.id ? t : item));
    };

    const deleteTask = async (id: string) => {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (!error) setTasks(prev => prev.filter(item => item.id !== id));
    };

    const addLead = async (l: Omit<Lead, 'id' | 'user_id' | 'created_at'>) => {
        const payload = {
            company: l.company,
            contact_name: l.name,
            value: l.value,
            status: l.stage,
            origin: l.origin,
            pain_points: l.painPoints,
            meeting_date: l.nextMeeting,
            history: l.timeline,
            user_id: user?.id
        };
        const { data, error } = await supabase.from('leads').insert([payload]).select();
        if (!error && data) {
            const newLead = { ...l, id: data[0].id, created_at: data[0].created_at } as Lead;
            setLeads(prev => [newLead, ...prev]);
        }
    };

    const updateLead = async (l: Lead) => {
        const payload = {
            company: l.company,
            contact_name: l.name,
            value: l.value,
            status: l.stage,
            origin: l.origin,
            pain_points: l.painPoints,
            meeting_date: l.nextMeeting,
            history: l.timeline,
        };
        const { error } = await supabase.from('leads').update(payload).eq('id', l.id);
        if (!error) setLeads(prev => prev.map(item => item.id === l.id ? l : item));
    };

    const deleteLead = async (id: string) => {
        const { error } = await supabase.from('leads').delete().eq('id', id);
        if (!error) setLeads(prev => prev.filter(item => item.id !== id));
    };

    const addContent = async (c: Omit<ContentItem, 'id' | 'user_id' | 'created_at'>) => {
        const payload = {
            title: c.title,
            client: c.client,
            platform: c.platform,
            format: c.format,
            status: c.status,
            publish_date: c.date,
            creative_url: c.creativeUrl,
            caption: c.caption,
            user_id: user?.id
        };
        const { data, error } = await supabase.from('content_posts').insert([payload]).select();
        if (!error && data) {
            const newItem = { ...c, id: data[0].id, created_at: data[0].created_at } as ContentItem;
            setContent(prev => [newItem, ...prev]);
        }
    };

    const updateContent = async (c: ContentItem) => {
        const payload = {
            title: c.title,
            client: c.client,
            platform: c.platform,
            format: c.format,
            status: c.status,
            publish_date: c.date,
            creative_url: c.creativeUrl,
            caption: c.caption,
        };
        const { error } = await supabase.from('content_posts').update(payload).eq('id', c.id);
        if (!error) setContent(prev => prev.map(item => item.id === c.id ? c : item));
    };

    const deleteContent = async (id: string) => {
        const { error } = await supabase.from('content_posts').delete().eq('id', id);
        if (!error) setContent(prev => prev.filter(item => item.id !== id));
    };

    const addSOP = async (s: Omit<SOPItem, 'id' | 'user_id' | 'created_at'>) => {
        const payload = {
            title: s.title,
            category: s.category,
            content: s.content,
            last_updated: new Date().toISOString(),
            user_id: user?.id
        };
        const { data, error } = await supabase.from('sop_documents').insert([payload]).select();
        if (!error && data) {
            const newItem = { ...s, id: data[0].id, created_at: data[0].created_at, lastUpdated: new Date().toLocaleDateString('pt-BR') } as SOPItem;
            setSops(prev => [newItem, ...prev]);
        }
    };

    const updateSOP = async (s: SOPItem) => {
        const payload = {
            title: s.title,
            category: s.category,
            content: s.content,
            last_updated: new Date().toISOString(),
        };
        const { error } = await supabase.from('sop_documents').update(payload).eq('id', s.id);
        if (!error) setSops(prev => prev.map(item => item.id === s.id ? { ...s, lastUpdated: new Date().toLocaleDateString('pt-BR') } : item));
    };

    const deleteSOP = async (id: string) => {
        const { error } = await supabase.from('sop_documents').delete().eq('id', id);
        if (!error) setSops(prev => prev.filter(item => item.id !== id));
    };

    return (
        <VanguardContext.Provider value={{
            clients, tasks, leads, campaigns, sops, content, performance,
            loading, projectFilter, setProjectFilter,
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
