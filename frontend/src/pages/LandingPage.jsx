import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Flame, BrainCircuit, Sparkles, TrendingUp, Shield, Heart, BookOpen, Activity, Users, Trophy } from 'lucide-react';
import Bg from '../assets/images/bg.png';

function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="w-full">
            {/* HERO SECTION */}
            <section className="text-center pt-24 pb-20 px-6 max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wide mb-6">
                    <Zap size={14} /> AI-powered habit building
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight mb-8">
                    Build habits that last <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">without guilt or pressure</span>
                </h1>

                <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                    HabitAI helps you stay consistent using AI motivation, recovery-based streaks,
                    and a calm, supportive system designed for long-term growth.
                </p>

                <div className="flex justify-center gap-4">
                    <button onClick={() => navigate('/signup')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition shadow-xl shadow-blue-600/20 hover:-translate-y-1">
                        Get Started Free
                    </button>
                </div>
            </section>

            {/* UI PREVIEW SECTION */}
            <section className="px-6 pb-20 max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-800">Designed for Clarity & Motivation</h2>
                </div>

                {/* Mock UI Grid - simulating img-main, img-small, img-side */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    {/* Main Screenshot Placeholder */}
                    <div className="md:col-span-2 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden h-[400px] flex flex-col relative group hover:-translate-y-2 transition-transform duration-500">
                        <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="p-2 flex-1 bg-gradient-to-br from-white to-slate-50 flex items-center justify-center">
                            <div className="text-center">
                                <img src={Bg} alt="" />
                                <p className="text-slate-400 font-medium">Interactive Dashboard Preview</p>
                            </div>
                        </div>
                    </div>

                    {/* Side/Small Screenshots */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 h-[180px] flex items-center gap-4 hover:-translate-x-2 transition-transform">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600"><Flame /></div>
                            <div>
                                <h4 className="font-bold text-lg">Smart Streaks</h4>
                                <p className="text-sm text-slate-500">Recovery based system</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 h-[180px] flex items-center gap-4 hover:-translate-x-2 transition-transform">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600"><BrainCircuit /></div>
                            <div>
                                <h4 className="font-bold text-lg">AI Mentor</h4>
                                <p className="text-sm text-slate-500">Personalized tips</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES DETAILED */}
            <section id="features" className="py-24 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-slate-800">Everything Restreak Helps You With</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4 p-6 rounded-2xl hover:bg-slate-50 transition">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4"><BrainCircuit size={28} /></div>
                            <h3 className="text-2xl font-bold text-slate-800">AI That Understands You</h3>
                            <p className="text-slate-600 text-lg leading-relaxed">
                                Restreak assistant adapts to your behavior, offering motivation, reminders, and emotional support when consistency feels difficult.
                            </p>
                        </div>

                        <div className="space-y-4 p-6 rounded-2xl hover:bg-slate-50 transition">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4"><Activity size={28} /></div>
                            <h3 className="text-2xl font-bold text-slate-800">Flexible Streak System</h3>
                            <p className="text-slate-600 text-lg leading-relaxed">
                                Unlike traditional apps, HabitAI allows recovery days so one missed habit doesn't erase weeks of progress.
                            </p>
                        </div>

                        <div className="space-y-4 p-6 rounded-2xl hover:bg-slate-50 transition">
                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4"><Users size={28} /></div>
                            <h3 className="text-2xl font-bold text-slate-800">Private & Supportive Communities</h3>
                            <p className="text-slate-600 text-lg leading-relaxed">
                                Join goal-based communities where progress is shared collectively, avoiding unhealthy comparison or public pressure.
                            </p>
                        </div>

                        <div className="space-y-4 p-6 rounded-2xl hover:bg-slate-50 transition">
                            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4"><Trophy size={28} /></div>
                            <h3 className="text-2xl font-bold text-slate-800">Meaningful Rewards</h3>
                            <p className="text-slate-600 text-lg leading-relaxed">
                                Earn badges based on effort and long-term consistency, not perfection. Rewards reflect growth, not streak obsession.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* AI DEMO SECTION */}
            <section className="py-24 bg-[#eef2ff] text-center px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Your AI Habit Mentor in Action</h2>
                <p className="text-slate-500 mb-16 text-lg">A system designed to help you restart, not regret.</p>

                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { title: "Adaptive Motivation", desc: "AI reacts to your behavior and sends the right push at the right time.", icon: Sparkles, color: "text-yellow-500" },
                        { title: "Streak Recovery", desc: "Missed a day? No worries — regain streak with small consistent effort.", icon: TrendingUp, color: "text-green-500" },
                        { title: "Privacy First", desc: "Choose what stays private, what friends can see.", icon: Shield, color: "text-blue-500" },
                        { title: "Supportive Community", desc: "Motivation without comparison or pressure.", icon: Heart, color: "text-red-500" }
                    ].map((card, i) => (
                        <div key={i} className="bg-white p-8 rounded-3xl shadow-xl hover:-translate-y-2 transition-transform duration-300">
                            <card.icon className={`mx-auto mb-6 ${card.color}`} size={42} />
                            <h3 className="font-bold text-lg text-slate-800 mb-3">{card.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{card.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default LandingPage;
