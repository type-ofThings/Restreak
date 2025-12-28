import React from 'react';

function Footer() {
    return (
        <footer className="bg-white border-t border-slate-200 mt-20 py-12 px-6">
            <div className="max-w-6xl mx-auto text-center">
                <p className="text-slate-600 max-w-2xl mx-auto mb-8 text-sm leading-relaxed">
                    An AI-powered habit building platform focused on long-term consistency,
                    motivation, and recovery without guilt or pressure.
                </p>
                <div className="flex justify-center gap-6 mb-8 text-sm font-medium text-blue-600">
                    <a href="#" className="hover:underline">About</a>
                    <a href="#" className="hover:underline">Privacy Policy</a>
                    <a href="#" className="hover:underline">Terms</a>
                    <a href="#" className="hover:underline">Contact</a>
                </div>
                <small className="text-slate-400">© 2025 HabitAI. All rights reserved.</small>
            </div>
        </footer>
    );
}

export default Footer;
