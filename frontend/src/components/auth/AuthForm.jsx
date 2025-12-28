import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, appId } from '../../config/firebase';

function AuthForm({ type }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (type === 'signup') {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
                // Create initial user doc
                await setDoc(doc(db, 'artifacts', appId, 'users', userCredential.user.uid), {
                    displayName: name,
                    email: email,
                    joinDate: serverTimestamp(),
                    badges: []
                });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    displayName: user.displayName,
                    email: user.email,
                    joinDate: serverTimestamp(),
                    badges: []
                });
            }
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError(err.message.replace('Firebase: ', ''));
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md">
                <h2 className="text-3xl font-bold mb-2 text-slate-800">{type === 'login' ? 'Welcome back' : 'Create Account'}</h2>
                <p className="text-slate-500 mb-8">{type === 'login' ? 'Log in to continue your habit journey' : 'Start building better habits today'}</p>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {type === 'signup' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                            <input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" value={name} onChange={e => setName(e.target.value)} />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input type="email" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input type="password" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition shadow-lg shadow-blue-600/20 mt-4">
                        {type === 'login' ? 'Sign In' : 'Get Started'}
                    </button>
                </form>

                <div className="my-6 flex items-center gap-3">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <span className="text-slate-400 text-xs font-bold">OR</span>
                    <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                <button onClick={handleGoogleLogin} type="button" className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-3.5 rounded-xl transition hover:bg-slate-50 flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                    Continue with Google
                </button>

                <p className="text-center mt-6 text-slate-600">
                    {type === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => navigate(type === 'login' ? '/signup' : '/login')} className="text-blue-600 font-bold hover:underline">
                        {type === 'login' ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default AuthForm;
