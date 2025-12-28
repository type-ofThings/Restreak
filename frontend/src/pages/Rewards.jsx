import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { Zap, Flame, Activity, CalendarIcon as Calendar, BookOpen, Lock } from 'lucide-react';
import { db, appId } from '../config/firebase';
import { BADGES } from '../constants/badges';

function Rewards({ user }) {
    const [maxStreak, setMaxStreak] = useState(0);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'habits'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const habits = snapshot.docs.map(doc => doc.data());
            const currentMax = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
            setMaxStreak(currentMax);
        });
        return () => unsubscribe();
    }, [user]);

    return (
        <div className="max-w-5xl mx-auto p-8">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-800">Achievements</h1>
                <p className="text-slate-500 mt-2">Badges earned through consistency and recovery.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {BADGES.map((badge, idx) => {
                    const isUnlocked = badge.condition(maxStreak);

                    const Icon = badge.icon === 'Zap' ? Zap : badge.icon === 'Flame' ? Flame : badge.icon === 'Activity' ? Activity : badge.icon === 'CalendarIcon' ? Calendar : BookOpen;
                    return (
                        <div key={badge.id} className={`p-6 rounded-2xl border text-center transition flex flex-col items-center gap-3 ${isUnlocked ? 'bg-white border-green-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-60 grayscale'}`}>
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${isUnlocked ? 'bg-gradient-to-br from-yellow-100 to-orange-100 text-orange-500' : 'bg-slate-200 text-slate-400'}`}>
                                {isUnlocked ? <Icon size={32} /> : <Lock size={24} />}
                            </div>
                            <h3 className="font-bold text-slate-800">{badge.name}</h3>
                            <p className="text-xs text-slate-500 leading-tight">{badge.description}</p>
                            {isUnlocked && <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full mt-2">Unlocked</div>}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Rewards;
