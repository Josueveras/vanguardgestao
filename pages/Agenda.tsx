import React, { useState, useMemo } from 'react';
import {
    CaretLeft,
    CaretRight,
    Calendar,
    Plus,
    Clock,
    VideoCamera,
    Phone,
    Envelope,
    ChatCircle,
    Buildings,
    User,
    CheckCircle,
    X
} from '@phosphor-icons/react';
import { useVanguard } from '../context/VanguardContext';
import { Card, Button, Modal, Toast } from '../components/ui';
import { MeetingFormModal } from '../components/MeetingFormModal';
import { Meeting } from '../types';

export const AgendaModule: React.FC = () => {
    const { leads, meetings, addLead, addMeeting, updateLead, updateMeeting, deleteLead, deleteMeeting, clients } = useVanguard();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState<Partial<Meeting>>({});
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

    // Helpers for date manipulation
    const getFormattedDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const changeDate = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
    };

    const setToday = () => setSelectedDate(new Date());

    // Combine meetings and lead next actions for the selected day
    const dayItems = useMemo(() => {
        const items: any[] = [];

        // 1. Add meetings
        meetings.forEach(m => {
            if (isSameDay(new Date(m.start_time), selectedDate)) {
                items.push({
                    id: m.id,
                    time: new Date(m.start_time),
                    title: m.title,
                    type: 'meeting',
                    meetingType: m.type,
                    status: m.status,
                    leadId: m.leadId,
                    clientId: m.clientId,
                    description: m.description
                });
            }
        });

        // 2. Add lead next actions
        leads.forEach(l => {
            if (l.nextActionDate && isSameDay(new Date(l.nextActionDate), selectedDate)) {
                items.push({
                    id: `action-${l.id}`,
                    time: new Date(l.nextActionDate),
                    title: `Ação: ${l.nextActionType || 'Follow-up'}`,
                    type: 'lead_action',
                    actionType: l.nextActionType,
                    leadId: l.id,
                    company: l.company,
                    responsible: l.responsibleName
                });
            }
        });

        return items.sort((a, b) => a.time.getTime() - b.time.getTime());
    }, [leads, meetings, selectedDate]);

    const handleItemClick = (item: any) => {
        if (item.type === 'meeting') {
            handleMeetingClick(item);
        }
    };

    const handleEmptySlotClick = (hour: number) => {
        const date = new Date(selectedDate);
        date.setHours(hour, 0, 0, 0);
        setSelectedMeeting({
            start_time: date.toISOString(),
            type: 'Google Meet',
            status: 'scheduled'
        });
        setIsMeetingModalOpen(true);
    };

    const handleSaveMeeting = async (meeting: any) => {
        try {
            if (meeting.id) {
                await updateMeeting(meeting as Meeting);
                setToast({ msg: 'Reunião atualizada!', type: 'success' });
            } else {
                await addMeeting(meeting);
                setToast({ msg: 'Reunião agendada!', type: 'success' });
            }
            setIsMeetingModalOpen(false);
            setSelectedMeeting({});
        } catch (e) {
            setToast({ msg: 'Erro ao salvar reunião', type: 'error' });
        }
    };

    const handleMeetingClick = (meeting: any) => {
        const fullMeeting = meetings.find(m => m.id === meeting.id);
        if (fullMeeting) {
            setSelectedMeeting(fullMeeting);
            setIsMeetingModalOpen(true);
        }
    };

    // Dynamic hours: 6 AM to 11 PM (configurable)
    const startHour = 6;
    const endHour = 23;
    const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => i + startHour);

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col space-y-6">
            {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            <MeetingFormModal
                isOpen={isMeetingModalOpen}
                onClose={() => { setIsMeetingModalOpen(false); setSelectedMeeting({}); }}
                meeting={selectedMeeting}
                onSave={handleSaveMeeting}
                onDelete={deleteMeeting}
                clients={clients}
                leads={leads}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-vblack text-white rounded-xl shadow-lg">
                        <Calendar size={24} weight="bold" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-vblack capitalize">{getFormattedDate(selectedDate)}</h2>
                        <p className="text-sm text-gray-400 font-medium">Cronograma operacional diário</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={setToday} className="px-4 py-2 text-sm font-bold text-vblack hover:bg-gray-50 rounded-lg transition-colors">Hoje</button>
                    <div className="flex bg-gray-50 p-1 rounded-xl">
                        <button onClick={() => changeDate(-1)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600"><CaretLeft size={20} weight="bold" /></button>
                        <button onClick={() => changeDate(1)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600"><CaretRight size={20} weight="bold" /></button>
                    </div>
                    <Button onClick={() => { setSelectedMeeting({ start_time: new Date().toISOString(), type: 'Google Meet', status: 'scheduled' }); setIsMeetingModalOpen(true); }} className="gap-2 px-5">
                        <Plus size={18} weight="bold" /> Agendar
                    </Button>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <div className="relative">
                        {/* Hour markers */}
                        <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col">
                            {hours.map(h => (
                                <div key={h} className="h-28 text-[11px] font-bold text-gray-300 uppercase tracking-wider">{h}:00</div>
                            ))}
                        </div>

                        {/* Grid lines */}
                        <div className="ml-16 border-l border-gray-50 min-h-full">
                            {hours.map(h => (
                                <div
                                    key={h}
                                    className="h-28 border-b border-gray-50 relative group cursor-pointer hover:bg-gray-50/30 transition-colors"
                                    onClick={(e) => {
                                        if (e.target === e.currentTarget) handleEmptySlotClick(h);
                                    }}
                                >
                                    {/* Empty slot indicator on hover */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex items-center gap-2 text-gray-300 text-[10px] font-bold uppercase tracking-widest">
                                            <Plus size={14} /> Novo Agendamento
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Items Overlay */}
                            {dayItems.map((item, idx) => {
                                const h = item.time.getHours();
                                const m = item.time.getMinutes();
                                const hourIndex = hours.indexOf(h);
                                if (hourIndex === -1) return null;

                                const top = (hourIndex * 112) + (m / 60 * 112);

                                const isMeeting = item.type === 'meeting';
                                const client = item.clientId ? clients.find(c => c.id === item.clientId) : null;

                                return (
                                    <div
                                        key={item.id}
                                        className={`absolute left-4 right-4 p-4 rounded-xl shadow-sm border-l-4 cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99] z-10 ${isMeeting ? 'bg-blue-50 border-blue-500' : 'bg-orange-50 border-orange-500'
                                            }`}
                                        style={{ top: `${top}px`, height: 'auto', minHeight: '80px' }}
                                        onClick={() => handleItemClick(item)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${isMeeting ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                                        }`}>
                                                        {item.time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {item.actionType || item.meetingType || 'Ação'}
                                                    </span>
                                                    {isMeeting && item.status === 'completed' && <CheckCircle size={14} className="text-green-500" weight="fill" />}
                                                </div>
                                                <h4 className="text-sm font-bold text-vblack">{item.title}</h4>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <div className="flex items-center gap-1 text-[11px] text-gray-500">
                                                        <Buildings size={14} weight="duotone" />
                                                        <span className="font-semibold">{item.company || client?.name || 'Sem vínculo'}</span>
                                                    </div>
                                                    {item.responsible && (
                                                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                                                            <User size={14} weight="duotone" />
                                                            <span>{item.responsible}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {isMeeting ? (
                                                <VideoCamera size={20} className="text-blue-400" weight="duotone" />
                                            ) : (
                                                <div className="flex gap-1 text-orange-400">
                                                    {item.actionType === 'ligacao' && <Phone size={20} weight="duotone" />}
                                                    {item.actionType === 'email' && <Envelope size={20} weight="duotone" />}
                                                    {item.actionType === 'follow-up' && <ChatCircle size={20} weight="duotone" />}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
