
import React, { useState, useMemo } from 'react';
import { Card } from '../components/ui';
import { 
  TrendUp, 
  TrendDown, 
  Funnel,
  Lightbulb,
  CheckCircle,
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
        <span className={`flex items-center text-xs font-medium px-1.5 py-0.5 rounded ${
          trend === 'up' ? 'bg-green-100 text-green-700' : 
          trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {trend === 'up' ? <TrendUp weight="bold" className="mr-1" /> : <TrendDown weight="bold" className="mr-1" />}
          12%
        </span>
      )}
      <span className="text-xs text-gray-400">{subtext}</span>
    </div>
  </Card>
);

// Função auxiliar para simular dados baseados no perfil do cliente (já que não temos backend de ads)
const generateClientData = (client: Client): PerformanceReport => {
    // Estimativa: Investimento é ~2.5x o MRR (fee), ROAS varia com HealthScore
    const baseInvestment = client.mrr * 2.5;
    const performanceFactor = client.healthScore / 100;
    const roas = 3 + (performanceFactor * 4); // ROAS entre 3x e 7x
    const revenue = baseInvestment * roas;
    const leads = Math.floor(baseInvestment / 45); // CPL médio R$ 45
    const sales = Math.floor(leads * (0.05 + (performanceFactor * 0.05))); // Conv entre 5% e 10%

    return {
        clientId: client.id,
        month: 'Outubro 2023',
        investment: baseInvestment,
        revenue: revenue,
        leads: leads,
        sales: sales,
        roi: ((revenue - baseInvestment) / baseInvestment) * 100,
        roas: roas,
        cpl: baseInvestment / leads,
        cac: baseInvestment / sales,
        insights: {
            bestCampaign: client.id === '1' ? '[Meta] Scale_Advantage+' : '[Google] Institucional_Search',
            worstCampaign: '[Display] Awareness_Broad',
            bottleneck: performanceFactor > 0.8 ? 'Capacidade de Atendimento' : 'Qualificação de Leads',
            opportunity: 'Otimização de verba entre canais',
            recommendations: [
                'Ajustar orçamento conforme ROAS',
                'Renovar criativos saturados',
                'Revisar tagueamento de conversão'
            ]
        },
        history: [
            { month: 'Jul', revenue: revenue * 0.7, investment: baseInvestment * 0.8 },
            { month: 'Ago', revenue: revenue * 0.85, investment: baseInvestment * 0.9 },
            { month: 'Set', revenue: revenue * 0.9, investment: baseInvestment * 0.95 },
            { month: 'Out', revenue: revenue, investment: baseInvestment },
        ]
    };
};

export const PerformanceModule: React.FC = () => {
  const { clients } = useVanguard();
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [dateRange, setDateRange] = useState('Outubro 2023');

  // Filtrar apenas clientes ativos para a visão global
  const activeClients = clients.filter(c => c.status !== 'churn');

  // Calcular dados baseados na seleção
  const currentData = useMemo(() => {
    if (selectedClientId !== 'all') {
        const client = activeClients.find(c => c.id === selectedClientId);
        return client ? generateClientData(client) : null;
    }

    // Visão Global: Soma de todos os clientes ativos
    const aggregated = activeClients.reduce((acc, client) => {
        const data = generateClientData(client);
        return {
            investment: acc.investment + data.investment,
            revenue: acc.revenue + data.revenue,
            leads: acc.leads + data.leads,
            sales: acc.sales + data.sales,
            history: acc.history.map((h, i) => ({
                month: h.month,
                revenue: h.revenue + (data.history[i]?.revenue || 0),
                investment: h.investment + (data.history[i]?.investment || 0),
            }))
        };
    }, { 
        investment: 0, revenue: 0, leads: 0, sales: 0, 
        history: [{ month: 'Jul', revenue: 0, investment: 0 }, { month: 'Ago', revenue: 0, investment: 0 }, { month: 'Set', revenue: 0, investment: 0 }, { month: 'Out', revenue: 0, investment: 0 }] 
    });

    // Recalcular taxas globais
    const globalROAS = aggregated.investment > 0 ? aggregated.revenue / aggregated.investment : 0;
    const globalROI = aggregated.investment > 0 ? ((aggregated.revenue - aggregated.investment) / aggregated.investment) * 100 : 0;
    const globalCPL = aggregated.leads > 0 ? aggregated.investment / aggregated.leads : 0;
    const globalCAC = aggregated.sales > 0 ? aggregated.investment / aggregated.sales : 0;

    return {
        ...aggregated,
        clientId: 'all',
        month: dateRange,
        roas: globalROAS,
        roi: globalROI,
        cpl: globalCPL,
        cac: globalCAC,
        insights: {
            bestCampaign: 'Múltiplas Campanhas',
            worstCampaign: 'N/A',
            bottleneck: 'Varia de acordo com cliente',
            opportunity: 'Consolidação de dados',
            recommendations: ['Monitorar contas com ROAS abaixo da média', 'Padronizar relatórios']
        }
    };
  }, [selectedClientId, activeClients, dateRange]);

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
        <div className="flex items-center gap-3">
          {/* Filtro de Cliente */}
          <select 
            className="bg-white border border-gray-200 text-sm font-semibold rounded-lg px-3 py-2 focus:ring-2 focus:ring-vblack outline-none min-w-[200px]"
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

          {/* Filtro de Data */}
          <select 
            className="bg-white border border-gray-200 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-vblack outline-none"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option>Outubro 2023</option>
            <option>Setembro 2023</option>
            <option>Últimos 90 dias</option>
          </select>
          
          <button className="text-sm bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 font-medium">
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
          trend="up" 
          subtext="vs mês anterior" 
        />
        <MetricCard 
          title="Faturamento Atribuído" 
          value={currentData.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} 
          prefix="R$ "
          trend="up" 
          subtext="vs mês anterior" 
        />
        
        <MetricCard 
          title="ROAS (Retorno)" 
          value={`${currentData.roas.toFixed(2)}x`} 
          trend="up" 
          subtext="Para cada R$1 investido" 
        />
        <MetricCard 
          title="ROI (Retorno s/ Inv.)" 
          value={`${currentData.roi.toFixed(0)}%`} 
          trend="up" 
          subtext="Lucro sobre mídia" 
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
          trend="up" 
          subtext={`CAC: R$ ${currentData.cac.toFixed(2)}`} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2" title="Evolução de Faturamento vs Investimento">
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentData.history}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(val) => `R$${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString()}`, '']}
                />
                <Line type="monotone" dataKey="revenue" name="Faturamento" stroke="#0e0e0e" strokeWidth={3} dot={{r: 4, fill: '#0e0e0e'}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="investment" name="Investimento" stroke="#cc001e" strokeWidth={3} dot={{r: 4, fill: '#cc001e'}} />
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
                  <span>{((currentData.leads / (currentData.investment/2)) * 100).toFixed(1)}%</span>
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
    </div>
  );
};
