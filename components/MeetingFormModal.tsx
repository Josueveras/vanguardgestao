
import React, { useState, useEffect } from 'react';
import { Modal, Button } from './ui';
import { Meeting, Client, Lead } from '../types';
import { X, Calendar, Clock, VideoCamera, Users, Info } from '@phosphor-icons/react';

interface MeetingFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (meeting: any) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
    meeting?: Partial<Meeting>;
    clients: Client[];
    leads: Lead[];
}

export const MeetingFormModal: React.FC<MeetingFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    onDelete,
    meeting,
    clients,
    leads
}) => {
    const [formData, setFormData] = useState<Partial<Meeting>>({
        title: '',
        type: 'Google Meet',
        status: 'scheduled',
        description: '',
        ...meeting
    });

    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    useEffect(() => {
        if (meeting) {
            setFormData({
                title: meeting.title || '',
                type: meeting.type || 'Google Meet',
                status: meeting.status || 'scheduled',
                clientId: meeting.clientId || '',
                leadId: meeting.leadId || '',
                link: meeting.link || '',
                description: meeting.description || '',
                id: meeting.id
            });

            if (meeting.start_time) {
                const d = new Date(meeting.start_time);
                setDate(d.toISOString().split('T')[0]);
                setTime(d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false }));
            } else {
                setDate('');
                setTime('');
            }
        }
    }, [meeting]);

    const handleSave = async () => {
        if (!formData.title || !date || !time) return;

        const [hours, minutes] = time.split(':').map(Number);
        const [year, month, day] = date.split('-').map(Number);
        const startTime = new Date(year, month - 1, day, hours, minutes).toISOString();

        await onSave({
            ...formData,
            start_time: startTime,
            clientId: formData.clientId || null,
            leadId: formData.leadId || null,
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={formData.id ? "Editar Reunião" : "Nova Reunião"} size="md">
            <div className="p-6 space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-2">
                            <Info size={14} /> Título da Reunião
                        </label>
                        <input
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-vred/10 transition-all outline-none"
                            placeholder="Ex: Reunião de Alinhamento Semanal"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-2">
                                <Calendar size={14} /> Data
                            </label>
                            <input
                                type="date"
                                className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-2">
                                <Clock size={14} /> Horário
                            </label>
                            <input
                                type="time"
                                className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white"
                                value={time}
                                onChange={e => setTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-2">
                                <VideoCamera size={14} /> Tipo / Local
                            </label>
                            <select
                                className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                            >
                                <option value="Google Meet">Google Meet</option>
                                <option value="Zoom">Zoom</option>
                                <option value="Presencial">Presencial</option>
                                <option value="Interno">Interno</option>
                                <option value="Outro">Outro</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-2">
                                <Info size={14} /> Status
                            </label>
                            <select
                                className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                            >
                                <option value="scheduled">Agendada</option>
                                <option value="completed">Realizada</option>
                                <option value="canceled">Cancelada</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-2">
                                <Users size={14} /> Vincular Cliente
                            </label>
                            <select
                                className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white"
                                value={formData.clientId || ''}
                                onChange={e => setFormData({ ...formData, clientId: e.target.value, leadId: '' })}
                            >
                                <option value="">Nenhum cliente</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-2">
                                <Users size={14} /> Vincular Lead
                            </label>
                            <select
                                className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white"
                                value={formData.leadId || ''}
                                onChange={e => setFormData({ ...formData, leadId: e.target.value, clientId: '' })}
                            >
                                <option value="">Nenhum lead</option>
                                {leads.map(l => <option key={l.id} value={l.id}>{l.company}</option>)}
                            </select>
                        </div>
                    </div>

                    {formData.type?.includes('Meet') || formData.type?.includes('Zoom') ? (
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-2">
                                Link da Reunião
                            </label>
                            <input
                                className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none"
                                placeholder="https://..."
                                value={formData.link || ''}
                                onChange={e => setFormData({ ...formData, link: e.target.value })}
                            />
                        </div>
                    ) : null}

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-2">
                            Pauta / Descrição
                        </label>
                        <textarea
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm h-24 resize-none outline-none"
                            placeholder="Descreva o objetivo da reunião..."
                            value={formData.description || ''}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    {formData.id && onDelete && (
                        <Button variant="secondary" onClick={() => onDelete(formData.id!)} className="bg-red-50 text-red-600 hover:bg-red-100 border-red-100">
                            Excluir
                        </Button>
                    )}
                    <div className="flex-1"></div>
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave}>{formData.id ? "Salvar Alterações" : "Confirmar Agendamento"}</Button>
                </div>
            </div>
        </Modal>
    );
};
