
import React, { useState, useEffect } from 'react';
import {
    User, Buildings, FloppyDisk, Camera
} from '@phosphor-icons/react';
import { Toast, SectionHeader, InputField } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export const SettingsModule = () => {
    const { user, updateProfile } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'agency'>('profile');
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Initial state from user metadata
    const [userData, setUserData] = useState({
        name: '',
        role: '',
        phone: '',
        email: ''
    });

    useEffect(() => {
        if (user) {
            setUserData({
                name: user.user_metadata?.full_name || '',
                role: user.user_metadata?.role || '',
                phone: user.user_metadata?.phone || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const [agency, setAgency] = useState({
        name: 'Vanguarda Growth Unit',
        cnpj: '00.000.000/0001-00',
        website: 'vanguarda.agency',
        address: 'Av. Paulista, 1000 - São Paulo, SP'
    });

    const handleSave = async () => {
        setIsLoading(true);
        if (activeTab === 'profile') {
            const { error } = await updateProfile({
                full_name: userData.name,
                role: userData.role,
                phone: userData.phone
            });

            if (error) {
                setToast({ msg: 'Erro ao atualizar perfil', type: 'error' });
            } else {
                setToast({ msg: 'Perfil atualizado com sucesso!', type: 'success' });
            }
        } else {
            // Mock delay for agency settings (not connected to DB yet)
            setTimeout(() => {
                setToast({ msg: 'Dados da agência salvos!', type: 'success' });
            }, 800);
        }
        setIsLoading(false);
    };

    const tabs = [
        { id: 'profile', label: 'Cadastro de Usuário', icon: User },
        { id: 'agency', label: 'Dados da Agência', icon: Buildings },
    ];

    return (
        <div className="h-[calc(100vh-140px)] flex gap-8">
            {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            {/* Sidebar Navigation */}
            <div className="w-64 flex-shrink-0">
                <h2 className="text-2xl font-bold text-vblack mb-6">Configurações</h2>
                <div className="flex flex-col space-y-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-white text-vblack shadow-sm border border-gray-200'
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                        >
                            <tab.icon size={18} weight={activeTab === tab.id ? 'fill' : 'regular'} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col max-w-3xl">
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

                    {/* TAB: PROFILE */}
                    {activeTab === 'profile' && (
                        <div>
                            <SectionHeader title="Cadastro de Usuário" description="Atualize suas informações pessoais." />

                            <div className="flex items-center gap-6 mb-8">
                                <div className="relative group cursor-pointer">
                                    <div className="w-24 h-24 rounded-full bg-vblack text-white flex items-center justify-center text-3xl font-bold border-4 border-gray-50 shadow-sm overflow-hidden">
                                        {userData.name ? userData.name.charAt(0) : 'U'}
                                    </div>
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera size={24} className="text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-vblack text-lg">{userData.name}</h4>
                                    <p className="text-sm text-gray-500">{userData.role}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField
                                    label="Nome Completo"
                                    value={userData.name}
                                    onChange={(e: any) => setUserData({ ...userData, name: e.target.value })}
                                />
                                <InputField
                                    label="Cargo"
                                    value={userData.role}
                                    onChange={(e: any) => setUserData({ ...userData, role: e.target.value })}
                                />
                            </div>
                            <InputField
                                label="Email"
                                value={userData.email}
                                type="email"
                                disabled={true}
                                onChange={() => { }} // Email is read-only
                            />
                            <InputField
                                label="Telefone"
                                value={userData.phone}
                                onChange={(e: any) => setUserData({ ...userData, phone: e.target.value })}
                            />
                        </div>
                    )}

                    {/* TAB: AGENCY */}
                    {activeTab === 'agency' && (
                        <div>
                            <SectionHeader title="Dados da Agência" description="Informações da sua unidade de negócio." />

                            <InputField
                                label="Nome da Agência"
                                value={agency.name}
                                onChange={(e: any) => setAgency({ ...agency, name: e.target.value })}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <InputField
                                    label="CNPJ"
                                    value={agency.cnpj}
                                    onChange={(e: any) => setAgency({ ...agency, cnpj: e.target.value })}
                                />
                                <InputField
                                    label="Website"
                                    value={agency.website}
                                    onChange={(e: any) => setAgency({ ...agency, website: e.target.value })}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Endereço</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-black/5 outline-none bg-gray-50 focus:bg-white transition-colors h-24 resize-none"
                                    value={agency.address}
                                    onChange={(e) => setAgency({ ...agency, address: e.target.value })}
                                ></textarea>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                    <button className="px-6 py-2.5 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-vblack text-white hover:bg-gray-800 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg transition-colors disabled:opacity-70"
                    >
                        {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FloppyDisk size={18} weight="fill" />}
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
};
