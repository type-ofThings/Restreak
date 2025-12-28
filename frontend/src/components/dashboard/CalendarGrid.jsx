import React from 'react';
import { getTodayDate } from '../../utils/helpers';

function CalendarGrid({ habits, currentDate }) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const startingSlot = firstDay === 0 ? 6 : firstDay - 1;
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const todayStr = getTodayDate();

    return (
        <div className="grid grid-cols-7 gap-2 text-center">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => (
                <div key={d} className="text-xs font-semibold text-slate-400 mb-1">{d}</div>
            ))}
            {Array.from({ length: startingSlot }).map((_, i) => (
                <div key={`empty-${i}`} className="w-10 h-10"></div>
            ))}
            {days.map(day => {
                const d = new Date(year, month, day);
                const yStr = d.getFullYear();
                const mStr = String(d.getMonth() + 1).padStart(2, '0');
                const dStr = String(d.getDate()).padStart(2, '0');
                const dateStr = `${yStr}-${mStr}-${dStr}`;

                let statusColor = 'bg-slate-100 text-slate-400';
                if (dateStr <= todayStr) {
                    const habitsDoneOnDay = habits.filter(h => h.completedDates?.includes(dateStr)).length;
                    const total = habits.length;
                    if (total > 0 && habitsDoneOnDay === total) statusColor = 'bg-green-500 text-white shadow-sm';
                    else if (habitsDoneOnDay > 0) statusColor = 'bg-yellow-300 text-yellow-800';
                    else if (dateStr < todayStr) statusColor = 'bg-red-100 text-red-400';
                }
                const isToday = dateStr === todayStr;
                return (
                    <div key={day} className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition ${statusColor} ${isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
                        {day}
                    </div>
                );
            })}
        </div>
    );
}

export default CalendarGrid;
