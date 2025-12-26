
import React, { useState } from 'react';
import { Client } from '../types';
import {
  MagnifyingGlass,
  Plus,
  CurrencyDollar,
  Users,
  TrendUp,
  WarningCircle,
  CheckCircle,
  Rocket,
  CalendarBlank,
  ArrowUpRight,
  SquaresFour,
  ListDashes,
  PencilSimple
} from '@phosphor-icons/react';
import { Modal, Toast } from '../components/ui';
import { ClientProfile } from './ClientProfile';
import { useVanguard } from '../context/VanguardContext';

const ClientMetricCard = ({ title, value, icon: Icon, trend, type = 'neutral' }: any) => {
  const types = {
    neutral: 'text-vblack',
    success: 'text-green-600',
    warning: 'text-red-600',
    info: 'text-blue-600',
    purple: 'text-purple-600'
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-36">
      <div className="flex justify-between items-start">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</span>
        <Icon size={20} className={types[type as keyof typeof types]} weight="fill" />
      </div>
      <div>
        <h3 className="text-3xl font-bold text-vblack tracking-tight">{value}</h3>
        {trend && (
          <div className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded text-[10px] font-bold ${trend.includes('+') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
            <TrendUp weight="bold" />
            {trend}
          </div>
        )}
        {!trend && type === 'warning' && (
          <div className="text-xs text-red-600 mt-2 font-medium">Atenção requerida</div>
        )}
      </div>
    </div>
  );
};

const ClientCard: React.FC<{ client: Client; onClick: () => void; onEdit: (e: React.MouseEvent) => void }> = ({ client, onClick, onEdit }) => {
  const getStatusStyle = (status: Client['status']) => {
    switch (status) {
      case 'active': return { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle, label: 'Ativo' };
      case 'onboarding': return { bg: 'bg-blue-50', text: 'text-blue-700', icon: Rocket, label: 'Onboarding' };
      case 'risk': return { bg: 'bg-red-50', text: 'text-red-700', icon: WarningCircle, label: 'Risco' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-700', icon: CheckCircle, label: status };
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-400';
    return 'bg-red-500';
  };

  const getHealthText = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const statusStyle = getStatusStyle(client.status);
  const StatusIcon = statusStyle.icon;

  return (
    <div onClick={onClick} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-full relative">
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={onEdit}
          className="p-2 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-vblack hover:bg-gray-50 shadow-sm"
          title="Edição Rápida"
        >
          <PencilSimple size={16} weight="bold" />
        </button>
      </div>

      <div>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-vblack flex items-center justify-center text-white font-bold text-lg">
            {client.logo || client.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h4 className="font-bold text-vblack text-lg leading-tight group-hover:text-vred transition-colors">{client.name}</h4>
            <p className="text-xs text-gray-500 font-medium">{client.plan}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6 bg-gray-50/50 p-2 rounded-lg">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}>
            <StatusIcon weight="fill" />
            {statusStyle.label}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">MRR</span>
            <span className="font-bold text-vblack text-sm">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(client.mrr)}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-end mb-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <CheckCircle weight="regular" />
              Health Score
            </div>
            <span className={`text-xs font-bold ${getHealthText(client.healthScore)}`}>{client.healthScore}/100</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${getHealthColor(client.healthScore)}`} style={{ width: `${client.healthScore}%` }}></div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-2 text-gray-400 text-[10px] font-medium">
          <CalendarBlank size={14} />
          {client.lastInteraction}
        </div>
        <ArrowUpRight size={14} className="text-gray-300 group-hover:text-vred transition-colors" weight="bold" />
      </div>
    </div>
  );
};

export const ClientsModule: React.FC = () => {
  const { clients, tasks, content, campaigns, updateClient, addClient, loading } = useVanguard();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'active' | 'onboarding' | 'risk'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Partial<Client> | null>(null);
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Metrics Calculation
  const totalMRR = clients.reduce((acc, client) => acc + client.mrr, 0);
  const activeCount = clients.filter(c => c.status === 'active' || c.status === 'onboarding').length;
  const avgTicket = clients.length > 0 ? totalMRR / clients.length : 0;
  const riskCount = clients.filter(c => c.status === 'risk').length;

  const filteredClients = clients.filter(client => {
    const matchesFilter = filter === 'all' || client.status === filter;
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleEditClick = (e: React.MouseEvent, client: Client) => {
    e.stopPropagation();
    setEditingClient(client);
  };

  const handleCardClick = (client: Client) => {
    setSelectedClient(client);
  };

  const handleSaveEdit = async () => {
    if (editingClient && editingClient.name) {
      setIsSaving(true);
      try {
        if (editingClient.id) {
          await updateClient(editingClient as Client);
          setToast({ msg: 'Cliente atualizado com sucesso!', type: 'success' });
        } else {
          const newClientData = {
            ...editingClient,
            logo: editingClient.name.substring(0, 2).toUpperCase(),
            healthScore: 100,
            lastInteraction: 'Agora',
            links: [],
            onboardingChecklist: [],
            strategy: {},
            salesSnapshot: { funnelStage: 'Inicio', bottleneck: '-', conversionRate: 0, lastReviewDate: '-' }
          };
          await addClient(newClientData as any);
          setToast({ msg: 'Cliente criado com sucesso!', type: 'success' });
        }
        setEditingClient(null);
      } catch (e) {
        setToast({ msg: 'Erro ao salvar cliente', type: 'error' });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleCreateNew = () => {
    setEditingClient({
      name: '',
      status: 'onboarding',
      mrr: 0,
      plan: 'Growth'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-10 h-10 border-4 border-vred border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium tracking-wide">Carregando CRM de Clientes...</p>
      </div>
    );
  }

  if (selectedClient) {
    return (
      <ClientProfile
        client={selectedClient}
        onBack={() => setSelectedClient(null)}
        onUpdateClient={async (updated) => {
          await updateClient(updated);
          setSelectedClient(updated);
        }}
        tasks={tasks}
        content={content}
        campaigns={campaigns}
      />
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <Modal isOpen={!!editingClient} onClose={() => setEditingClient(null)} title={editingClient?.id ? "Editar Cliente" : "Novo Cliente"} size="sm">
        <div className="p-6 space-y-4">
          {editingClient && (
            <>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Nome do Cliente</label>
                <input
                  className="w-full border p-2 rounded mt-1 text-sm outline-none focus:ring-2 focus:ring-vred/10 transition-all"
                  value={editingClient.name || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                <select
                  className="w-full border p-2 rounded mt-1 text-sm bg-white outline-none focus:ring-2 focus:ring-vred/10 transition-all"
                  value={editingClient.status || 'active'}
                  onChange={(e) => setEditingClient({ ...editingClient, status: e.target.value as any })}
                >
                  <option value="active">Ativo</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="risk">Risco</option>
                  <option value="churn">Churn</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Plano</label>
                <input
                  className="w-full border p-2 rounded mt-1 text-sm outline-none focus:ring-2 focus:ring-vred/10 transition-all"
                  value={editingClient.plan || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, plan: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">MRR (Mensal)</label>
                <input
                  type="number"
                  className="w-full border p-2 rounded mt-1 text-sm outline-none focus:ring-2 focus:ring-vred/10 transition-all"
                  value={editingClient.mrr || 0}
                  onChange={(e) => setEditingClient({ ...editingClient, mrr: Number(e.target.value) })}
                />
              </div>
              <button onClick={handleSaveEdit} disabled={isSaving} className="w-full bg-vblack text-white py-2.5 rounded-lg font-bold mt-2 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : null}
                {isSaving ? 'Processando...' : (editingClient.id ? 'Salvar Alterações' : 'Criar Cliente')}
              </button>
            </>
          )}
        </div>
      </Modal>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-vblack">Carteira de Clientes</h2>
          <p className="text-gray-500 text-sm mt-1">Gerencie contratos, status e saúde da base.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative group w-full md:w-64">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-vblack" size={16} />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-100 focus:border-gray-300 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-vblack' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <SquaresFour size={18} weight={viewMode === 'grid' ? 'fill' : 'regular'} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-100 text-vblack' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <ListDashes size={18} weight={viewMode === 'list' ? 'fill' : 'regular'} />
            </button>
          </div>

          <button onClick={handleCreateNew} className="flex items-center gap-2 px-4 py-2 bg-vblack text-white rounded-lg text-sm font-bold hover:bg-gray-800 shadow-lg shadow-gray-900/10 whitespace-nowrap transition-all">
            <Plus size={16} weight="bold" /> Novo Cliente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ClientMetricCard
          title="MRR Total"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalMRR)}
          icon={CurrencyDollar}
          trend="+5%"
          type="success"
        />
        <ClientMetricCard
          title="Clientes Ativos"
          value={activeCount}
          icon={Users}
          type="info"
        />
        <ClientMetricCard
          title="Ticket Médio"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(avgTicket)}
          icon={TrendUp}
          type="purple"
        />
        <ClientMetricCard
          title="Em Risco (Churn)"
          value={riskCount}
          icon={WarningCircle}
          type="warning"
        />
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-1">
        {['all', 'active', 'onboarding', 'risk'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${filter === f
                ? 'bg-vblack text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-100 hover:text-vblack'
              }`}
          >
            {f === 'all' ? 'Todos' : f === 'active' ? 'Ativos' : f === 'risk' ? 'Risco' : 'Onboarding'}
          </button>
        ))}
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onClick={() => handleCardClick(client)}
              onEdit={(e) => handleEditClick(e, client)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-vblack">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Plano</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">MRR</th>
                <th className="px-6 py-4">Health Score</th>
                <th className="px-6 py-4">Última Interação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClients.map(client => (
                <tr key={client.id} onClick={() => handleCardClick(client)} className="hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-vblack text-white flex items-center justify-center text-xs font-bold">
                      {client.logo || client.name.substring(0, 2).toUpperCase()}
                    </div>
                    {client.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{client.plan}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${client.status === 'active' ? 'bg-green-100 text-green-700' :
                        client.status === 'risk' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                      }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(client.mrr)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${client.healthScore >= 80 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${client.healthScore}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-gray-600">{client.healthScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{client.lastInteraction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
