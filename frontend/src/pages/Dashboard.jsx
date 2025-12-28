import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Flame, CheckCircle2, TrendingUp, BrainCircuit, Plus, Bot, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { db, appId } from '../config/firebase';
import { BADGES } from '../constants/badges';
import CalendarGrid from '../components/dashboard/CalendarGrid';
import HabitItem from '../components/dashboard/HabitItem';
import AddHabitModal from '../components/dashboard/AddHabitModal';
import AIMentorModal from '../components/dashboard/AIMentorModal';
import { getTodayDate } from '../utils/helpers';

function Dashboard({ user }) {
    const [habits, setHabits] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAIMentor, setShowAIMentor] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    const changeMonth = (offset) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'habits'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedHabits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setHabits(fetchedHabits);
        });
        return () => unsubscribe();
    }, [user]);

    const today = getTodayDate();
    const completedToday = habits.filter(h => h.completedDates?.includes(today)).length;
    const totalHabits = habits.length;
    const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
    const currentStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0)) : 0;

    // Dynamic recent badges
    const unlockedBadges = BADGES.filter(b => b.condition(currentStreak));
    const recentBadges = unlockedBadges.slice(0, 2);

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-8 relative">

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center"><Flame size={24} /></div>
                    <div><p className="text-sm text-slate-500">Best Streak</p><h4 className="text-2xl font-bold">{currentStreak} Days</h4></div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><CheckCircle2 size={24} /></div>
                    <div><p className="text-sm text-slate-500">Today's Rate</p><h4 className="text-2xl font-bold">{completionRate}%</h4></div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><TrendingUp size={24} /></div>
                    <div><p className="text-sm text-slate-500">Total Habits</p><h4 className="text-2xl font-bold">{totalHabits}</h4></div>
                </div>
                <div
                    onClick={() => setShowAIMentor(true)}
                    className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-2xl shadow-lg shadow-indigo-200 text-white flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"><BrainCircuit size={24} /></div>
                    <div><p className="text-sm text-indigo-100">AI Mentor</p><h4 className="text-lg font-bold">Get Insights</h4></div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Calendar & Habits */}
                <div className="flex-1 space-y-8">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm pr-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-800 capitalize">
                                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h3>
                            <div className="flex gap-2">
                                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"><ChevronLeft size={20} /></button>
                                <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"><ChevronRight size={20} /></button>
                            </div>
                        </div>
                        <div className="max-w-[400px]">
                            <CalendarGrid habits={habits} currentDate={currentDate} />
                        </div>
                        <div className="mt-4 flex gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-slate-100"></div> None</div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-yellow-200"></div> Partial</div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-green-500"></div> All Done</div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-800">Your Habits</h3>
                            <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition">
                                <Plus size={16} /> Add Habit
                            </button>
                        </div>

                        <div className="space-y-4">
                            {habits.length === 0 ? (
                                <div className="text-center py-10 text-slate-400">
                                    <p>No habits yet. Click "Add Habit" to start!</p>
                                </div>
                            ) : (
                                habits.map(habit => (
                                    <HabitItem key={habit.id} habit={habit} user={user} />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: AI & Badges */}
                <div className="lg:w-80 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Trophy className="text-yellow-500" size={18} /> Recent Badges
                        </h3>
                        <div className="space-y-4">
                            {recentBadges.length > 0 ? (
                                recentBadges.map(badge => (
                                    <div key={badge.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                        <div className="text-2xl"><Flame size={20} className="text-blue-500" /></div>
                                        <div>
                                            <div className="font-semibold text-sm">{badge.name}</div>
                                            <div className="text-xs text-slate-500">{badge.description}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400">No badges earned yet.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl text-white shadow-lg">
                        <div className="flex items-start gap-4">
                            <div className="bg-white/10 p-2 rounded-lg"><BrainCircuit size={20} /></div>
                            <div>
                                <h4 className="font-bold text-sm mb-2 text-indigo-200">AI Insight</h4>
                                <p className="text-sm leading-relaxed opacity-90">
                                    "You missed <b>Reading</b> yesterday, but that's okay! A short 5-minute session today will recover your streak. You got this!"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating AI Sticker */}
            <div
                onClick={() => setShowAIMentor(true)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-white rounded-full shadow-2xl border border-slate-100 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300 z-40 group">
                <div className="absolute inset-0 bg-blue-500 rounded-full opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <Bot size={32} className="text-indigo-600" />
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
            </div>

            {showAddModal && <AddHabitModal user={user} onClose={() => setShowAddModal(false)} />}
            {showAIMentor && <AIMentorModal habits={habits} user={user} onClose={() => setShowAIMentor(false)} />}
        </div>
    );
}

export default Dashboard;
