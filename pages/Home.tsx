
import React, { useState, useMemo } from 'react';
import {
  ChartLineUp,
  VideoCamera,
  TrendUp,
  TrendDown,
  ArrowUpRight,
  CheckCircle,
  Clock,
  Plus,
  CaretDown,
  Note,
  UserPlus,
  CheckSquare,
  Funnel,
  Target,
  Users,
  Kanban,
  Calendar
} from '@phosphor-icons/react';
import { Card, Button, Modal, Toast } from '../components/ui';
import { Task, Lead, Client, SOPItem, Meeting } from '../types';
import { useVanguard } from '../context/VanguardContext';
import { useAuth } from '../context/AuthContext';
import { calculateStockMetrics, calculateFlowMetrics, getTrendColor } from '../utils/metrics';

import { useNavigate } from 'react-router-dom';

export const HomeModule = () => {
  const navigate = useNavigate();

  const {
    clients, tasks, leads, sops, meetings, setProjectFilter,
    addTask, addLead, addClient, addSOP, addMeeting, loading
  } = useVanguard();
  const { user } = useAuth();

  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'task' | 'lead' | 'client' | 'note' | 'meeting' | null>(null);
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Quick Action States
  const [quickTask, setQuickTask] = useState<Partial<Task>>({ title: '', priority: 'media', project: '' });
  const [quickLead, setQuickLead] = useState<Partial<Lead>>({ company: '', value: 0 });
  const [quickClient, setQuickClient] = useState<Partial<Client>>({ name: '', mrr: 0 });
  const [quickNote, setQuickNote] = useState({ title: '', content: '' });
  const [quickMeeting, setQuickMeeting] = useState({ title: '', time: '', type: 'Google Meet', clientId: '' });

  // 1. Minhas Prioridades (Filtradas e Ordenadas)
  const priorities = useMemo(() => {
    return tasks
      .filter(t => t.priority === 'alta' && t.status !== 'concluido')
      .sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1))
      .slice(0, 5);
  }, [tasks]);


  // 2. Agenda de Hoje (Compromissos Reais)
  const agenda = useMemo(() => {
    const isToday = (dateString: string) => {
      const d = new Date(dateString);
      const now = new Date();
      return d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();
    };

    return meetings
      .filter(m => isToday(m.start_time))
      .map(m => {
        const clientName = m.clientId ? clients.find(c => c.id === m.clientId)?.name : null;
        return {
          id: m.id,
          time: new Date(m.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          title: m.title,
          sub: clientName, // New field for UI
          type: m.type,
          isMeeting: true
        };
      });
  }, [meetings]);

  const [showAllAgenda, setShowAllAgenda] = useState(false);
  const displayedAgenda = showAllAgenda ? agenda : agenda.slice(0, 3);


  // 3. Atividade Recente (Dinâmica)
  const recentActivity = useMemo(() => {
    const recentTasks = [...tasks].reverse().slice(0, 3).map(t => ({
      id: t.id,
      type: 'task',
      title: t.title,
      meta: t.status === 'concluido' ? 'Concluída' : 'Nova Tarefa',
      user: (t.assignees && t.assignees.length > 0) ? t.assignees[0] : 'Admin',
      color: 'blue'
    }));

    const recentLeads = [...leads].reverse().slice(0, 2).map(l => ({
      id: l.id,
      type: 'lead',
      title: `Novo Lead: ${l.company}`,
      meta: l.stage,
      user: 'Sistema',
      color: 'green'
    }));

    // Concat and show most recent first (they are already reversed)
    return [...recentTasks, ...recentLeads].slice(0, 5);
  }, [tasks, leads]);

  const [showAllActivity, setShowAllActivity] = useState(false);
  const displayedActivity = showAllActivity ? recentActivity : recentActivity.slice(0, 3);


  // Handlers para Ações Rápidas
  const handleSaveQuickTask = async () => {
    if (!quickTask.title) return;
    setIsSaving(true);
    try {
      await addTask({
        title: quickTask.title,
        priority: quickTask.priority as any,
        project: quickTask.project,
        status: 'a_fazer',
        assignees: ['Admin'],
        dueDate: new Date().toISOString().split('T')[0],
        tag: 'marketing'
      } as unknown as Omit<Task, 'id' | 'user_id' | 'created_at'>);
      setToast({ msg: 'Tarefa criada com sucesso!', type: 'success' });
      setActiveModal(null);
      setQuickTask({ title: '', priority: 'media', project: '' });
    } catch (e) {
      setToast({ msg: 'Erro ao criar tarefa', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveQuickLead = async () => {
    if (!quickLead.company) return;
    setIsSaving(true);
    try {
      await addLead({
        company: quickLead.company,
        value: quickLead.value || 0,
        name: 'Novo Contato',
        stage: 'prospect',
        origin: 'Hub Rápido',
        lastContact: 'Agora'
      } as unknown as Omit<Lead, 'id' | 'user_id' | 'created_at'>);
      setToast({ msg: 'Lead adicionado ao pipeline!', type: 'success' });
      setActiveModal(null);
      setQuickLead({ company: '', value: 0 });
    } catch (e) {
      setToast({ msg: 'Erro ao adicionar lead', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveQuickClient = async () => {
    if (!quickClient.name) return;
    setIsSaving(true);
    try {
      await addClient({
        name: quickClient.name,
        mrr: quickClient.mrr || 0,
        logo: quickClient.name.substring(0, 2).toUpperCase(),
        status: 'onboarding',
        healthScore: 100,
        lastInteraction: 'Agora',
        plan: 'Growth',
        links: [],
        strategy: {}
      } as unknown as Omit<Client, 'id' | 'user_id' | 'created_at'>);
      setToast({ msg: 'Cliente cadastrado!', type: 'success' });
      setActiveModal(null);
      setQuickClient({ name: '', mrr: 0 });
    } catch (e) {
      setToast({ msg: 'Erro ao cadastrar cliente', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveQuickNote = async () => {
    if (!quickNote.title) return;
    setIsSaving(true);
    try {
      await addSOP({
        title: `Nota: ${quickNote.title}`,
        content: quickNote.content,
        category: 'Geral',
        lastUpdated: 'Agora'
      } as unknown as Omit<SOPItem, 'id' | 'user_id' | 'created_at'>);
      setToast({ msg: 'Nota salva em SOP > Geral', type: 'success' });
      setActiveModal(null);
      setQuickNote({ title: '', content: '' });
    } catch (e) {
      setToast({ msg: 'Erro ao salvar nota', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveQuickMeeting = async () => {
    if (!quickMeeting.title || !quickMeeting.time) return;
    setIsSaving(true);
    try {
      const today = new Date();
      const [hours, minutes] = quickMeeting.time.split(':').map(Number);
      const meetingDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);

      await addMeeting({
        title: quickMeeting.title,
        start_time: meetingDate.toISOString(),
        type: quickMeeting.type as any,
        clientId: quickMeeting.clientId || undefined,
        status: 'scheduled',
        description: 'Agendado via Home'
      });
      setToast({ msg: 'Compromisso agendado!', type: 'success' });
      setActiveModal(null);
      setQuickMeeting({ title: '', time: '', type: 'Google Meet', clientId: '' });
    } catch (e) {
      setToast({ msg: 'Erro ao agendar compromisso', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDailyMeet = () => {
    window.open('https://meet.google.com/new', '_blank');
  };

  const handleViewPriorities = () => {
    setProjectFilter('high');
    navigate('/projects');
  };

  const handleViewAllProjects = () => {
    setProjectFilter('all');
    navigate('/projects');
  };

  // KPIs Calculados - Memoized
  const kpis = useMemo(() => {
    // 1. MRR ATIVO (Stock) -> "mrr" field
    const mrrMetrics = calculateStockMetrics(clients, 'mrr', (c) => c.status !== 'cancelado');

    // 2. CLIENTES ATIVOS (Stock) -> Count
    const activeClientsMetrics = calculateStockMetrics(clients, undefined, (c) => c.status !== 'cancelado');

    // 3. PIPELINE (Stock) -> Count
    const pipelineMetrics = calculateStockMetrics(leads); // Assuming all leads are "in pipeline" (open)

    // 4. NOVOS CLIENTES (Flow) -> Count created this month
    const newClientsMetrics = calculateFlowMetrics(clients);

    return [
      {
        label: 'MRR ATIVO',
        value: mrrMetrics.formatted,
        change: mrrMetrics.change,
        trend: mrrMetrics.trend,
        numericTrend: mrrMetrics.numericTrend,
        icon: ChartLineUp,
        target: 'CLIENTS' as const
      },
      {
        label: 'CLIENTES ATIVOS',
        value: activeClientsMetrics.formatted,
        change: activeClientsMetrics.change,
        trend: activeClientsMetrics.trend,
        numericTrend: activeClientsMetrics.numericTrend,
        icon: Users,
        target: 'CLIENTS' as const
      },
      {
        label: 'LEADS NO PIPELINE',
        value: pipelineMetrics.formatted,
        change: pipelineMetrics.change,
        trend: pipelineMetrics.trend,
        numericTrend: pipelineMetrics.numericTrend,
        icon: Funnel,
        target: 'CRM' as const
      },
      {
        label: 'NOVOS CLIENTES',
        value: `+${newClientsMetrics.value}`,
        change: newClientsMetrics.change,
        trend: newClientsMetrics.trend,
        numericTrend: newClientsMetrics.numericTrend,
        icon: UserPlus,
        target: 'CLIENTS' as const
      },
    ];
  }, [clients, leads]);


  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';


  return (
    <div className="space-y-8 relative">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* --- MODAIS DE AÇÃO RÁPIDA --- */}

      <Modal isOpen={activeModal === 'task'} onClose={() => setActiveModal(null)} title="Nova Tarefa Rápida" size="sm">
        <div className="p-6 space-y-4">
          <input className="w-full border p-2 rounded text-sm" placeholder="O que precisa ser feito?" value={quickTask.title} onChange={e => setQuickTask({ ...quickTask, title: e.target.value })} autoFocus />
          <select className="w-full border p-2 rounded text-sm bg-white" value={quickTask.priority} onChange={e => setQuickTask({ ...quickTask, priority: e.target.value as Task['priority'] })}>
            <option value="media">Prioridade Média</option>
            <option value="alta">Alta Prioridade</option>
            <option value="baixa">Baixa Prioridade</option>
          </select>
          <select className="w-full border p-2 rounded text-sm bg-white" value={quickTask.project} onChange={e => setQuickTask({ ...quickTask, project: e.target.value })}>
            <option value="">Vincular a Cliente (Opcional)</option>
            {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <Button onClick={handleSaveQuickTask} className="w-full" disabled={isSaving}>
            {isSaving ? 'Criando...' : 'Criar Tarefa'}
          </Button>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'lead'} onClose={() => setActiveModal(null)} title="Adicionar Lead ao Pipeline" size="sm">
        <div className="p-6 space-y-4">
          <input className="w-full border p-2 rounded text-sm" placeholder="Nome da Empresa" value={quickLead.company} onChange={e => setQuickLead({ ...quickLead, company: e.target.value })} autoFocus />
          <input type="number" className="w-full border p-2 rounded text-sm" placeholder="Valor Estimado (R$)" value={quickLead.value || ''} onChange={e => setQuickLead({ ...quickLead, value: Number(e.target.value) })} />
          <Button onClick={handleSaveQuickLead} className="w-full" disabled={isSaving}>
            {isSaving ? 'Adicionando...' : 'Adicionar Lead'}
          </Button>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'client'} onClose={() => setActiveModal(null)} title="Cadastrar Novo Cliente" size="sm">
        <div className="p-6 space-y-4">
          <input className="w-full border p-2 rounded text-sm" placeholder="Nome do Cliente" value={quickClient.name} onChange={e => setQuickClient({ ...quickClient, name: e.target.value })} autoFocus />
          <input type="number" className="w-full border p-2 rounded text-sm" placeholder="MRR Contratado (R$)" value={quickClient.mrr || ''} onChange={e => setQuickClient({ ...quickClient, mrr: Number(e.target.value) })} />
          <Button onClick={handleSaveQuickClient} className="w-full" disabled={isSaving}>
            {isSaving ? 'Cadastrando...' : 'Cadastrar Cliente'}
          </Button>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'note'} onClose={() => setActiveModal(null)} title="Nova Nota Rápida" size="md">
        <div className="p-6 space-y-4">
          <input className="w-full border p-2 rounded text-sm font-bold" placeholder="Título da Nota" value={quickNote.title} onChange={e => setQuickNote({ ...quickNote, title: e.target.value })} autoFocus />
          <textarea className="w-full border p-2 rounded text-sm h-32 resize-none" placeholder="Digite sua anotação..." value={quickNote.content} onChange={e => setQuickNote({ ...quickNote, content: e.target.value })} />
          <Button onClick={handleSaveQuickNote} className="w-full" disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar Nota'}
          </Button>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'meeting'} onClose={() => setActiveModal(null)} title="Novo Compromisso" size="sm">
        <div className="p-6 space-y-4">
          <input className="w-full border p-2 rounded text-sm" placeholder="Título do Compromisso" value={quickMeeting.title} onChange={e => setQuickMeeting({ ...quickMeeting, title: e.target.value })} autoFocus />
          <input type="time" className="w-full border p-2 rounded text-sm" value={quickMeeting.time} onChange={e => setQuickMeeting({ ...quickMeeting, time: e.target.value })} />
          <select className="w-full border p-2 rounded text-sm bg-white" value={quickMeeting.type} onChange={e => setQuickMeeting({ ...quickMeeting, type: e.target.value })}>
            <option value="Google Meet">Google Meet</option>
            <option value="Interno">Interno</option>
            <option value="Zoom">Zoom</option>
            <option value="Presencial">Presencial</option>
          </select>
          <select className="w-full border p-2 rounded text-sm bg-white" value={quickMeeting.clientId} onChange={e => setQuickMeeting({ ...quickMeeting, clientId: e.target.value })}>
            <option value="">Vincular Cliente (Opcional)</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <Button onClick={handleSaveQuickMeeting} className="w-full" disabled={isSaving}>
            {isSaving ? 'Agendando...' : 'Agendar'}
          </Button>
        </div>
      </Modal>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-vred border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium animate-pulse">Carregando seus dados...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-vblack">{greeting}, {userName}</h1>
              <p className="text-gray-500 mt-1">
                Resumo: Você tem <span className="font-bold text-vred">{priorities.length} tarefas prioritárias</span> exigindo atenção.
              </p>
            </div>
            <div className="flex gap-3 relative">
              <Button onClick={handleDailyMeet} variant="secondary" className="gap-2 text-vblack border-gray-200 font-semibold shadow-sm hover:shadow">
                <VideoCamera size={18} className="text-vred" weight="fill" />
                Daily Meet
              </Button>

              <div className="relative">
                <Button className="gap-2 font-semibold shadow-lg shadow-gray-900/20 pr-3" onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}>
                  <Plus size={16} weight="bold" /> Adicionar <CaretDown size={12} weight="bold" className={`transition-transform ${isActionMenuOpen ? 'rotate-180' : ''}`} />
                </Button>

                {isActionMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-30 animate-in fade-in slide-in-from-top-2">
                    <button onClick={() => { setActiveModal('task'); setIsActionMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-vblack flex items-center gap-2">
                      <CheckSquare size={16} className="text-blue-500" /> Nova Tarefa
                    </button>
                    <button onClick={() => { setActiveModal('lead'); setIsActionMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-vblack flex items-center gap-2">
                      <Target size={16} className="text-orange-500" /> Novo Lead
                    </button>
                    <button onClick={() => { setActiveModal('client'); setIsActionMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-vblack flex items-center gap-2" >
                      <UserPlus size={16} className="text-green-500" /> Novo Cliente
                    </button>
                    <button onClick={() => { setActiveModal('meeting'); setIsActionMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-vblack flex items-center gap-2" >
                      <Calendar size={16} className="text-purple-500" /> Nova Reunião
                    </button>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <button onClick={() => { setActiveModal('note'); setIsActionMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-vblack flex items-center gap-2">
                      <Note size={16} className="text-gray-400" /> Nova Nota
                    </button>
                  </div>
                )}
                {isActionMenuOpen && <div className="fixed inset-0 z-20" onClick={() => setIsActionMenuOpen(false)}></div>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, index) => (
              <Card
                key={index}
                className="p-5 flex flex-col justify-between h-32 hover:border-gray-300 transition-all hover:shadow-md cursor-pointer group select-none"
                onClick={() => {
                  if (kpi.target === 'PROJECTS') setProjectFilter('all');
                  navigate(`/${kpi.target.toLowerCase()}`);
                }}
              >
                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider group-hover:text-vblack transition-colors">
                  <kpi.icon size={16} />
                  {kpi.label}
                </div>
                <div>
                  <div className="text-3xl font-bold text-vblack tracking-tight">{kpi.value}</div>
                  <div className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded text-xs font-bold ${getTrendColor(kpi.numericTrend)}`}>
                    {kpi.trend === 'up' ? <TrendUp weight="bold" /> : kpi.trend === 'down' ? <TrendDown weight="bold" /> : <div className="w-2 h-0.5 bg-gray-400 rounded-full" />}
                    {kpi.change}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card title="Minhas Prioridades" action={<button onClick={handleViewPriorities} className="text-xs font-bold text-gray-500 hover:text-vblack uppercase flex items-center gap-1"><Funnel /> Filtrar Projetos</button>}>
                <div className="space-y-4">
                  {priorities.length > 0 ? priorities.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between group p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer select-none"
                      onClick={handleViewPriorities}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-vred animate-pulse"></div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-vblack">{item.title}</h4>
                            <span className="text-[10px] bg-red-50 text-vred px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Alta Prioridade</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">{item.project || 'Geral'}</span>
                            <span className={`text-xs ${item.dueDate < new Date().toISOString().split('T')[0] ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
                              {item.dueDate < new Date().toISOString().split('T')[0] ? 'Atrasado: ' : 'Prazo: '}{item.dueDate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ArrowUpRight size={18} className="text-gray-300 group-hover:text-vblack transition-colors" />
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-400">
                      <CheckCircle size={32} className="mx-auto mb-2 opacity-50 text-green-500" />
                      <p className="font-medium text-gray-600">Tudo sob controle!</p>
                      <p className="text-xs">Nenhuma tarefa urgente pendente.</p>
                    </div>
                  )}
                </div>
              </Card>

              <div className="bg-transparent pt-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Clock size={20} className="text-gray-400" />
                    <h3 className="text-lg font-bold text-vblack">Atividade Recente</h3>
                  </div>
                  {recentActivity.length > 3 && (
                    <button onClick={() => setShowAllActivity(!showAllActivity)} className="text-xs font-bold text-vred hover:underline uppercase tracking-wider">
                      {showAllActivity ? 'Ver menos' : 'Ver tudo'}
                    </button>
                  )}
                </div>
                <div className="relative pl-2 space-y-8 border-l border-gray-200 ml-2">
                  {displayedActivity.map((act, idx) => (
                    <div
                      key={idx}
                      className="relative pl-6 cursor-pointer hover:opacity-80 transition-opacity select-none"
                      onClick={() => {
                        if (act.type === 'task') {
                          handleViewAllProjects();
                        } else {
                          navigate('/crm');
                        }
                      }}
                    >
                      <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${act.color === 'blue' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                      <p className="text-sm font-medium text-vblack">{act.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{act.meta} • {act.user}</p>
                    </div>
                  ))}
                  {displayedActivity.length === 0 && (
                    <p className="pl-6 text-sm text-gray-400 italic">Nenhuma atividade recente registrada.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <Card
                title="Agenda de Hoje"
                className="h-fit"
                action={agenda.length > 3 && (
                  <button onClick={() => setShowAllAgenda(!showAllAgenda)} className="text-[10px] font-bold text-gray-400 hover:text-vblack uppercase">
                    {showAllAgenda ? 'Ver menos' : 'Ver mais'}
                  </button>
                )}
              >
                <div className="space-y-6 relative">
                  <div className="absolute left-[3px] top-2 bottom-2 w-0.5 bg-gray-100 rounded-full"></div>
                  {displayedAgenda.length > 0 ? displayedAgenda.map((item: any, idx) => (
                    <div
                      key={idx}
                      className={`relative pl-6 ${item.isTask ? 'cursor-pointer hover:bg-gray-50/50 rounded-r-lg transition-colors py-1 -my-1 select-none' : ''}`}
                      onClick={() => item.isTask && handleViewAllProjects()}
                    >
                      <div className={`absolute left-0 top-1.5 w-2 h-2 rounded-full ${item.isTask ? 'bg-blue-400' : 'bg-vred'}`}></div>
                      <p className={`text-xs font-bold mb-0.5 ${item.isTask ? 'text-blue-500' : 'text-vred'}`}>{item.time}</p>
                      <h5 className="text-sm font-bold text-vblack leading-tight">{item.title}</h5>
                      {item.sub && <p className="text-xs text-blue-600 font-semibold mb-0.5">{item.sub}</p>}
                      <div className="flex items-center gap-1.5 mt-1 text-gray-500 text-xs">
                        {item.isTask ? <CheckSquare size={12} weight="fill" /> : <VideoCamera size={12} weight="fill" />}
                        {item.type}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-4 text-gray-400 text-xs">Livre hoje.</div>
                  )}
                </div>
              </Card>

              {priorities.length > 0 && (
                <div
                  className="bg-orange-50 rounded-xl p-6 border border-orange-100 cursor-pointer hover:bg-orange-100/50 transition-colors select-none"
                  onClick={handleViewPriorities}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                      <Clock size={20} weight="fill" />
                    </div>
                    <div>
                      <h4 className="font-bold text-orange-900">Atenção Necessária</h4>
                      <p className="text-sm text-orange-800/80 mt-1 leading-relaxed">
                        Você tem <strong className="text-orange-900">{priorities.length} entregas prioritárias</strong>. Foque nas tarefas listadas acima.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
