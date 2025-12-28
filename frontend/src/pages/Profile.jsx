import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, query, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';
import { LogOut, BookOpen, Flame, CalendarIcon as Calendar, Trophy, TrendingUp, CheckCircle2 } from 'lucide-react';
import { auth, db, appId } from '../config/firebase';
import { BADGES } from '../constants/badges';
import { getTodayDate, formatTimeAgo } from '../utils/helpers';

function Profile({ user }) {
    const navigate = useNavigate();
    const [habits, setHabits] = useState([]);
    const [activities, setActivities] = useState([]);
    const [userData, setUserData] = useState(null);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/');
    };

    useEffect(() => {
        if (!user) return;
        const qHabits = query(collection(db, 'artifacts', appId, 'users', user.uid, 'habits'));
        const habitsUnsub = onSnapshot(qHabits, (snap) => {
            setHabits(snap.docs.map(d => d.data()));
        });

        const qActivity = query(collection(db, 'artifacts', appId, 'users', user.uid, 'activity'), orderBy('timestamp', 'desc'), limit(5));
        const activityUnsub = onSnapshot(qActivity, (snap) => {
            setActivities(snap.docs.map(d => d.data()));
        });

        const userDocUnsub = onSnapshot(doc(db, 'artifacts', appId, 'users', user.uid), (snap) => {
            if (snap.exists()) setUserData(snap.data());
        });

        return () => { habitsUnsub(); activityUnsub(); userDocUnsub(); };
    }, [user]);

    const totalHabits = habits.length;
    const activeStreaks = habits.filter(h => h.streak > 0).length;
    const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0)) : 0;
    const earnedBadges = userData?.badges?.length || 0;

    const today = getTodayDate();
    const completedToday = habits.filter(h => h.completedDates?.includes(today)).length;
    const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

    const unlockedBadges = BADGES.filter(b => b.condition(longestStreak));
    const topAchievements = unlockedBadges.slice(0, 3);

    let daysActive = 0;
    if (userData?.joinDate) {
        const diff = new Date() - userData.joinDate.toDate();
        daysActive = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
    }

    const stats = [
        { label: "Total Habits", value: totalHabits, icon: BookOpen },
        { label: "Active Streaks", value: activeStreaks, icon: Flame },
        { label: "Days Active", value: daysActive, icon: Calendar },
        { label: "Badges Earned", value: earnedBadges, icon: Trophy },
        { label: "Longest Streak", value: longestStreak, icon: TrendingUp },
        { label: "Completion Rate", value: `${completionRate}%`, icon: CheckCircle2 }
    ];

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-8">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                <div className="bg-slate-50 p-8 flex flex-col md:flex-row items-center gap-6 border-b border-slate-100">
                    <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-200">
                        {user.displayName ? user.displayName[0] : 'U'}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h2 className="text-2xl font-bold text-slate-800">{user.displayName || 'User'}</h2>
                        <p className="text-slate-500 text-sm mb-4">{user.email}</p>
                        <div className="flex justify-center md:justify-start gap-2">
                            <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold border border-orange-100 flex items-center gap-1"><Flame size={12} /> {longestStreak} Day Streak</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition text-sm font-medium">
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-y divide-slate-100 border-b border-slate-100">
                    {stats.map((stat, i) => (
                        <div key={i} className="p-6 text-center hover:bg-slate-50 transition">
                            <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide font-medium mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 mb-8">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Top Achievements</h3>
                <div className="flex gap-4">
                    {topAchievements.length > 0 ? (
                        topAchievements.map(badge => (
                            <div key={badge.id} className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl border border-yellow-100">
                                <Trophy size={16} /> <span className="text-sm font-bold">{badge.name}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-400 text-sm">No achievements unlocked yet.</p>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
                <h3 className="font-bold text-lg mb-6 text-slate-800">Recent Activity</h3>
                {activities.length === 0 ? (
                    <p className="text-slate-400 text-sm">No recent activity.</p>
                ) : (
                    <div className="space-y-4">
                        {activities.map((act, i) => (
                            <div key={i} className="flex items-center gap-4 text-sm p-3 rounded-xl border border-slate-100 bg-slate-50">
                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                                    {act.type === 'completion' ? <CheckCircle2 size={16} /> : <BookOpen size={16} />}
                                </div>
                                <span className="text-slate-800 font-medium">{act.text}</span>
                                <span className="text-slate-400 text-xs ml-auto">{formatTimeAgo(act.timestamp)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Profile;
