import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { X } from 'lucide-react';
import { db, appId } from '../../config/firebase';

function AddHabitModal({ user, onClose }) {
    const [title, setTitle] = useState('');
    const [frequency, setFrequency] = useState('Daily');
    const [icon, setIcon] = useState('Zap');

    const handleSubmit = async (e) => {
        e.preventDefault();
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'habits'), {
            title,
            frequency,
            icon,
            createdAt: serverTimestamp(),
            completedDates: [],
            streak: 0
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">New Habit</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                </div>
                <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                    <button type="button" onClick={() => { setTitle('Read Book'); setIcon('BookOpen') }} className="flex-shrink-0 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-100 hover:bg-purple-100">📖 Read</button>
                    <button type="button" onClick={() => { setTitle('Morning Run'); setIcon('Activity') }} className="flex-shrink-0 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium border border-orange-100 hover:bg-orange-100">🏃 Run</button>
                    <button type="button" onClick={() => { setTitle('Coding'); setIcon('Zap') }} className="flex-shrink-0 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100 hover:bg-blue-100">💻 Code</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Habit Name</label>
                        <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500" placeholder="e.g. Drink Water" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                        <select className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none" value={frequency} onChange={e => setFrequency(e.target.value)}>
                            <option>Daily</option>
                            <option>Weekly</option>
                            <option>Weekdays</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition mt-2">Create Habit</button>
                </form>
            </div>
        </div>
    );
}

export default AddHabitModal;
