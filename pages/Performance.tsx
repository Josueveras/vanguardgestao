
import React, { useState, useMemo } from 'react';
import { Card } from '../components/ui';
import {
  TrendUp,
  TrendDown,
  Funnel,
  Lightbulb,
  CheckCircle,
  CalendarBlank,
} from '@phosphor-icons/react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useVanguard } from '../context/VanguardContext';
import { Client, PerformanceReport } from '../types';

const MetricCard = ({ title, value, subtext, trend, prefix = '' }: any) => (
  <Card className="p-5">
    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
    <h3 className="text-2xl font-bold text-vblack tracking-tight">{prefix}{value}</h3>
    <div className="flex items-center mt-2 gap-2">
      {trend && (
        <span className={`flex items-center text-xs font-medium px-1.5 py-0.5 rounded ${trend === 'up' ? 'bg-green-100 text-green-700' :
          trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
          }`}>
          {trend === 'up' ? <TrendUp weight="bold" className="mr-1" /> : <TrendDown weight="bold" className="mr-1" />}
          {trend}
        </span>
      )}
      <span className="text-xs text-gray-400">{subtext}</span>
    </div>
  </Card>
);

// Função auxiliar para simular dados baseados no perfil do cliente
// MODIFICADO: Retornar dados zerados pois não há backend de ads real ainda
// Helper to generate last 12 months of data
const generateClientData = (client: Client): PerformanceReport => {
  const history = [];
  const today = new Date();

  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD

    // Base values + some randomness
    const revBase = client.clientRevenue || 0;
    const invBase = (client.clientRevenue || 0) / (client.clientRoas || 3) || 0;

    history.push({
      month: dateStr, // Using ISO string for filtering
      revenue: revBase * (0.8 + Math.random() * 0.4), // +/- 20% variance
      investment: invBase * (0.9 + Math.random() * 0.2)
    });
  }

  return {
    clientId: client.id,
    month: 'Current',
    investment: 0, // Will be recalculated based on filter
    revenue: 0,
    leads: client.clientLeads || 0,
    sales: 0,
    roi: 0,
    roas: 0,
    cpl: 0,
    cac: 0,
    insights: {
      bestCampaign: 'Google Ads - Institucional',
      worstCampaign: 'Meta Ads - Stories Frio',
      bottleneck: 'Taxa de Conversão LP',
      opportunity: 'Aumentar investimento em Remarketing',
      recommendations: ['Otimizar carregamento da LP', 'Novos criativos de vídeo', 'Revisar negativadas']
    },
    history
  };
};

export const PerformanceModule: React.FC = () => {
  const { clients } = useVanguard();
  const [selectedClientId, setSelectedClientId] = useState<string>('all');

  // Default to this month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [dateStart, setDateStart] = useState(firstDay);
  const [dateEnd, setDateEnd] = useState(lastDay);
  const [preset, setPreset] = useState('this_month');

  // Filtrar apenas clientes ativos para a visão global
  const activeClients = clients.filter(c => c.status !== 'cancelado');

  const handlePresetChange = (val: string) => {
    setPreset(val);
    const now = new Date();
    let start = '';
    let end = now.toISOString().split('T')[0];

    if (val === 'last_30') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      start = d.toISOString().split('T')[0];
    } else if (val === 'this_month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    } else if (val === 'last_month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
    } else if (val === 'last_90') {
      const d = new Date();
      d.setDate(d.getDate() - 90);
      start = d.toISOString().split('T')[0];
    }

    if (start) {
      setDateStart(start);
      setDateEnd(end);
    }
  };

  // Calcular dados baseados na seleção e data
  const currentData = useMemo(() => {
    let rawData: PerformanceReport | null = null;

    // 1. Get Base Data (Mocked History)
    if (selectedClientId !== 'all') {
      const client = activeClients.find(c => c.id === selectedClientId);
      rawData = client ? generateClientData(client) : null;
    } else {
      // Aggregate all clients
      rawData = activeClients.reduce((acc, client) => {
        const data = generateClientData(client);
        // Sum history month by month (assuming generated history matches index-wise for same period, which it does as it depends on 'today')
        const mergedHistory = acc.history.map((h, i) => ({
          month: h.month,
          revenue: h.revenue + (data.history[i]?.revenue || 0),
          investment: h.investment + (data.history[i]?.investment || 0),
        }));

        if (acc.clientId === 'initial') return data; // First iteration

        return {
          ...acc,
          leads: acc.leads + data.leads,
          history: mergedHistory
        };
      }, { clientId: 'initial', leads: 0, history: generateClientData(activeClients[0] || {} as any).history } as PerformanceReport);
    }

    if (!rawData) return null;

    // 2. Filter History by Date Range
    const filteredHistory = rawData.history.filter(h => h.month >= dateStart && h.month <= dateEnd);

    // 3. Aggregate totals from filtered history
    const totalRev = filteredHistory.reduce((sum, h) => sum + h.revenue, 0);
    const totalInv = filteredHistory.reduce((sum, h) => sum + h.investment, 0);

    // Recalculate leads proportional to (Inv / Total Annual Inv) ? 
    // Simplified: Just take base monthly leads * (months selected / 12) or similar
    // Better: Mock daily leads logic? For now, we'll just scale mock leads by (filtered months / 12)
    const monthsRatio = filteredHistory.length || 1;
    const totalLeads = Math.round(rawData.leads * (monthsRatio / 12));
    const totalSales = Math.round(totalLeads * 0.12); // 12% conversion rate mock

    const roas = totalInv > 0 ? totalRev / totalInv : 0;
    const roi = totalInv > 0 ? ((totalRev - totalInv) / totalInv) * 100 : 0;
    const cpl = totalLeads > 0 ? totalInv / totalLeads : 0;
    const cac = totalSales > 0 ? totalInv / totalSales : 0;

    return {
      ...rawData,
      revenue: totalRev,
      investment: totalInv,
      leads: totalLeads,
      sales: totalSales,
      roas,
      roi,
      cpl,
      cac,
      history: filteredHistory
    };

  }, [selectedClientId, activeClients, dateStart, dateEnd]);

  if (!currentData) return <div>Carregando dados...</div>;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-vblack">Resultados & Performance</h2>
          <p className="text-gray-500">
            {selectedClientId === 'all'
              ? `Visão consolidada de ${activeClients.length} clientes ativos.`
              : 'Análise detalhada de performance por conta.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Filtro de Cliente */}
          <select
            className="bg-white border border-gray-200 text-sm font-bold rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-vblack outline-none min-w-[200px]"
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
          >
            <option value="all">🌍 Visão Global (Todos)</option>
            <optgroup label="Clientes">
              {activeClients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </optgroup>
          </select>

          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
            <select
              value={preset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="text-sm font-medium bg-transparent border-none outline-none px-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded"
            >
              <option value="custom">Período..</option>
              <option value="this_month">Este Mês</option>
              <option value="last_month">Mês Passado</option>
              <option value="last_30">Últimos 30 dias</option>
              <option value="last_90">Últimos 90 dias</option>
            </select>
            <div className="w-[1px] h-6 bg-gray-200 mx-1"></div>
            <div className="flex items-center gap-2 px-2">
              <input
                type="date"
                value={dateStart}
                onChange={(e) => { setDateStart(e.target.value); setPreset('custom'); }}
                className="text-sm border-none outline-none text-gray-600 bg-transparent p-0 w-[110px]"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => { setDateEnd(e.target.value); setPreset('custom'); }}
                className="text-sm border-none outline-none text-gray-600 bg-transparent p-0 w-[110px]"
              />
            </div>
          </div>

          <button className="text-sm bg-white border border-gray-200 px-3 py-2.5 rounded-lg hover:bg-gray-50 flex items-center gap-2 font-bold transition-colors">
            Exportar
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Investimento em Mídia"
          value={currentData.investment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          prefix="R$ "
          trend="neutral"
          subtext="-"
        />
        <MetricCard
          title="Faturamento Atribuído"
          value={currentData.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          prefix="R$ "
          trend="neutral"
          subtext="-"
        />

        <MetricCard
          title="ROAS (Retorno)"
          value={`${currentData.roas.toFixed(2)}x`}
          trend="neutral"
          subtext="-"
        />
        <MetricCard
          title="ROI (Retorno s/ Inv.)"
          value={`${currentData.roi.toFixed(0)}%`}
          trend="neutral"
          subtext="-"
        />

        <MetricCard
          title="Leads Gerados"
          value={currentData.leads}
          trend="neutral"
          subtext={`CPL: R$ ${currentData.cpl.toFixed(2)}`}
        />
        <MetricCard
          title="Vendas Realizadas"
          value={currentData.sales}
          trend="neutral"
          subtext={`CAC: R$ ${currentData.cac.toFixed(2)}`}
        />
      </div >

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2" title="Evolução de Faturamento vs Investimento">
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentData.history}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  dy={10}
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
                  }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(val) => `R$${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString()}`, '']}
                />
                <Line type="monotone" dataKey="revenue" name="Faturamento" stroke="#0e0e0e" strokeWidth={3} dot={{ r: 4, fill: '#0e0e0e' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="investment" name="Investimento" stroke="#cc001e" strokeWidth={3} dot={{ r: 4, fill: '#cc001e' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Funnel Health */}
        <Card title="Saúde do Funil">
          <div className="space-y-6 mt-4">
            <div className="relative">
              <div className="flex justify-between text-xs font-bold uppercase text-gray-500 mb-1">
                <span>Tráfego</span>
                <span>100%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-gray-800 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div className="relative pl-4 border-l border-dashed border-gray-300">
              <div className="flex justify-between text-xs font-bold uppercase text-gray-500 mb-1">
                <span>Leads ({currentData.leads})</span>
                <span>{((currentData.leads / (currentData.investment / 2)) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-gray-600 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>

            <div className="relative pl-4 border-l border-dashed border-gray-300">
              <div className="flex justify-between text-xs font-bold uppercase text-gray-500 mb-1">
                <span>Vendas ({currentData.sales})</span>
                <span className="text-green-600">Conv. {((currentData.sales / currentData.leads) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-vred h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-red-50 rounded-lg border border-red-100">
            <div className="flex items-start gap-2">
              <Funnel className="text-vred mt-0.5" size={16} weight="bold" />
              <div>
                <p className="text-xs font-bold text-red-800 uppercase mb-1">Gargalo Identificado</p>
                <p className="text-sm text-gray-700">{currentData.insights.bottleneck}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Executive Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Destaques da Campanha">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="bg-green-100 p-2 rounded-full text-green-600">
                <TrendUp size={20} weight="bold" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Campanha Mais Rentável</p>
                <p className="font-medium text-vblack">{currentData.insights.bestCampaign}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="bg-red-100 p-2 rounded-full text-red-600">
                <TrendDown size={20} weight="bold" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Pior Performance</p>
                <p className="font-medium text-vblack">{currentData.insights.worstCampaign}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                <Lightbulb size={20} weight="bold" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Oportunidade</p>
                <p className="font-medium text-vblack">{currentData.insights.opportunity}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Próximos Passos & Recomendações">
          <ul className="space-y-3">
            {currentData.insights.recommendations.map((rec, idx) => (
              <li key={idx} className="flex gap-3 items-start text-sm text-gray-700">
                <CheckCircle size={20} className="text-vblack min-w-[20px] mt-0.5" weight="fill" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Comentários da Agência</h4>
            <textarea
              className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 outline-none resize-none bg-gray-50 transition-colors"
              rows={3}
              placeholder="Adicione uma observação estratégica aqui..."
            ></textarea>
          </div>
        </Card>
      </div>
    </div >
  );
};
