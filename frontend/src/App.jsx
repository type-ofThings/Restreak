import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously, // Added this back as it might be needed for the environment
  onAuthStateChanged, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  arrayUnion, 
  arrayRemove,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { 
  LayoutDashboard, 
  Users, 
  Trophy, 
  User, 
  Plus, 
  Flame, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  X, 
  LogOut, 
  Settings,
  BookOpen,
  Activity,
  Zap,
  Lock,
  Unlock,
  MessageCircle,
  TrendingUp,
  BrainCircuit,
  Menu,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Bot,
  Shield,
  Heart
} from 'lucide-react';

import Logo from './assets/images/logo.jpg'
import Bg from './assets/images/bg.png'

// --- Configuration ---

const USER_FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,

};

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Use environment config if available
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : USER_FIREBASE_CONFIG;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Utility Functions ---
const getTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Just now';
  const now = new Date();
  const date = timestamp.toDate();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// --- Badge Definitions (With conditions) ---
const BADGES = [
  { id: 'first_habit', name: 'First Step', description: 'Created your first habit', icon: 'Zap', condition: (streak) => streak >= 1 },
  { id: '3_day_streak', name: 'Momentum', description: 'Reached a 3-day streak', icon: 'Flame', condition: (streak) => streak >= 3 },
  { id: 'recovery_master', name: 'Recovery Master', description: 'Came back after a missed day', icon: 'Activity', condition: () => false }, // Placeholder logic
  { id: '7_day_consistency', name: 'Consistent', description: '7 days of activity', icon: 'CalendarIcon', condition: (streak) => streak >= 7 },
  { id: 'habit_scholar', name: 'Scholar', description: 'Completed 10 study sessions', icon: 'BookOpen', condition: (streak) => streak >= 10 },
  { id: 'early_riser', name: 'Early Riser', description: 'Completed a habit before 8am', icon: 'check', condition: () => false },
];

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState('home'); 
  
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
         // Fallback for environment if needed
         await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u && (activePage === 'login' || activePage === 'signup' || activePage === 'home')) {
        setActivePage('dashboard');
      }
    });
    return () => unsubscribe();
  }, [activePage]);

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50 text-blue-600">Loading Restreak...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100">
      <Header user={user} activePage={activePage} setActivePage={setActivePage} />

      <main>
        {!user && activePage === 'home' && <LandingPage setActivePage={setActivePage} />}
        {!user && activePage === 'login' && <AuthForm type="login" setActivePage={setActivePage} />}
        {!user && activePage === 'signup' && <AuthForm type="signup" setActivePage={setActivePage} />}
        
        {user && activePage === 'dashboard' && <Dashboard user={user} />}
        {user && activePage === 'communities' && <Communities user={user} />}
        {user && activePage === 'rewards' && <Rewards user={user} />}
        {user && activePage === 'profile' && <Profile user={user} setActivePage={setActivePage} />}
        
        {!user && ['dashboard', 'communities', 'rewards', 'profile'].includes(activePage) && (
           <div className="flex flex-col items-center justify-center h-[60vh]">
             <h2 className="text-2xl font-bold text-slate-800 mb-4">Please Log In</h2>
             <button onClick={() => setActivePage('login')} className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition">Go to Login</button>
           </div>
        )}
      </main>

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
    </div>
  );
}

// --- Components ---

function Header({ user, activePage, setActivePage }) {
  const navClass = (page) => 
    `cursor-pointer px-3 py-2 text-sm font-medium transition-colors ${activePage === page ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'}`;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActivePage(user ? 'dashboard' : 'home')}>
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg"><img src={Logo} alt="" /></div>
        <span className="font-bold text-lg tracking-tight text-slate-800">Restreak</span>
      </div>

      <nav className="hidden md:flex items-center gap-6">
        <button onClick={() => setActivePage(user ? 'dashboard' : 'home')} className={navClass('home')}>Home</button>
        {!user && (
           <>
              <button className="text-slate-500 hover:text-blue-600 text-sm font-medium">Features</button>
              <button className="text-slate-500 hover:text-blue-600 text-sm font-medium">Download</button>
              <button className="text-slate-500 hover:text-blue-600 text-sm font-medium">Blog</button>
           </>
        )}
        {user && (
          <>
            <button onClick={() => setActivePage('communities')} className={navClass('communities')}>Communities</button>
            <button onClick={() => setActivePage('rewards')} className={navClass('rewards')}>Rewards</button>
            <button onClick={() => setActivePage('profile')} className={navClass('profile')}>Profile</button>
          </>
        )}
      </nav>

      <div className="flex items-center gap-3">
        {!user ? (
          <>
            <button onClick={() => setActivePage('login')} className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-xl hover:bg-blue-50 transition">Sign In</button>
            <button onClick={() => setActivePage('signup')} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">Sign Up</button>
          </>
        ) : (
          <div onClick={() => setActivePage('profile')} className="flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition">
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

function LandingPage({ setActivePage }) {
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
          <button onClick={() => setActivePage('signup')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition shadow-xl shadow-blue-600/20 hover:-translate-y-1">
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
                 <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600"><Flame/></div>
                 <div>
                    <h4 className="font-bold text-lg">Smart Streaks</h4>
                    <p className="text-sm text-slate-500">Recovery based system</p>
                 </div>
              </div>
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 h-[180px] flex items-center gap-4 hover:-translate-x-2 transition-transform">
                 <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600"><BrainCircuit/></div>
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
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4"><BrainCircuit size={28}/></div>
              <h3 className="text-2xl font-bold text-slate-800">AI That Understands You</h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Restreak assistant adapts to your behavior, offering motivation, reminders, and emotional support when consistency feels difficult.
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-2xl hover:bg-slate-50 transition">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4"><Activity size={28}/></div>
              <h3 className="text-2xl font-bold text-slate-800">Flexible Streak System</h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Unlike traditional apps, HabitAI allows recovery days so one missed habit doesn’t erase weeks of progress.
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-2xl hover:bg-slate-50 transition">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4"><Users size={28}/></div>
              <h3 className="text-2xl font-bold text-slate-800">Private & Supportive Communities</h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Join goal-based communities where progress is shared collectively, avoiding unhealthy comparison or public pressure.
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-2xl hover:bg-slate-50 transition">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4"><Trophy size={28}/></div>
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
             {title: "Adaptive Motivation", desc: "AI reacts to your behavior and sends the right push at the right time.", icon: Sparkles, color: "text-yellow-500"},
             {title: "Streak Recovery", desc: "Missed a day? No worries — regain streak with small consistent effort.", icon: TrendingUp, color: "text-green-500"},
             {title: "Privacy First", desc: "Choose what stays private, what friends can see.", icon: Shield, color: "text-blue-500"},
             {title: "Supportive Community", desc: "Motivation without comparison or pressure.", icon: Heart, color: "text-red-500"}
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

function AuthForm({ type, setActivePage }) {
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
           <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
           Continue with Google
        </button>

        <p className="text-center mt-6 text-slate-600">
          {type === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setActivePage(type === 'login' ? 'signup' : 'login')} className="text-blue-600 font-bold hover:underline">
            {type === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
}

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
  // LOGIC FIX 2: Accurate completion rate
  const totalHabits = habits.length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const currentStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0)) : 0;

  // LOGIC FIX 4: Dynamic recent badges
  const unlockedBadges = BADGES.filter(b => b.condition(currentStreak));
  const recentBadges = unlockedBadges.slice(0, 2);

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 relative">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center"><Flame size={24}/></div>
           <div><p className="text-sm text-slate-500">Best Streak</p><h4 className="text-2xl font-bold">{currentStreak} Days</h4></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><CheckCircle2 size={24}/></div>
           <div><p className="text-sm text-slate-500">Today's Rate</p><h4 className="text-2xl font-bold">{completionRate}%</h4></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><TrendingUp size={24}/></div>
           <div><p className="text-sm text-slate-500">Total Habits</p><h4 className="text-2xl font-bold">{totalHabits}</h4></div>
        </div>
        <div 
          onClick={() => setShowAIMentor(true)}
          className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-2xl shadow-lg shadow-indigo-200 text-white flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition">
           <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"><BrainCircuit size={24}/></div>
           <div><p className="text-sm text-indigo-100">AI Mentor</p><h4 className="text-lg font-bold">Get Insights</h4></div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Calendar & Habits */}
        <div className="flex-1 space-y-8">
           {/* LOGIC FIX 5: Calendar space adjustment using padding-right on the container div */}
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm pr-8">
             <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-lg text-slate-800 capitalize">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
               </h3>
               <div className="flex gap-2">
                  <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"><ChevronLeft size={20}/></button>
                  <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"><ChevronRight size={20}/></button>
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
                 <Trophy className="text-yellow-500" size={18}/> Recent Badges
              </h3>
              <div className="space-y-4">
                 {recentBadges.length > 0 ? (
                    recentBadges.map(badge => (
                        <div key={badge.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                            <div className="text-2xl"><badge.icon size={20} className="text-blue-500"/></div>
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
               <div className="bg-white/10 p-2 rounded-lg"><BrainCircuit size={20}/></div>
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

function CalendarGrid({ habits, currentDate }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const startingSlot = firstDay === 0 ? 6 : firstDay - 1;
  const days = Array.from({length: daysInMonth}, (_, i) => i + 1);
  const todayStr = getTodayDate();

  return (
    <div className="grid grid-cols-7 gap-2 text-center">
       {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => (
         <div key={d} className="text-xs font-semibold text-slate-400 mb-1">{d}</div>
       ))}
       {Array.from({length: startingSlot}).map((_, i) => (
         <div key={`empty-${i}`} className="w-10 h-10"></div>
       ))}
       {days.map(day => {
          const d = new Date(year, month, day);
          const yStr = d.getFullYear();
          const mStr = String(d.getMonth() + 1).padStart(2, '0');
          const dStr = String(d.getDate()).padStart(2, '0');
          const dateStr = `${yStr}-${mStr}-${dStr}`;
          
          let statusColor = 'bg-slate-100 text-slate-400';
          if (dateStr <= todayStr) {
             const habitsDoneOnDay = habits.filter(h => h.completedDates?.includes(dateStr)).length;
             const total = habits.length;
             if (total > 0 && habitsDoneOnDay === total) statusColor = 'bg-green-500 text-white shadow-sm';
             else if (habitsDoneOnDay > 0) statusColor = 'bg-yellow-300 text-yellow-800';
             else if (dateStr < todayStr) statusColor = 'bg-red-100 text-red-400';
          }
          const isToday = dateStr === todayStr;
          return (
             <div key={day} className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition ${statusColor} ${isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
                {day}
             </div>
          );
       })}
    </div>
  );
}

function HabitItem({ habit, user }) {
  const isCompletedToday = habit.completedDates?.includes(getTodayDate());
  const [showToast, setShowToast] = useState(false);
  
  const toggleComplete = async () => {
    const today = getTodayDate();
    const habitRef = doc(db, 'artifacts', appId, 'users', user.uid, 'habits', habit.id);

    if (isCompletedToday) {
      await updateDoc(habitRef, {
        completedDates: arrayRemove(today),
        streak: Math.max(0, (habit.streak || 1) - 1)
      });
    } else {
      await updateDoc(habitRef, {
        completedDates: arrayUnion(today),
        streak: (habit.streak || 0) + 1
      });
      // Log activity
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'activity'), {
        text: `Completed "${habit.title}"`,
        type: 'completion',
        timestamp: serverTimestamp()
      });
      // Show AI Motivation Toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const deleteHabit = async () => {
    if(confirm('Delete this habit?')) {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'habits', habit.id));
    }
  }

  const Icon = habit.icon === 'BookOpen' ? BookOpen : habit.icon === 'Activity' ? Activity : habit.icon === 'Zap' ? Zap : Flame;

  return (
    <div className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${isCompletedToday ? 'bg-green-50 border-green-200' : 'bg-white border-slate-100 hover:border-blue-200'} relative`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCompletedToday ? 'bg-green-200 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
           <Icon size={20} />
        </div>
        <div>
           <h4 className={`font-semibold ${isCompletedToday ? 'text-green-800 line-through opacity-70' : 'text-slate-800'}`}>{habit.title}</h4>
           <div className="flex items-center gap-2 text-xs text-slate-500">
             <span className="flex items-center gap-1"><Flame size={10} className="text-orange-500"/> {habit.streak || 0} streak</span>
             <span>•</span>
             <span>{habit.frequency}</span>
           </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
         <button 
           onClick={toggleComplete}
           className={`px-4 py-2 rounded-lg font-medium text-sm transition ${isCompletedToday ? 'bg-white border border-green-200 text-green-600' : 'bg-slate-900 text-white hover:bg-blue-600'}`}>
           {isCompletedToday ? 'Undo' : 'Mark Done'}
         </button>
         <button onClick={deleteHabit} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><X size={16}/></button>
      </div>

      {/* AI Motivation Toast */}
      {showToast && (
        <div className="absolute top-0 right-0 -mt-12 bg-indigo-600 text-white text-xs px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
           <Bot size={14}/> "Great job! Keep it up!"
        </div>
      )}
    </div>
  );
}

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
  // ... rest of modal UI ...
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-xl font-bold">New Habit</h3>
           <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full"><X size={20}/></button>
        </div>
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
           <button type="button" onClick={() => {setTitle('Read Book'); setIcon('BookOpen')}} className="flex-shrink-0 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-100 hover:bg-purple-100">📖 Read</button>
           <button type="button" onClick={() => {setTitle('Morning Run'); setIcon('Activity')}} className="flex-shrink-0 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium border border-orange-100 hover:bg-orange-100">🏃 Run</button>
           <button type="button" onClick={() => {setTitle('Coding'); setIcon('Zap')}} className="flex-shrink-0 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100 hover:bg-blue-100">💻 Code</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Habit Name</label>
            <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500" placeholder="e.g. Drink Water" value={title} onChange={e=>setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
            <select className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none" value={frequency} onChange={e=>setFrequency(e.target.value)}>
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
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3"><BrainCircuit size={32}/></div>
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
                 <Sparkles size={16}/> New Advice
              </button>
              <button onClick={onClose} className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium">Close</button>
           </div>
        </div>
     </div>
  )
}

function Communities({ user }) {
   return (
      <div className="max-w-4xl mx-auto p-8">
         <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-800">Communities</h2>
            <p className="text-slate-500 mt-2">Find people with similar goals. No pressure. Just progress.</p>
         </div>

         <div className="space-y-6">
            {[
               {name: "Daily Readers", members: "4.2k", icon: BookOpen, color: "bg-purple-100 text-purple-600"},
               {name: "Early Risers", members: "12.5k", icon: Zap, color: "bg-yellow-100 text-yellow-600"},
               {name: "Fitness & Movement", members: "8.1k", icon: Activity, color: "bg-green-100 text-green-600"},
            ].map((comm, i) => (
               <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-blue-300 transition group">
                  <div className="flex items-center gap-4">
                     <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${comm.color}`}>
                        <comm.icon size={28}/>
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

function Rewards({ user }) {
   // Calculate user's max streak for badge logic
   const [maxStreak, setMaxStreak] = useState(0);

   useEffect(() => {
      if(!user) return;
      const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'habits'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
         const habits = snapshot.docs.map(doc => doc.data());
         // Simple max streak across all habits
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
               // LOGIC FIX 3: Correct condition for streak unlocking
               const isUnlocked = badge.condition(maxStreak); 
               
               const Icon = badge.icon === 'Zap' ? Zap : badge.icon === 'Flame' ? Flame : badge.icon === 'Activity' ? Activity : badge.icon === 'CalendarIcon' ? CalendarIcon : BookOpen;
               return (
                  <div key={badge.id} className={`p-6 rounded-2xl border text-center transition flex flex-col items-center gap-3 ${isUnlocked ? 'bg-white border-green-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-60 grayscale'}`}>
                     <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${isUnlocked ? 'bg-gradient-to-br from-yellow-100 to-orange-100 text-orange-500' : 'bg-slate-200 text-slate-400'}`}>
                        {isUnlocked ? <Icon size={32}/> : <Lock size={24}/>}
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

function Profile({ user, setActivePage }) {
   const [habits, setHabits] = useState([]);
   const [activities, setActivities] = useState([]);
   const [userData, setUserData] = useState(null);

   const handleLogout = async () => {
      await signOut(auth);
      setActivePage('home');
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
         if(snap.exists()) setUserData(snap.data());
      });

      return () => { habitsUnsub(); activityUnsub(); userDocUnsub(); };
   }, [user]);

   const totalHabits = habits.length;
   const activeStreaks = habits.filter(h => h.streak > 0).length;
   const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0)) : 0;
   const earnedBadges = userData?.badges?.length || 0;
   
   // LOGIC FIX 2: Accurate Completion Rate Calculation
   const today = getTodayDate();
   const completedToday = habits.filter(h => h.completedDates?.includes(today)).length;
   const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

   // LOGIC FIX 1: Top Achievements Section Logic
   const unlockedBadges = BADGES.filter(b => b.condition(longestStreak));
   const topAchievements = unlockedBadges.slice(0, 3); // Get top 3 badges

   let daysActive = 0;
   if (userData?.joinDate) {
      const diff = new Date() - userData.joinDate.toDate();
      daysActive = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
   }

   const stats = [
      { label: "Total Habits", value: totalHabits, icon: BookOpen },
      { label: "Active Streaks", value: activeStreaks, icon: Flame },
      { label: "Days Active", value: daysActive, icon: CalendarIcon },
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
                     <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold border border-orange-100 flex items-center gap-1"><Flame size={12}/> {longestStreak} Day Streak</span>
                  </div>
               </div>
               <div className="flex gap-2">
                  <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition text-sm font-medium">
                     <LogOut size={16}/> Sign Out
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

         {/* LOGIC FIX 1: Top Achievements UI Section */}
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
                           {act.type === 'completion' ? <CheckCircle2 size={16}/> : <BookOpen size={16}/>}
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