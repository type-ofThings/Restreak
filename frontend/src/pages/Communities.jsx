import React from 'react';
import { BookOpen, Zap, Activity } from 'lucide-react';

function Communities({ user }) {
    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-800">Communities</h2>
                <p className="text-slate-500 mt-2">Find people with similar goals. No pressure. Just progress.</p>
            </div>

            <div className="space-y-6">
                {[
                    { name: "Daily Readers", members: "4.2k", icon: BookOpen, color: "bg-purple-100 text-purple-600" },
                    { name: "Early Risers", members: "12.5k", icon: Zap, color: "bg-yellow-100 text-yellow-600" },
                    { name: "Fitness & Movement", members: "8.1k", icon: Activity, color: "bg-green-100 text-green-600" },
                ].map((comm, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-blue-300 transition group">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${comm.color}`}>
                                <comm.icon size={28} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">{comm.name}</h3>
                                <p className="text-sm text-slate-500">{comm.members} members • Active now</p>
                            </div>
                        </div>
                        <button className="bg-slate-100 text-slate-700 px-6 py-2 rounded-xl font-medium group-hover:bg-blue-600 group-hover:text-white transition">Join</button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Communities;
