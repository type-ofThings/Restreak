import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../../assets/images/logo.jpg';

function Header({ user }) {
    const navigate = useNavigate();
    const location = useLocation();

    const navClass = (path) =>
        `cursor-pointer px-3 py-2 text-sm font-medium transition-colors ${location.pathname === path ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'}`;

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(user ? '/dashboard' : '/')}>
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg"><img src={Logo} alt="" /></div>
                <span className="font-bold text-lg tracking-tight text-slate-800">Restreak</span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
                <button onClick={() => navigate(user ? '/dashboard' : '/')} className={navClass('/')}>Home</button>
                {!user && (
                    <>
                        <button className="text-slate-500 hover:text-blue-600 text-sm font-medium">Features</button>
                        <button className="text-slate-500 hover:text-blue-600 text-sm font-medium">Download</button>
                        <button className="text-slate-500 hover:text-blue-600 text-sm font-medium">Blog</button>
                    </>
                )}
                {user && (
                    <>
                        <button onClick={() => navigate('/communities')} className={navClass('/communities')}>Communities</button>
                        <button onClick={() => navigate('/rewards')} className={navClass('/rewards')}>Rewards</button>
                        <button onClick={() => navigate('/profile')} className={navClass('/profile')}>Profile</button>
                    </>
                )}
            </nav>

            <div className="flex items-center gap-3">
                {!user ? (
                    <>
                        <button onClick={() => navigate('/login')} className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-xl hover:bg-blue-50 transition">Sign In</button>
                        <button onClick={() => navigate('/signup')} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">Sign Up</button>
                    </>
                ) : (
                    <div onClick={() => navigate('/profile')} className="flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                            {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                        </div>
                        <span className="text-sm font-medium text-slate-700 pr-1 hidden sm:block">
                            {user.displayName || 'User'}
                        </span>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;
