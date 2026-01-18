import React, { useMemo, useState } from 'react';
import { useVanguard } from '../../context/VanguardContext';
import { format, addMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

export const CalendarView = () => {
    const { tasks } = useVanguard();
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const startDate = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 }); // Sunday
    const endDate = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const tasksByDate = useMemo(() => {
        const map = new Map<string, typeof tasks>();
        tasks.forEach(t => {
            if (!t.dueDate || t.archived) return;
            const dateKey = format(parseISO(t.dueDate), 'yyyy-MM-dd');
            if (!map.has(dateKey)) map.set(dateKey, []);
            map.get(dateKey)?.push(t);
        });
        return map;
    }, [tasks]);

    const handlePrev = () => setCurrentMonth(addMonths(currentMonth, -1));
    const handleNext = () => setCurrentMonth(addMonths(currentMonth, 1));

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-700">Calendário</h3>
                <div className="flex items-center gap-2">
                    <button onClick={handlePrev} className="p-1 hover:bg-gray-100 rounded"><CaretLeft /></button>
                    <span className="text-sm font-medium capitalize">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</span>
                    <button onClick={handleNext} className="p-1 hover:bg-gray-100 rounded"><CaretRight /></button>
                </div>
            </div>

            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="p-2 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-7 h-full min-h-[500px] auto-rows-fr">
                    {days.map(day => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const dayTasks = tasksByDate.get(dateKey) || [];
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isToday = isSameDay(day, new Date());

                        return (
                            <div key={dateKey} className={`border-b border-r border-gray-50 p-2 min-h-[100px] flex flex-col gap-1 transition-colors hover:bg-gray-50 ${!isCurrentMonth ? 'bg-gray-50/30 text-gray-300' : 'bg-white'}`}>
                                <div className={`text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-vblack text-white' : 'text-gray-500'}`}>
                                    {format(day, 'd')}
                                </div>
                                <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar max-h-[120px]">
                                    {dayTasks.map(task => (
                                        <div key={task.id} className={`text-[10px] px-2 py-1 rounded border shadow-sm truncate font-medium cursor-pointer
                                            ${task.status === 'concluido' ? 'bg-gray-100 text-gray-400 line-through' :
                                                task.priority === 'alta' ? 'bg-red-50 text-red-700 border-red-100' :
                                                    task.priority === 'media' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                        'bg-blue-50 text-blue-700 border-blue-100'}
                                        `} title={task.title}>
                                            {task.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
