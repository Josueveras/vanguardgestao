import React, { useState, useEffect } from 'react';
import {
    X,
    Megaphone,
    CurrencyDollar,
    TrendUp,
    Target,
    Money,
    ChartBar
} from '@phosphor-icons/react';
import { Campaign } from '../types';

interface CampaignFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (campaign: Omit<Campaign, 'id' | 'user_id' | 'created_at'>) => void;
    initialData?: Campaign;
    clientId: string;
}

export const CampaignFormModal: React.FC<CampaignFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    clientId
}) => {
    const [formData, setFormData] = useState<Partial<Campaign>>({
        name: '',
        platform: 'Meta Ads',
        status: 'Ativa',
        spend: 0,
        roas: 0,
        ctr: 0,
        cpa: 0,
        clientId: clientId
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: '',
                platform: 'Meta Ads',
                status: 'Ativa',
                spend: 0,
                roas: 0,
                ctr: 0,
                cpa: 0,
                clientId: clientId
            });
        }
    }, [initialData, clientId]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!formData.name) return;

        onSave({
            name: formData.name,
            platform: formData.platform || 'Meta Ads',
            status: formData.status || 'Ativa',
            spend: Number(formData.spend) || 0,
            roas: Number(formData.roas) || 0,
            ctr: Number(formData.ctr) || 0,
            cpa: Number(formData.cpa) || 0,
            clientId: clientId
        } as any);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-300">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                                <Megaphone size={24} weight="fill" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-vblack">
                                    {initialData ? 'Editar Campanha' : 'Nova Campanha'}
                                </h2>
                                <p className="text-xs text-gray-500">Gerencie os dados e performance de tráfego.</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">

                    {/* Basic Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Nome da Campanha</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: [Conv] Black Friday - Video 01"
                                className="w-full text-lg font-medium text-vblack placeholder-gray-300 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Plataforma</label>
                            <select
                                value={formData.platform}
                                onChange={e => setFormData({ ...formData, platform: e.target.value as any })}
                                className="w-full bg-white border border-gray-200 text-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all appearance-none"
                            >
                                <option value="Meta Ads">Meta Ads (Facebook/Instagram)</option>
                                <option value="Google Ads">Google Ads (Search/Youtube)</option>
                                <option value="TikTok Ads">TikTok Ads</option>
                                <option value="LinkedIn Ads">LinkedIn Ads</option>
                                <option value="Pinterest Ads">Pinterest Ads</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full bg-white border border-gray-200 text-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all appearance-none"
                            >
                                <option value="Ativa">Ativa</option>
                                <option value="Pausada">Pausada</option>
                                <option value="Rascunho">Rascunho</option>
                                <option value="Concluída">Concluída</option>
                            </select>
                        </div>
                    </div>

                    <hr className="border-gray-50" />

                    {/* Metrics */}
                    <div>
                        <h3 className="text-sm font-bold text-vblack mb-4 flex items-center gap-2">
                            <ChartBar size={18} className="text-purple-600" /> Métricas de Performance
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Investimento (R$)</label>
                                <div className="relative">
                                    <CurrencyDollar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        value={formData.spend}
                                        onChange={e => setFormData({ ...formData, spend: Number(e.target.value) })}
                                        className="w-full pl-9 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500/10 outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">ROAS (Retorno)</label>
                                <div className="relative">
                                    <TrendUp size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        value={formData.roas}
                                        onChange={e => setFormData({ ...formData, roas: Number(e.target.value) })}
                                        step="0.1"
                                        className="w-full pl-9 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500/10 outline-none"
                                        placeholder="0.0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">CTR (%)</label>
                                <div className="relative">
                                    <Target size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        value={formData.ctr}
                                        onChange={e => setFormData({ ...formData, ctr: Number(e.target.value) })}
                                        step="0.01"
                                        className="w-full pl-9 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500/10 outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">CPA (Custo/Aquisição)</label>
                                <div className="relative">
                                    <Money size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        value={formData.cpa}
                                        onChange={e => setFormData({ ...formData, cpa: Number(e.target.value) })}
                                        className="w-full pl-9 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500/10 outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex-shrink-0 bg-gray-50/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-semibold text-gray-500 hover:text-vblack transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-8 py-2.5 bg-black text-white text-sm font-bold rounded-lg shadow-lg hover:bg-gray-800 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                        <Megaphone weight="fill" />
                        {initialData ? 'Salvar Alterações' : 'Criar Campanha'}
                    </button>
                </div>

            </div>
        </div>
    );
};
