
import React, { useState, useMemo } from 'react';
import { Client, Task, ContentItem, ClientLink, ClientStrategy, Campaign, ChecklistItem, ClientSalesSnapshot } from '../types';
import {
    ArrowLeft, Target, Strategy, CheckCircle, ChartLineUp, Link as LinkIcon,
    CalendarCheck, Check, PencilSimple, Plus, Trash, ArrowSquareOut,
    TrendUp, CurrencyDollar, Users, RocketLaunch, MagicWand, Files, FloppyDisk,
    CircleNotch, ListChecks, Megaphone, MonitorPlay, ImageSquare, X
} from '@phosphor-icons/react';
import { Toast, Modal } from '../components/ui';

// --- Sub-components (Memoized) ---

const StrategyBlock = React.memo(({ title, content, isEditing, onChange }: { title: string, content?: string, isEditing: boolean, onChange: (val: string) => void }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
        <h4 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-50">{title}</h4>
        {isEditing ? (
            <textarea
                className="w-full flex-1 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-black/10 outline-none resize-none bg-gray-50 focus:bg-white transition-colors"
                value={content || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`Defina o ${title}...`}
                rows={4}
            />
        ) : (
            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap flex-1">
                {content || <span className="text-gray-400 italic">Não definido.</span>}
            </div>
        )}
    </div>
));

const LinkCard: React.FC<{ link: ClientLink; onDelete: (id: string) => void }> = React.memo(({ link, onDelete }) => (
    <div className="bg-white border border-gray-200 p-5 rounded-xl flex items-center justify-between hover:shadow-md transition-all group">
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${link.category === 'CRM' ? 'bg-blue-50 text-blue-600' : link.category === 'Ads' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                {link.category === 'CRM' ? <Users size={24} weight="duotone" /> : <LinkIcon size={24} weight="duotone" />}
            </div>
            <div>
                <h4 className="font-bold text-gray-900 text-base">{link.title}</h4>
                <a href={link.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline truncate block max-w-[200px] flex items-center gap-1 font-medium mt-0.5">
                    {link.url} <ArrowSquareOut size={12} />
                </a>
            </div>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onDelete(link.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash size={18} /></button>
        </div>
    </div>
));

const CampaignCard: React.FC<{ campaign: Campaign }> = React.memo(({ campaign }) => {
    const isGoogle = campaign.platform.includes('Google');
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${isGoogle ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                        {isGoogle ? <MonitorPlay size={24} weight="fill" /> : <Megaphone size={24} weight="fill" />}
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-base">{campaign.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide mt-1 inline-block ${campaign.status === 'Ativa' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{campaign.status}</span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Gasto</p>
                    <p className="font-bold text-gray-900 text-lg">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(campaign.spend)}</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">ROAS</p>
                    <p className={`font-bold text-lg ${campaign.roas >= 4 ? 'text-green-600' : 'text-gray-900'}`}>{campaign.roas}x</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">CTR</p>
                    <p className="font-bold text-gray-900">{campaign.ctr}%</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">CPA</p>
                    <p className="font-bold text-gray-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(campaign.cpa)}</p>
                </div>
            </div>
        </div>
    );
});

const KPICard = React.memo(({ label, value, icon: Icon, bgClass, colorClass }: any) => (
    <div className={`p-5 rounded-xl border border-transparent hover:border-gray-100 transition-all ${bgClass} bg-opacity-30`}>
        <div className="flex items-center gap-2 mb-2">
            <Icon size={18} className={colorClass} weight="duotone" />
            <span className={`text-xs font-bold uppercase tracking-wider ${colorClass}`}>{label}</span>
        </div>
        <p className={`text-2xl font-bold ${colorClass.replace('text-', 'text-vblack')}`}>{value}</p>
    </div>
));

// --- Main Component ---

interface ClientProfileProps {
    client: Client;
    onBack: () => void;
    onUpdateClient: (updatedClient: Client) => void;
    tasks: Task[];
    content: ContentItem[];
    campaigns: Campaign[];
}

export const ClientProfile: React.FC<ClientProfileProps> = ({ client, onBack, onUpdateClient, tasks, content, campaigns }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'strategy' | 'operation' | 'tasks' | 'campaigns' | 'performance' | 'links'>('overview');
    const [isEditingStrategy, setIsEditingStrategy] = useState(false);
    const [localStrategy, setLocalStrategy] = useState<ClientStrategy>(client.strategy || {});
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
    const [aiInsight, setAiInsight] = useState('');
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);

    // Links State
    const [newLinkModalOpen, setNewLinkModalOpen] = useState(false);
    const [newLinkData, setNewLinkData] = useState<Partial<ClientLink>>({ category: 'Outros' });

    // Snapshot Edit State
    const [isEditingSnapshot, setIsEditingSnapshot] = useState(false);
    const [snapshotData, setSnapshotData] = useState<ClientSalesSnapshot>(client.salesSnapshot || { funnelStage: '', bottleneck: '', conversionRate: 0, lastReviewDate: '' });

    // Checklist State
    const [checklist, setChecklist] = useState<ChecklistItem[]>(client.onboardingChecklist || []);
    const [newItemText, setNewItemText] = useState('');

    // --- Derived Data ---
    const clientTasks = useMemo(() => tasks.filter(t => t.project === client.name), [tasks, client.name]);
    const clientContent = useMemo(() => content.filter(c => c.client === client.name), [content, client.name]);
    const clientCampaigns = useMemo(() => campaigns.filter(c => c.clientId === client.id), [campaigns, client.id]);

    const checklistProgress = useMemo(() => {
        if (checklist.length === 0) return 0;
        const completed = checklist.filter(c => c.completed).length;
        return Math.round((completed / checklist.length) * 100);
    }, [checklist]);

    // --- Handlers ---

    const handleSaveStrategy = () => {
        const updatedClient = { ...client, strategy: localStrategy };
        onUpdateClient(updatedClient);
        setIsEditingStrategy(false);
        setToast({ msg: 'Estratégia atualizada!', type: 'success' });
    };

    const handleSaveSnapshot = () => {
        const updatedSnapshot = { ...snapshotData, lastReviewDate: new Date().toLocaleDateString('pt-BR') };
        const updatedClient = { ...client, salesSnapshot: updatedSnapshot };

        setSnapshotData(updatedSnapshot);
        onUpdateClient(updatedClient);

        setIsEditingSnapshot(false);
        setToast({ msg: 'Snapshot de vendas salvo!', type: 'success' });
    };

    const handleAddLink = () => {
        if (!newLinkData.title || !newLinkData.url) return;
        const newLink = { ...newLinkData, id: `lnk-${Date.now()}` } as ClientLink;
        const updatedLinks = [...(client.links || []), newLink];
        const updatedClient = { ...client, links: updatedLinks };

        onUpdateClient(updatedClient);
        setNewLinkModalOpen(false);
        setNewLinkData({ category: 'Outros', title: '', url: '' });
        setToast({ msg: 'Link adicionado!', type: 'success' });
    };

    const handleDeleteLink = (id: string) => {
        const updatedLinks = (client.links || []).filter(l => l.id !== id);
        const updatedClient = { ...client, links: updatedLinks };
        onUpdateClient(updatedClient);
        setToast({ msg: 'Link removido.', type: 'success' });
    };

    // --- Checklist Manipulation ---
    const saveChecklist = (newChecklist: ChecklistItem[]) => {
        setChecklist(newChecklist);
        const updatedClient = { ...client, onboardingChecklist: newChecklist };
        onUpdateClient(updatedClient);
    };

    const handleToggleChecklist = (itemId: string) => {
        const updated = checklist.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item);
        saveChecklist(updated);
    };

    const handleAddItem = () => {
        if (!newItemText.trim()) return;
        const newItem: ChecklistItem = { id: `cl-${Date.now()}`, text: newItemText, completed: false };
        saveChecklist([...checklist, newItem]);
        setNewItemText('');
    };

    const handleDeleteItem = (itemId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = checklist.filter(i => i.id !== itemId);
        saveChecklist(updated);
    };

    const handleAnalyzeAi = () => {
        setIsGeneratingAi(true);
        setTimeout(() => {
            setAiInsight(`Análise concluída para ${client.name}. O sistema está processando as métricas de performance mais recentes para gerar recomendações personalizadas.`);
            setIsGeneratingAi(false);
        }, 1500);
    };

    const healthColor = (score: number = 0) => {
        if (score >= 80) return 'text-green-500 border-green-200';
        if (score >= 50) return 'text-yellow-500 border-yellow-200';
        return 'text-red-500 border-red-200';
    };

    return (
        <div className="flex flex-col h-full bg-[#f8f9fa] overflow-y-auto rounded-xl">
            {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            <Modal isOpen={newLinkModalOpen} onClose={() => setNewLinkModalOpen(false)} title="Adicionar Link" size="sm">
                <div className="p-6 space-y-4">
                    <input className="w-full border p-3 rounded-lg text-sm" placeholder="Título (ex: Pasta Drive)" value={newLinkData.title || ''} onChange={e => setNewLinkData({ ...newLinkData, title: e.target.value })} />
                    <input className="w-full border p-3 rounded-lg text-sm" placeholder="URL (https://...)" value={newLinkData.url || ''} onChange={e => setNewLinkData({ ...newLinkData, url: e.target.value })} />
                    <select className="w-full border p-3 rounded-lg text-sm bg-white" value={newLinkData.category} onChange={e => setNewLinkData({ ...newLinkData, category: e.target.value as any })}>
                        {['CRM', 'Ads', 'Analytics', 'Drive', 'Site', 'Outros'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button onClick={handleAddLink} className="w-full bg-vblack text-white py-3 rounded-lg font-bold hover:bg-gray-800">Salvar Link</button>
                </div>
            </Modal>

            {/* Header (War Room Style) */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm px-6 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-5">
                    <button onClick={onBack} className="p-2.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors border border-gray-200"><ArrowLeft size={20} weight="bold" /></button>
                    <div className="w-16 h-16 rounded-xl border border-gray-100 shadow-sm bg-gray-900 flex items-center justify-center text-white text-xl font-bold">
                        {client.logo}
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight tracking-tight">{client.name}</h1>
                        <div className="flex items-center gap-3 mt-1 text-sm font-medium text-gray-500">
                            <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${client.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>{client.status === 'active' ? 'Ativo' : client.status}</span>
                            <span className="text-gray-400">•</span>
                            <span>{client.plan}</span>
                            <span className="text-gray-400">•</span>
                            <span className="flex items-center gap-1 font-bold text-gray-900"><CurrencyDollar weight="fill" className="text-gray-400" /> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.mrr)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Saúde da Conta</span>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white ${healthColor(client.healthScore)}`}>
                            <span className="text-xl font-bold leading-none">{client.healthScore || 0}</span>
                            <span className="text-xs font-medium text-gray-400">/ 100</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {client.links?.find(l => l.category === 'CRM') && (
                            <a href={client.links.find(l => l.category === 'CRM')?.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition-colors text-sm border border-blue-100">
                                <Users weight="fill" size={18} /> CRM
                            </a>
                        )}
                        <button onClick={() => setActiveTab('tasks')} className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors text-sm shadow-md">
                            <Plus weight="bold" size={16} /> Criar Task
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-gray-200 px-6 overflow-x-auto flex-shrink-0">
                <div className="flex gap-8">
                    {['overview', 'strategy', 'operation', 'tasks', 'campaigns', 'performance', 'links'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 capitalize ${activeTab === tab ? 'border-vred text-vblack' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                        >
                            {tab === 'overview' && <Target size={18} weight="duotone" />}
                            {tab === 'strategy' && <Strategy size={18} weight="duotone" />}
                            {tab === 'operation' && <ListChecks size={18} weight="duotone" />}
                            {tab === 'tasks' && <CheckCircle size={18} weight="duotone" />}
                            {tab === 'campaigns' && <Megaphone size={18} weight="duotone" />}
                            {tab === 'performance' && <ChartLineUp size={18} weight="duotone" />}
                            {tab === 'links' && <LinkIcon size={18} weight="duotone" />}
                            {tab === 'overview' ? 'Visão Geral' : tab === 'operation' ? 'Operação' : tab === 'strategy' ? 'Estratégia' : tab === 'tasks' ? 'Tarefas' : tab === 'campaigns' ? 'Campanhas' : tab === 'performance' ? 'Performance' : 'Links'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">

                {/* 1. VISÃO GERAL */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* KPIs */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <KPICard label="Receita (Mês)" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(client.mrr)} icon={CurrencyDollar} bgClass="bg-green-50" colorClass="text-green-600" />
                                <KPICard label="ROAS (Mês)" value="0.0x" icon={TrendUp} bgClass="bg-purple-50" colorClass="text-purple-600" />
                                <KPICard label="Leads" value="0" icon={Users} bgClass="bg-blue-50" colorClass="text-blue-600" />
                                <KPICard label="Tasks Abertas" value={clientTasks.filter(t => t.status !== 'done').length} icon={CheckCircle} bgClass="bg-orange-50" colorClass="text-orange-600" />
                            </div>

                            {/* Sales Snapshot (Editable) */}
                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 text-white shadow-xl relative overflow-hidden group">
                                <div className="absolute right-0 top-0 w-48 h-48 bg-vred/10 rounded-full blur-3xl"></div>
                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <h3 className="text-xl font-bold flex items-center gap-2"><RocketLaunch size={24} className="text-vred" weight="fill" /> Snapshot de Vendas</h3>
                                    <div className="flex gap-2">
                                        {isEditingSnapshot ? (
                                            <>
                                                <button onClick={() => setIsEditingSnapshot(false)} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">Cancelar</button>
                                                <button onClick={handleSaveSnapshot} className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors font-bold">Salvar</button>
                                            </>
                                        ) : (
                                            <button onClick={() => setIsEditingSnapshot(true)} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors font-bold flex items-center gap-2 border border-white/10">
                                                <PencilSimple size={14} /> Editar
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                                    <div>
                                        <p className="text-gray-400 text-xs font-bold uppercase mb-2 tracking-wide">Etapa do Funil</p>
                                        {isEditingSnapshot ? (
                                            <input className="w-full bg-white/10 border border-white/20 rounded p-2 text-white" value={snapshotData.funnelStage} onChange={e => setSnapshotData({ ...snapshotData, funnelStage: e.target.value })} placeholder="Ex: Negociação" />
                                        ) : (
                                            <p className="text-2xl font-bold">{snapshotData.funnelStage || 'Não informado'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-xs font-bold uppercase mb-2 tracking-wide">Gargalo Atual</p>
                                        {isEditingSnapshot ? (
                                            <input className="w-full bg-white/10 border border-white/20 rounded p-2 text-white" value={snapshotData.bottleneck} onChange={e => setSnapshotData({ ...snapshotData, bottleneck: e.target.value })} placeholder="Ex: Qualificação" />
                                        ) : (
                                            <p className="text-2xl font-bold text-red-300">{snapshotData.bottleneck || '-'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-xs font-bold uppercase mb-2 tracking-wide">Taxa de Conversão</p>
                                        {isEditingSnapshot ? (
                                            <input type="number" className="w-full bg-white/10 border border-white/20 rounded p-2 text-white" value={snapshotData.conversionRate} onChange={e => setSnapshotData({ ...snapshotData, conversionRate: +e.target.value })} />
                                        ) : (
                                            <p className="text-2xl font-bold text-green-300">{snapshotData.conversionRate || 0}%</p>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-white/10 text-xs text-gray-400 flex items-center gap-2 font-medium">
                                    <CalendarCheck size={16} weight="fill" /> Última revisão de funil: <span className="text-white">{snapshotData.lastReviewDate || 'Nunca'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><CalendarCheck size={20} weight="fill" className="text-gray-400" /> Próximos Passos</h3>

                            <div className="mb-8 bg-red-50 border border-red-100 rounded-xl p-5">
                                <p className="text-xs font-bold text-red-600 uppercase mb-2 tracking-wide">Ação Crítica</p>
                                <p className="text-base font-bold text-gray-900 leading-snug">
                                    Reunião de Alinhamento Semanal
                                    <br />
                                    <span className="text-xs font-normal text-gray-500">
                                        Segunda-feira, 14:00
                                    </span>
                                </p>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wide">Últimas Tarefas</p>
                                <div className="space-y-6 border-l-2 border-gray-100 pl-5 ml-1.5">
                                    {clientTasks.slice(0, 4).map(t => (
                                        <div key={t.id} className="relative">
                                            <div className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-gray-200 border-2 border-white shadow-sm"></div>
                                            <p className="text-sm font-bold text-gray-900 leading-tight">{t.title}</p>
                                            <p className="text-xs text-gray-500 mt-1">{t.status} • {t.assignee}</p>
                                        </div>
                                    ))}
                                    {clientTasks.length === 0 && <span className="text-xs text-gray-400">Nenhuma tarefa recente.</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. ESTRATÉGIA */}
                {activeTab === 'strategy' && (
                    <div className="space-y-8 max-w-5xl mx-auto">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Planejamento Estratégico</h3>
                            {isEditingStrategy ? (
                                <div className="flex gap-3">
                                    <button onClick={() => setIsEditingStrategy(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-bold transition-colors">Cancelar</button>
                                    <button onClick={handleSaveStrategy} className="px-5 py-2.5 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"><FloppyDisk weight="fill" /> Salvar</button>
                                </div>
                            ) : (
                                <button onClick={() => setIsEditingStrategy(true)} className="px-5 py-2.5 bg-vblack text-white hover:bg-gray-800 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"><PencilSimple weight="bold" /> Editar</button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <StrategyBlock title="ICP (Perfil de Cliente Ideal)" content={localStrategy.icp} isEditing={isEditingStrategy} onChange={(v) => setLocalStrategy(prev => ({ ...prev, icp: v }))} />
                            <StrategyBlock title="Oferta Irresistível" content={localStrategy.offer} isEditing={isEditingStrategy} onChange={(v) => setLocalStrategy(prev => ({ ...prev, offer: v }))} />
                            <StrategyBlock title="Canais de Aquisição" content={localStrategy.channels} isEditing={isEditingStrategy} onChange={(v) => setLocalStrategy(prev => ({ ...prev, channels: v }))} />
                            <StrategyBlock title="Plano 30/60/90 Dias" content={localStrategy.plan30_60_90} isEditing={isEditingStrategy} onChange={(v) => setLocalStrategy(prev => ({ ...prev, plan30_60_90: v }))} />
                        </div>
                    </div>
                )}

                {/* 3. OPERAÇÃO */}
                {activeTab === 'operation' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="p-8 border-b border-gray-200 bg-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Checklist de Onboarding</h3>
                                    <p className="text-sm text-gray-500 mt-1">Acompanhamento da implementação inicial.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-bold text-gray-900">{checklistProgress}%</span>
                                    <div className="w-32 h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${checklistProgress}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Input para adicionar item */}
                            <div className="p-6 bg-gray-50 border-b border-gray-100 flex gap-3">
                                <input
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black/10 outline-none shadow-sm"
                                    placeholder="Adicionar novo item ao checklist..."
                                    value={newItemText}
                                    onChange={(e) => setNewItemText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                                />
                                <button onClick={handleAddItem} className="bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors shadow-sm">
                                    <Plus size={20} weight="bold" />
                                </button>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {checklist.map(item => (
                                    <div key={item.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => handleToggleChecklist(item.id)}>
                                            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${item.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent bg-white'}`}>
                                                <Check weight="bold" size={14} />
                                            </div>
                                            <span className={`text-base font-medium ${item.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{item.text}</span>
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteItem(item.id, e)}
                                            className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2"
                                            title="Remover item"
                                        >
                                            <X size={18} weight="bold" />
                                        </button>
                                    </div>
                                ))}
                                {checklist.length === 0 && <p className="text-center py-8 text-gray-400 italic text-sm">Nenhum item no checklist.</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. TAREFAS */}
                {activeTab === 'tasks' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-bold text-gray-900">Tarefas do Projeto</h3>
                            <button className="text-sm font-bold text-vblack border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">Ver no Board Completo</button>
                        </div>
                        <div className="grid gap-4">
                            {clientTasks.map(task => (
                                <div key={task.id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' : 'bg-blue-400'}`}></div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{task.title}</h4>
                                            <p className="text-xs text-gray-500">Status: {task.status}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-600">{task.assignee}</span>
                                        <span className="text-xs text-gray-400">{task.dueDate}</span>
                                    </div>
                                </div>
                            ))}
                            {clientTasks.length === 0 && <div className="text-center py-10 text-gray-400">Sem tarefas para este cliente.</div>}
                        </div>
                    </div>
                )}

                {/* 5. CAMPANHAS */}
                {activeTab === 'campaigns' && (
                    <div className="space-y-10">
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Campanhas Ativas</h3>
                                <p className="text-sm text-gray-500 mt-1">Visão geral da estrutura de tráfego pago.</p>
                            </div>
                        </div>

                        {clientCampaigns.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {clientCampaigns.map(camp => <CampaignCard key={camp.id} campaign={camp} />)}
                            </div>
                        ) : (
                            <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                                <Megaphone size={48} className="text-gray-300 mx-auto mb-4" weight="duotone" />
                                <p className="text-gray-600 font-bold text-lg mb-2">Nenhuma campanha encontrada</p>
                                <p className="text-gray-500 text-sm">Não há campanhas de tráfego ativas vinculadas a este cliente.</p>
                            </div>
                        )}

                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><ImageSquare size={24} className="text-purple-600" weight="fill" /> Criativos em Veiculação</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                {clientContent.filter(p => p.status === 'published').map(post => (
                                    <div key={post.id} className="relative group aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition-all">
                                        {post.creativeUrl ? (
                                            <img src={post.creativeUrl} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageSquare size={40} weight="duotone" /></div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end text-white p-4">
                                            <p className="text-xs font-bold line-clamp-2 leading-snug">{post.title}</p>
                                            <span className="text-[10px] mt-2 bg-white/20 px-2 py-0.5 rounded w-fit backdrop-blur-sm">{post.platform}</span>
                                        </div>
                                    </div>
                                ))}
                                {clientContent.filter(p => p.status === 'published').length === 0 && (
                                    <div className="col-span-full py-10 text-center text-gray-400 text-sm italic border-2 border-dashed border-gray-100 rounded-xl">Nenhum criativo ativo no momento.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 6. PERFORMANCE */}
                {activeTab === 'performance' && (
                    <div className="space-y-10">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Análise de Resultados</h3>
                                <p className="text-sm text-gray-500 mt-1">Histórico financeiro e métricas de conversão.</p>
                            </div>
                            <button
                                onClick={handleAnalyzeAi}
                                disabled={isGeneratingAi}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-purple-500/30 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {isGeneratingAi ? <CircleNotch className="animate-spin" size={20} /> : <MagicWand size={20} weight="fill" />}
                                {isGeneratingAi ? 'Analisando dados...' : 'Gerar Insight IA'}
                            </button>
                        </div>

                        {aiInsight && (
                            <div className="bg-purple-50 border border-purple-100 p-8 rounded-2xl prose prose-sm max-w-none text-gray-800 animate-in fade-in slide-in-from-top-4 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                                <h4 className="flex items-center gap-2 text-purple-800 font-bold text-lg mb-4"><MagicWand weight="fill" /> Insight de Growth</h4>
                                <div className="whitespace-pre-wrap leading-relaxed">{aiInsight}</div>
                            </div>
                        )}

                        <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 text-center">
                            <p className="text-gray-500">Gráficos detalhados disponíveis no módulo de Performance.</p>
                        </div>
                    </div>
                )}

                {/* 7. LINKS */}
                {activeTab === 'links' && (
                    <div className="max-w-6xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Links & Acessos</h3>
                                <p className="text-sm text-gray-500 mt-1">Central de recursos externos do cliente.</p>
                            </div>
                            <button onClick={() => setNewLinkModalOpen(true)} className="bg-vblack text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-800 shadow-lg transition-colors"><Plus weight="bold" size={18} /> Adicionar Link</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {client.links?.map(link => (
                                <LinkCard key={link.id} link={link} onDelete={handleDeleteLink} />
                            ))}
                            {(!client.links || client.links.length === 0) && (
                                <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                                    <Files size={40} className="mx-auto text-gray-300 mb-4" weight="duotone" />
                                    <p className="text-gray-900 font-bold mb-1">Nenhum link cadastrado</p>
                                    <p className="text-gray-500 text-sm">Adicione links importantes como Drive, CRM ou Dashboards.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
