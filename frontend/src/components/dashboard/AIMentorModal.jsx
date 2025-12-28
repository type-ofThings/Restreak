import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles } from 'lucide-react';
import { GEMINI_API_KEY } from '../../constants/badges';

function AIMentorModal({ habits, user, onClose }) {
    const [advice, setAdvice] = useState('');
    const [loading, setLoading] = useState(false);

    const generateAdvice = async () => {
        setLoading(true);
        try {
            const habitNames = habits.map(h => h.title).join(", ");
            const streak = habits.reduce((acc, h) => acc + (h.streak || 0), 0);

            const prompt = `
        You are a motivational habit coach. 
        User ${user.displayName} has these habits: ${habitNames}. 
        Current total streak is ${streak} days.
        
        TASK:
        1. If they have a habit related to 'Coding', 'Programming', 'Dev', or 'Tech', give a SPECIFIC tip about that (e.g., "Clean code", "Commit often", "Take breaks").
        2. If no tech habits, give a general consistency tip.
        3. Keep it short (max 2 sentences).
        4. Be encouraging but practical.
      `;

            // Use the API key securely injected by the environment
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Consistency is the code to success!";
            setAdvice(text);
        } catch (e) {
            setAdvice("Consistency is key! You are doing great.");
        }
        setLoading(false);
    };

    useEffect(() => { generateAdvice(); }, []);

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
                <div className="bg-indigo-600 p-6 text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3"><BrainCircuit size={32} /></div>
                    <h3 className="font-bold text-xl">Habit Mentor</h3>
                    <p className="text-indigo-200 text-sm">Powered by Gemini AI</p>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-600 text-sm leading-relaxed min-h-[80px] flex items-center justify-center text-center">
                        {loading ? (
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                            </div>
                        ) : advice}
                    </div>
                    <button onClick={generateAdvice} className="w-full bg-indigo-50 text-indigo-700 py-3 rounded-xl font-medium hover:bg-indigo-100 transition flex items-center justify-center gap-2">
                        <Sparkles size={16} /> New Advice
                    </button>
                    <button onClick={onClose} className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium">Close</button>
                </div>
            </div>
        </div>
    )
}

export default AIMentorModal;
