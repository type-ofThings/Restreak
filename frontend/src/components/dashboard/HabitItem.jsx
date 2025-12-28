import React, { useState } from 'react';
import { doc, updateDoc, deleteDoc, addDoc, collection, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { BookOpen, Activity, Zap, Flame, X, Bot } from 'lucide-react';
import { db, appId } from '../../config/firebase';
import { getTodayDate } from '../../utils/helpers';

function HabitItem({ habit, user }) {
    const isCompletedToday = habit.completedDates?.includes(getTodayDate());
    const [showToast, setShowToast] = useState(false);

    const toggleComplete = async () => {
        const today = getTodayDate();
        const habitRef = doc(db, 'artifacts', appId, 'users', user.uid, 'habits', habit.id);

        if (isCompletedToday) {
            await updateDoc(habitRef, {
                completedDates: arrayRemove(today),
                streak: Math.max(0, (habit.streak || 1) - 1)
            });
        } else {
            await updateDoc(habitRef, {
                completedDates: arrayUnion(today),
                streak: (habit.streak || 0) + 1
            });
            // Log activity
            await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'activity'), {
                text: `Completed "${habit.title}"`,
                type: 'completion',
                timestamp: serverTimestamp()
            });
            // Show AI Motivation Toast
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    const deleteHabit = async () => {
        if (confirm('Delete this habit?')) {
            await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'habits', habit.id));
        }
    }

    const Icon = habit.icon === 'BookOpen' ? BookOpen : habit.icon === 'Activity' ? Activity : habit.icon === 'Zap' ? Zap : Flame;

    return (
        <div className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${isCompletedToday ? 'bg-green-50 border-green-200' : 'bg-white border-slate-100 hover:border-blue-200'} relative`}>
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCompletedToday ? 'bg-green-200 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    <Icon size={20} />
                </div>
                <div>
                    <h4 className={`font-semibold ${isCompletedToday ? 'text-green-800 line-through opacity-70' : 'text-slate-800'}`}>{habit.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Flame size={10} className="text-orange-500" /> {habit.streak || 0} streak</span>
                        <span>•</span>
                        <span>{habit.frequency}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={toggleComplete}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition ${isCompletedToday ? 'bg-white border border-green-200 text-green-600' : 'bg-slate-900 text-white hover:bg-blue-600'}`}>
                    {isCompletedToday ? 'Undo' : 'Mark Done'}
                </button>
                <button onClick={deleteHabit} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><X size={16} /></button>
            </div>

            {/* AI Motivation Toast */}
            {showToast && (
                <div className="absolute top-0 right-0 -mt-12 bg-indigo-600 text-white text-xs px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
                    <Bot size={14} /> "Great job! Keep it up!"
                </div>
            )}
        </div>
    );
}

export default HabitItem;
