
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    Client, Task, Lead, Campaign, SOPItem, ContentItem,
    PerformanceReport, Meeting
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
    meetings: Meeting[];
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

    addMeeting: (item: Omit<Meeting, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
    updateMeeting: (item: Meeting) => Promise<void>;
    deleteMeeting: (id: string) => Promise<void>;
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
    const [meetings, setMeetings] = useState<Meeting[]>([]);
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
                { data: perfData },
                { data: meetingsData }
            ] = await Promise.all([
                supabase.from('clients').select('*').order('created_at', { ascending: false }),
                supabase.from('tasks').select('*').order('created_at', { ascending: false }),
                supabase.from('leads').select('*').order('created_at', { ascending: false }),
                supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
                supabase.from('sop_documents').select('*').order('created_at', { ascending: false }),
                supabase.from('content_posts').select('*').order('created_at', { ascending: false }),
                supabase.from('performance_metrics').select('*').maybeSingle(),
                supabase.from('meetings').select('*').order('start_time', { ascending: true })
            ]);

            // Mappers
            const mappedClients = (clientsData || []).map(c => ({
                ...c,
                healthScore: c.health_score || 0,
                lastInteraction: c.created_at ? new Date(c.created_at).toLocaleString('pt-BR') : '',
                strategy: c.strategy || {},
                links: c.links || [],
                salesSnapshot: c.sales_snapshot || {},
                onboardingChecklist: c.onboarding_checklist || [],
                clientRevenue: c.client_revenue_monthly || 0,
                clientRoas: c.client_roas_monthly || 0,
                clientLeads: c.client_leads_monthly || 0
            }));

            const mappedTasks = (tasksData || []).map(t => ({
                ...t,
                dueDate: t.deadline ? t.deadline.split('T')[0] : '',
                assignees: t.assignee_id ? ['Admin'] : [], // Basic mapping for now
                checklist: t.checklist || [],
                timeSpent: t.time_spent || 0,
                difficulty: (t.difficulty as 'baixa' | 'media' | 'alta') || 'media' // Default to media
            }));

            const mappedLeads = (leadsData || []).map(l => ({
                ...l,
                name: l.contact_name || l.company,
                stage: l.status || 'prospect',
                painPoints: l.pain_points,
                nextMeeting: l.meeting_date,
                timeline: l.history || [],
                segment: l.segment || '',
                website: l.website || ''
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
            setMeetings((meetingsData || []) as Meeting[]);

            if (perfData) {
                const mappedPerformance: PerformanceReport = {
                    clientId: perfData.client_id || '', // Start with safe defaults or map correctly
                    month: perfData.month || '',
                    investment: perfData.invested || 0,
                    leads: perfData.leads || 0,
                    sales: perfData.sales || 0,
                    revenue: perfData.revenue || 0,
                    roi: perfData.roi || 0,
                    roas: perfData.roas || 0,
                    cpl: perfData.cpl || 0,
                    cac: perfData.cac || 0,
                    insights: perfData.insights || {
                        bestCampaign: '',
                        worstCampaign: '',
                        bottleneck: '',
                        opportunity: '',
                        recommendations: []
                    },
                    history: perfData.history || []
                };
                setPerformance(mappedPerformance);
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
            client_revenue_monthly: c.clientRevenue,
            client_roas_monthly: c.clientRoas,
            client_leads_monthly: c.clientLeads,
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
            client_revenue_monthly: c.clientRevenue,
            client_roas_monthly: c.clientRoas,
            client_leads_monthly: c.clientLeads,
        };
        const { error } = await supabase.from('clients').update(payload).eq('id', c.id);
        if (!error) setClients(prev => prev.map(item => item.id === c.id ? c : item));
    };

    const addTask = async (t: Omit<Task, 'id' | 'user_id' | 'created_at'>) => {
        const payload = {
            title: t.title,
            description: t.description || '',
            project: t.project || '',
            status: t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1) : 'Todo',
            priority: t.priority ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1) : 'Medium',
            labels: [t.tag, t.difficulty].filter(Boolean),
            deadline: t.dueDate || null,
            assignee_id: user?.id || null,
            checklist: t.checklist || [],
            time_spent: t.timeSpent || 0,
            user_id: user?.id
        };
        const { data, error } = await supabase.from('tasks').insert([payload]).select();
        if (error) {
            console.error('[VANGUARD ERROR] addTask:', JSON.stringify({ error, payload }, null, 2));
            return;
        }
        if (data) {
            const newTask = { ...t, id: data[0].id, created_at: data[0].created_at } as Task;
            setTasks(prev => [newTask, ...prev]);
        }
    };

    const updateTask = async (t: Task) => {
        const payload = {
            title: t.title,
            description: t.description || '',
            project: t.project || '',
            status: t.status,
            priority: t.priority,
            labels: [t.tag, t.difficulty].filter(Boolean),
            deadline: t.dueDate || null,
            assignee_id: user?.id || null,
            checklist: t.checklist || [],
            time_spent: t.timeSpent || 0,
        };
        const { error } = await supabase.from('tasks').update(payload).eq('id', t.id);
        if (error) {
            console.error('[VANGUARD ERROR] updateTask:', JSON.stringify({ error, payload }, null, 2));
            return;
        }
        setTasks(prev => prev.map(item => item.id === t.id ? t : item));
    };

    const deleteTask = async (id: string) => {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (!error) setTasks(prev => prev.filter(item => item.id !== id));
    };

    const addLead = async (l: Omit<Lead, 'id' | 'user_id' | 'created_at'>) => {
        const payload = {
            company: l.company,
            contact_name: l.name,
            value: l.value || 0,
            status: l.stage,
            origin: l.origin || '',
            pain_points: l.painPoints || '',
            meeting_date: l.nextMeeting || null,
            history: l.timeline || [],
            segment: l.segment || '',
            website: l.website || '',
            user_id: user?.id
        };
        const { data, error } = await supabase.from('leads').insert([payload]).select();
        if (error) {
            console.error('[VANGUARD ERROR] addLead:', { error, payload });
            return;
        }
        if (data) {
            const newLead = {
                ...l,
                id: data[0].id,
                created_at: data[0].created_at,
                name: data[0].contact_name || data[0].company,
                stage: data[0].status || 'prospect',
                painPoints: data[0].pain_points,
                nextMeeting: data[0].meeting_date,
                timeline: data[0].history || [],
                segment: data[0].segment || '',
                website: data[0].website || ''
            } as Lead;
            setLeads(prev => [newLead, ...prev]);
        }
    };

    const updateLead = async (l: Lead) => {
        const payload = {
            company: l.company,
            contact_name: l.name,
            value: l.value || 0,
            status: l.stage,
            origin: l.origin || '',
            pain_points: l.painPoints || '',
            meeting_date: l.nextMeeting || null,
            history: l.timeline || [],
            segment: l.segment || '',
            website: l.website || '',
        };
        const { error } = await supabase.from('leads').update(payload).eq('id', l.id);
        if (error) {
            console.error('[VANGUARD ERROR] updateLead:', { error, payload });
            return;
        }
        setLeads(prev => prev.map(item => item.id === l.id ? l : item));
    };

    const deleteLead = async (id: string) => {
        const { error } = await supabase.from('leads').delete().eq('id', id);
        if (!error) setLeads(prev => prev.filter(item => item.id !== id));
    };

    const addContent = async (c: Omit<ContentItem, 'id' | 'user_id' | 'created_at'>) => {
        const payload = {
            title: c.title,
            client: c.client || '',
            platform: c.platform,
            format: c.format,
            status: c.status,
            publish_date: c.date || null,
            assignee_id: user?.id, // Fixed: use assignee_id (uuid) instead of assignee (text)
            creative_url: c.creativeUrl || null,
            caption: c.caption || '',
            user_id: user?.id
        };
        const { data, error } = await supabase.from('content_posts').insert([payload]).select();
        if (error) {
            console.error('[VANGUARD ERROR] addContent:', { error, payload });
            return;
        }
        if (data) {
            const newItem = {
                id: data[0].id,
                created_at: data[0].created_at,
                title: data[0].title,
                client: data[0].client,
                platform: data[0].platform,
                format: data[0].format,
                status: data[0].status,
                date: data[0].publish_date,
                assignee: data[0].assignee,
                creativeUrl: data[0].creative_url,
                caption: data[0].caption
            } as ContentItem;
            setContent(prev => [newItem, ...prev]);
        }
    };

    const updateContent = async (c: ContentItem) => {
        const payload = {
            title: c.title,
            client: c.client || '',
            platform: c.platform,
            format: c.format,
            status: c.status,
            publish_date: c.date || null,
            assignee_id: user?.id,
            creative_url: c.creativeUrl || null,
            caption: c.caption || '',
        };
        const { error } = await supabase.from('content_posts').update(payload).eq('id', c.id);
        if (error) {
            console.error('[VANGUARD ERROR] updateContent:', { error, payload });
            return;
        }
        setContent(prev => prev.map(item => item.id === c.id ? c : item));
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

    const addMeeting = async (m: Omit<Meeting, 'id' | 'user_id' | 'created_at'>) => {
        const payload = {
            title: m.title,
            start_time: m.start_time,
            end_time: m.end_time || null,
            type: m.type,
            link: m.link || null,
            description: m.description || '',
            user_id: user?.id
        };
        const { data, error } = await supabase.from('meetings').insert([payload]).select();
        if (!error && data) {
            const newMeeting = { ...m, id: data[0].id, created_at: data[0].created_at } as Meeting;
            setMeetings(prev => [...prev, newMeeting].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()));
        }
    };

    const updateMeeting = async (m: Meeting) => {
        const payload = {
            title: m.title,
            start_time: m.start_time,
            end_time: m.end_time || null,
            type: m.type,
            link: m.link || null,
            description: m.description || ''
        };
        const { error } = await supabase.from('meetings').update(payload).eq('id', m.id);
        if (!error) setMeetings(prev => prev.map(item => item.id === m.id ? m : item).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()));
    };

    const deleteMeeting = async (id: string) => {
        const { error } = await supabase.from('meetings').delete().eq('id', id);
        if (!error) setMeetings(prev => prev.filter(item => item.id !== id));
    };

    return (
        <VanguardContext.Provider value={{
            clients, tasks, leads, campaigns, sops, content, performance,
            loading, projectFilter, setProjectFilter,
            addClient, updateClient,
            addTask, updateTask, deleteTask,
            addLead, updateLead, deleteLead,
            addContent, updateContent, deleteContent,
            addSOP, updateSOP, deleteSOP,
            meetings, addMeeting, updateMeeting, deleteMeeting
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
