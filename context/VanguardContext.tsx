
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
                supabase.from('performance_metrics').select('*').single()
            ]);

            setClients(clientsData || []);
            setTasks(tasksData || []);
            setLeads(leadsData || []);
            setCampaigns(campaignsData || []);
            setSops(sopsData || []);
            setContent(contentData || []);
            setPerformance(perfData || null);
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
        const { data, error } = await supabase.from('clients').insert([{ ...c, user_id: user?.id }]).select();
        if (!error && data) setClients(prev => [data[0], ...prev]);
    };
    const updateClient = async (c: Client) => {
        const { error } = await supabase.from('clients').update(c).eq('id', c.id);
        if (!error) setClients(prev => prev.map(item => item.id === c.id ? c : item));
    };

    const addTask = async (t: Omit<Task, 'id' | 'user_id' | 'created_at'>) => {
        const { data, error } = await supabase.from('tasks').insert([{ ...t, user_id: user?.id }]).select();
        if (!error && data) setTasks(prev => [data[0], ...prev]);
    };
    const updateTask = async (t: Task) => {
        const { error } = await supabase.from('tasks').update(t).eq('id', t.id);
        if (!error) setTasks(prev => prev.map(item => item.id === t.id ? t : item));
    };
    const deleteTask = async (id: string) => {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (!error) setTasks(prev => prev.filter(item => item.id !== id));
    };

    const addLead = async (l: Omit<Lead, 'id' | 'user_id' | 'created_at'>) => {
        const { data, error } = await supabase.from('leads').insert([{ ...l, user_id: user?.id }]).select();
        if (!error && data) setLeads(prev => [data[0], ...prev]);
    };
    const updateLead = async (l: Lead) => {
        const { error } = await supabase.from('leads').update(l).eq('id', l.id);
        if (!error) setLeads(prev => prev.map(item => item.id === l.id ? l : item));
    };
    const deleteLead = async (id: string) => {
        const { error } = await supabase.from('leads').delete().eq('id', id);
        if (!error) setLeads(prev => prev.filter(item => item.id !== id));
    };

    const addContent = async (c: Omit<ContentItem, 'id' | 'user_id' | 'created_at'>) => {
        const { data, error } = await supabase.from('content_posts').insert([{ ...c, user_id: user?.id }]).select();
        if (!error && data) setContent(prev => [data[0], ...prev]);
    };
    const updateContent = async (c: ContentItem) => {
        const { error } = await supabase.from('content_posts').update(c).eq('id', c.id);
        if (!error) setContent(prev => prev.map(item => item.id === c.id ? c : item));
    };
    const deleteContent = async (id: string) => {
        const { error } = await supabase.from('content_posts').delete().eq('id', id);
        if (!error) setContent(prev => prev.filter(item => item.id !== id));
    };

    const addSOP = async (s: Omit<SOPItem, 'id' | 'user_id' | 'created_at'>) => {
        const { data, error } = await supabase.from('sop_documents').insert([{ ...s, user_id: user?.id }]).select();
        if (!error && data) setSops(prev => [data[0], ...prev]);
    };
    const updateSOP = async (s: SOPItem) => {
        const { error } = await supabase.from('sop_documents').update(s).eq('id', s.id);
        if (!error) setSops(prev => prev.map(item => item.id === s.id ? s : item));
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
