"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  increment,
  serverTimestamp,
  getDocs,
  deleteDoc,
  orderBy
} from 'firebase/firestore';
import { 
  Trophy, Lock, Zap, User, Send, CheckCircle, Crown, 
  Settings, LogOut, Twitch, Calendar, ArrowRight, Play, Star,
  AlertTriangle, ExternalLink, Image as ImageIcon, Trash2, Check, Clock, X, ShieldAlert,
  Gamepad2, Users, AlertCircle, Ghost, Heart, MessageSquare, Mic, Skull, Gem, Sparkles, Paintbrush
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- ICONO DE GOOGLE ---
const GoogleIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.347.533 12S5.867 24 12.48 24c3.44 0 6.013-1.133 8.027-3.227C22.613 18.68 23.28 15.707 23.28 13.373c0-.92-.08-1.827-.213-2.453H12.48z" />
  </svg>
);

// --- 1. CONFIGURACIÓN FIREBASE ---
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const APP_ID = 'awards-2024-production';

// --- 2. CONFIGURACIÓN DEL EVENTO ---
const PHASE_DATES = {
  votingStart: new Date('2025-12-20T18:00:00'),
  galaStart: new Date('2025-12-31T20:00:00')
};

// DEFINICIÓN DE CATEGORÍAS
const CATEGORIES = [
  // --- CLIPS Y MOMENTOS ---
  { 
    id: 'cat_clip', 
    name: 'Clip del Año', 
    icon: Play, 
    desc: 'El momento más viral y compartido.',
    type: 'clip',       
    restricted: false   
  },
  { 
    id: 'cat_fail', 
    name: 'Fail del Año', 
    icon: AlertTriangle, 
    desc: 'Cuando todo salió terriblemente mal.',
    type: 'clip',
    restricted: false
  },
  { 
    id: 'cat_susto', 
    name: 'Susto del Año', 
    icon: Ghost, 
    desc: 'El grito que rompió tímpanos.',
    type: 'clip',
    restricted: false
  },
  { 
    id: 'cat_rage', 
    name: 'Enfado del Año', 
    icon: Skull, 
    desc: 'El momento de furia absoluta.',
    type: 'clip',
    restricted: false
  },
  
  // --- COMUNIDAD ---
  { 
    id: 'cat_vip', 
    name: 'Mejor VIP', 
    icon: Gem, 
    desc: 'El VIP que más aporta al stream.',
    type: 'text',
    restricted: false
  },
  { 
    id: 'cat_sub', 
    name: 'Mejor Sub', 
    icon: Star, 
    desc: 'El suscriptor legendario.',
    type: 'text',
    restricted: true    // 🔒 SOLO MODS ELIGEN
  },
  { 
    id: 'cat_artist', 
    name: 'Artista de la Comu', 
    icon: Paintbrush, 
    desc: 'Mejores fanarts o edits.',
    type: 'text',
    restricted: false 
  },
  { 
    id: 'cat_mod', 
    name: 'Mod del Año', 
    icon: Users, 
    desc: 'La espada y el escudo del chat.',
    type: 'text',
    restricted: true    // 🔒 SOLO MODS
  },

  // --- CONTENIDO GENERAL ---
  { 
    id: 'cat_game', 
    name: 'Juego del Año', 
    icon: Gamepad2, 
    desc: 'El vicio supremo.',
    type: 'text',       
    restricted: false
  },
  { 
    id: 'cat_phrase', 
    name: 'Frase del Año', 
    icon: MessageSquare, 
    desc: 'Lo que no paramos de repetir.',
    type: 'text',       
    restricted: false
  },
  { 
    id: 'cat_event', 
    name: 'Mejor Evento', 
    icon: Mic, 
    desc: 'El stream especial más currado.',
    type: 'text',       
    restricted: true 
  }
];

// --- 3. UTILIDADES ---

const isTwitch = (url: string) => url && url.includes('twitch.tv');
const isKick = (url: string) => url && url.includes('kick.com');

const getDisplayImage = (nomination: any) => {
  if (nomination.customImage) return nomination.customImage;
  if (nomination.url) {
    const ytMatch = nomination.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`;
    }
  }
  return null;
};

const useCountdown = (targetDate: Date) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
};

// --- 4. SISTEMA DE NOTIFICACIONES ---
const ToastContext = React.createContext({
  addToast: (message: string, type: 'success' | 'error' | 'info') => {}
});

const ToastContainer = ({ toasts, removeToast }: any) => (
  <div className="fixed top-24 right-4 z-50 flex flex-col gap-2 pointer-events-none">
    <AnimatePresence>
      {toasts.map((toast: any) => (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.9 }}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md min-w-[300px]
            ${toast.type === 'success' ? 'bg-emerald-900/80 border-emerald-500/50 text-emerald-100' : 
              toast.type === 'error' ? 'bg-red-900/80 border-red-500/50 text-red-100' : 
              'bg-slate-800/80 border-slate-600/50 text-slate-100'}`}
        >
          {toast.type === 'success' && <CheckCircle size={18} className="text-emerald-400" />}
          {toast.type === 'error' && <AlertTriangle size={18} className="text-red-400" />}
          {toast.type === 'info' && <Zap size={18} className="text-blue-400" />}
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="opacity-50 hover:opacity-100">
            <X size={14} />
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

// --- 5. COMPONENTES UI ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, icon: Icon }: any) => {
  const variants: any = {
    // ROSA NEÓN (Pink-600 to Rose-500)
    primary: "bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white shadow-[0_0_20px_rgba(236,72,153,0.5)] border border-pink-400/20",
    secondary: "bg-slate-800 hover:bg-slate-700 text-white border border-slate-600",
    outline: "bg-transparent border border-white/20 text-white hover:bg-white/10",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/30",
    danger: "bg-red-600/20 hover:bg-red-600 hover:text-white text-red-400 border border-red-500/30"
  };

  return (
    <motion.button 
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick} 
      disabled={disabled}
      className={`px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${variants[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </motion.button>
  );
};

// --- GLITCH ANIMADO (FONDO OSCURO) ---
const GlitchTextAnimated = ({ text, size = "text-6xl" }: { text: string, size?: string }) => {
  return (
    <div className={`relative font-black uppercase italic tracking-tighter ${size} text-white group select-none`}>
      <motion.span 
        className="absolute top-0 left-0 -ml-1 opacity-70 text-red-500 mix-blend-screen"
        animate={{ x: [0, -2, 2, -1, 0], y: [0, 1, -1, 0] }}
        transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror", repeatDelay: 3 }}
      >
        {text}
      </motion.span>
      <motion.span 
        className="absolute top-0 left-0 ml-1 opacity-70 text-cyan-500 mix-blend-screen"
        animate={{ x: [0, 2, -2, 1, 0], y: [0, -1, 1, 0] }}
        transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror", repeatDelay: 2 }}
      >
        {text}
      </motion.span>
      <span className="relative z-10">{text}</span>
    </div>
  );
};

const NominationThumbnail = ({ nom, categoryType, size = 'large' }: { nom: any, categoryType?: string, size?: 'small' | 'large' }) => {
  const [error, setError] = useState(false);
  const displayImage = getDisplayImage(nom);
  const isTwitchLink = isTwitch(nom.url);
  const isKickLink = isKick(nom.url);

  useEffect(() => { setError(false); }, [displayImage]);

  if (displayImage && !error) {
    return (
       <div className="w-full h-full bg-slate-900 flex items-center justify-center overflow-hidden">
         <img
           src={displayImage}
           alt={nom.title}
           className={`w-full h-full object-cover transition-transform duration-500 ${size === 'large' ? 'group-hover:scale-110' : ''}`}
           onError={() => setError(true)}
         />
       </div>
    );
  }

  if (categoryType === 'text') {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 transition-transform duration-500 ${size === 'large' ? 'group-hover:scale-110' : ''}`}>
         <div className="relative z-10 text-center p-4">
            {/* Texto Rosa Neón */}
            <div className={`${size === 'large' ? 'text-7xl' : 'text-3xl'} font-black text-pink-500 select-none`}>
              {nom.title.charAt(0).toUpperCase()}
            </div>
         </div>
         {size === 'large' && (
           <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <Sparkles size={80} className="text-pink-500" />
           </div>
         )}
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center gap-2 transition-transform duration-500
      ${size === 'large' ? 'bg-gradient-to-br group-hover:scale-110' : ''}
      ${isTwitchLink ? (size === 'large' ? "from-violet-900/40 to-slate-900" : "bg-slate-800") :
        isKickLink ? (size === 'large' ? "from-[#53FC18]/20 to-slate-900" : "bg-[#53FC18]/10") :
        (size === 'large' ? "from-slate-800 to-slate-950" : "bg-slate-800")}`}
    >
      {isTwitchLink ? (
         <Twitch size={size === 'large' ? 40 : 12} className="text-violet-500" />
      ) : isKickLink ? (
         <div className={`${size === 'large' ? 'text-4xl' : 'text-[10px]'} font-black italic text-[#53FC18] tracking-tighter`}>KICK</div>
      ) : (
         <Play size={size === 'large' ? 40 : 12} className="text-slate-600" />
      )}
      
      {size === 'large' && (
        <span className={`text-xs font-mono tracking-widest uppercase ${isKickLink ? "text-[#53FC18]" : "text-slate-500"}`}>
          {isTwitchLink ? "Twitch Clip" : isKickLink ? "Kick Clip" : "Video Link"}
        </span>
      )}
    </div>
  );
};

const PhaseStepper = ({ currentPhase }: { currentPhase: number }) => {
  const steps = [
    { id: 0, label: "Nominaciones", date: "Activo ahora" },
    { id: 1, label: "Votaciones", date: "Próximamente" },
    { id: 2, label: "Gran Gala", date: "31 Dic" }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mb-20 relative"> {/* mb-20 para dar espacio al texto absoluto */}
      <div className="relative flex justify-between items-start">
        
        {/* --- BARRA DE FONDO (GRIS) --- */}
        {/* Eliminado -z-10 para que se vea. Centrado matemáticamente con top-5 (20px) */}
        <div className="absolute top-5 left-5 right-5 h-1 bg-slate-800 rounded-full -translate-y-1/2"></div>

        {/* --- BARRA DE PROGRESO (ROSA) --- */}
        <div className="absolute top-5 left-5 right-5 h-1 -translate-y-1/2 rounded-full overflow-hidden">
           <motion.div 
             className="h-full bg-gradient-to-r from-pink-600 to-rose-500"
             initial={{ width: "0%" }}
             animate={{ width: `${(currentPhase / (steps.length - 1)) * 100}%` }}
             transition={{ duration: 0.5, delay: 0.2 }}
           />
        </div>

        {/* STEPS (CÍRCULOS) */}
        {steps.map((step, idx) => {
          const isActive = idx === currentPhase;
          const isCompleted = idx < currentPhase;
          
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center w-10"> {/* w-10 fija el ancho al círculo */}
              
              {/* CÍRCULO */}
              <motion.div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors
                  ${isActive ? 'bg-slate-900 border-pink-500 text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.5)]' : 
                    isCompleted ? 'bg-pink-600 border-pink-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-600'}
                `}
                animate={{ scale: isActive ? 1.2 : 1 }}
              >
                {isCompleted ? <Check size={16} /> : <span className="font-bold text-sm">{idx + 1}</span>}
              </motion.div>

              {/* TEXTO (ABSOLUTO PARA NO DESCUADRAR) */}
              <div className="absolute top-12 w-32 text-center">
                <div className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-slate-500'}`}>
                  {step.label}
                </div>
                {isActive && (
                   <div className="text-[10px] text-pink-400 mt-1 font-medium animate-pulse">
                     {step.date}
                   </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

const CountdownDisplay = ({ targetDate, label }: { targetDate: Date, label: string }) => {
  const timeLeft = useCountdown(targetDate);
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between max-w-md mx-auto mb-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
          <Clock size={20} />
        </div>
        <span className="text-sm font-bold text-slate-400 uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex gap-2 font-mono text-white font-bold text-lg">
        <div>{timeLeft.days}d</div>
        <div className="text-slate-600">:</div>
        <div>{timeLeft.hours}h</div>
        <div className="text-slate-600">:</div>
        <div>{timeLeft.minutes}m</div>
        <div className="text-slate-600">:</div>
        <div className="w-6 text-right">{timeLeft.seconds}s</div>
      </div>
    </div>
  );
};

// --- 6. SECCIONES PRINCIPALES ---

const LandingPage = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-pink-950/20 to-slate-950" />
           <div className="w-full h-full opacity-20 bg-[radial-gradient(#831843_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="relative z-10 space-y-4 max-w-4xl"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
             <span className="px-3 py-1 border border-pink-500/50 rounded-full text-pink-300 text-xs font-mono bg-pink-500/10 uppercase tracking-widest">
               Edición 2025
             </span>
          </div>
          
          <GlitchTextAnimated text="HONGO AWARDS" size="text-7xl md:text-9xl" />
          
          <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Celebramos lo mejor, lo peor y lo más cringe del año. 
            <br className="hidden md:block"/> Tu voto decide la historia.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button onClick={onLogin} variant="primary" icon={GoogleIcon} className="text-lg px-8 py-4">
              INGRESAR CON GOOGLE
            </Button>
            <Button 
              variant="outline" 
              icon={Calendar} 
              className="text-lg px-8 py-4 border-pink-500/30 text-pink-400 hover:bg-pink-900/20"
              onClick={() => document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' })}
            >
              VER CALENDARIO
            </Button>
          </div>
          
          <div className="pt-4 flex items-center justify-center gap-2 text-slate-500 text-xs opacity-80">
            <ShieldAlert size={14} className="text-emerald-500" />
            <span>Autenticación segura vía Google. No almacenamos contraseñas.</span>
          </div>

        </motion.div>
      </section>

      <section id="timeline" className="py-20 bg-slate-950 relative z-10 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "1. NOMINACIONES", desc: "Propone tus clips favoritos. Los mods filtrarán los mejores.", icon: Send, color: "text-cyan-400" },
              { title: "2. VOTACIONES", desc: "Vota una vez por categoría. Elige sabiamente.", icon: CheckCircle, color: "text-pink-400" },
              { title: "3. LA GALA", desc: "Resultados en vivo con reveal épico. Nadie sabe quién ganó.", icon: Trophy, color: "text-yellow-400" }
            ].map((item, i) => (
              <div key={i} className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                <item.icon className={`w-12 h-12 ${item.color} mb-4`} />
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const Dashboard = ({ user, phase, categories, nominations, userVotes, onNominate, onVote, onApprove, onDelete, isAdmin, isMod }: any) => {
  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-32 px-4">
      {/* HEADER DASHBOARD */}
      <div className="container mx-auto mb-8 flex justify-between items-center border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
           <Trophy className="text-pink-500" />
           <span className="font-bold text-white tracking-tight">HONGO AWARDS</span>
        </div>
        <div className="flex items-center gap-4">
           {isAdmin && <span className="text-xs bg-red-500 text-white px-2 py-1 rounded font-bold">ADMIN</span>}
           {isMod && !isAdmin && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded font-bold">MOD</span>}
           <div className="hidden md:block text-right">
             <div className="text-xs text-slate-500">Logueado como</div>
             <div className="text-sm font-bold text-white truncate max-w-[150px]">{user.displayName || user.email || user.uid.slice(0,6)}</div>
           </div>
        </div>
      </div>

      <PhaseStepper currentPhase={phase} />

      {phase === 0 && <CountdownDisplay targetDate={PHASE_DATES.votingStart} label="Tiempo restante para nominar" />}
      {phase === 1 && <CountdownDisplay targetDate={PHASE_DATES.galaStart} label="Cierre de votaciones" />}

      <div className="container mx-auto mt-8">
        <AnimatePresence mode="wait">
          {phase === 0 && (
            <motion.div key="p0" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}}>
              <NominationForm 
                categories={categories} 
                onSubmit={onNominate} 
                existing={nominations} 
                isAdmin={isAdmin} 
                isMod={isMod}     
                onApprove={onApprove}
                onDelete={onDelete}
              />
            </motion.div>
          )}
          
          {phase === 1 && (
            <motion.div key="p1" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}}>
              <VotingGrid 
                categories={categories} 
                nominations={nominations} 
                userVotes={userVotes} 
                onVote={onVote} 
              />
            </motion.div>
          )}
          
          {phase === 2 && (
            <motion.div key="p2" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}}>
              <GalaView 
                categories={categories} 
                nominations={nominations} 
                isAdmin={isAdmin} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const NominationForm = ({ categories, onSubmit, existing, isMod, onApprove, onDelete }: any) => {
  const [form, setForm] = useState({ cat: categories[0].id, title: '', url: '', customImage: '' });
  const { addToast } = React.useContext(ToastContext);
  const approvedNoms = existing.filter((n: any) => n.approved);
  const pendingNoms = existing.filter((n: any) => !n.approved);

  const selectedCategory = categories.find((c: any) => c.id === form.cat) || categories[0];
  const isRestricted = selectedCategory.restricted && !isMod; 

  const isDuplicate = useMemo(() => {
    if (!form.title) return false;
    return existing.some((n: any) => 
      n.categoryId === form.cat && 
      n.title.toLowerCase().trim() === form.title.toLowerCase().trim()
    );
  }, [form.title, form.cat, existing]);

  // --- NUEVA FUNCIÓN AÑADIDA ---
  const handleBackToSafe = () => {
    const safeCat = categories.find((c: any) => !c.restricted) || categories[0];
    setForm(prev => ({ ...prev, cat: safeCat.id }));
  };
  // -----------------------------

  return (
    <div className="grid lg:grid-cols-2 gap-12">
      <div className="space-y-6">
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm relative overflow-hidden">
          
          {/* --- BLOQUE DE RESTRICCIÓN MODIFICADO CON BOTÓN --- */}
          {isRestricted && (
            <div className="absolute inset-0 bg-slate-950/90 z-20 flex flex-col items-center justify-center text-center p-6 backdrop-blur-sm">
              <div className="bg-red-500/10 p-4 rounded-full mb-3 border border-red-500/20">
                <ShieldAlert size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Categoría Restringida</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-xs">
                La categoría <span className="text-red-400 font-bold">"{selectedCategory.name}"</span> es exclusiva para nominaciones del staff.
              </p>
              
              {/* BOTÓN NUEVO */}
              <button 
                onClick={handleBackToSafe}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm transition-all border border-slate-600 flex items-center gap-2 group"
              >
                Volver a Categorías Públicas
              </button>
            </div>
          )}

          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            {/* CAMBIO: Icono rosa */}
            <Send className="text-pink-500" /> Nueva Nominación
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-400">Categoría</label>
              <select 
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white mt-1 focus:border-pink-500 outline-none transition-colors"
                value={form.cat}
                onChange={e => setForm({...form, cat: e.target.value, title: '', url: ''})}
              >
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.restricted ? '(Mods Only)' : ''}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 mt-1 ml-1">{selectedCategory.desc}</p>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-400">
                {selectedCategory.type === 'text' ? 'Nombre del Candidato' : 'Título del Clip'}
              </label>
              <input 
                className={`w-full bg-slate-950 border rounded-lg p-3 text-white mt-1 outline-none transition-colors ${isDuplicate ? 'border-red-500' : 'border-slate-700 focus:border-pink-500'}`}
                placeholder={selectedCategory.type === 'text' ? "Ej. Nombre del juego" : "Ej. El grito del susto"}
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
              />
              {isDuplicate && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12}/> ¡Cuidado! Parece que esto ya ha sido nominado.
                </p>
              )}
            </div>

            {selectedCategory.type === 'clip' && (
              <div>
                <label className="text-sm font-bold text-slate-400">Link del Clip (Obligatorio)</label>
                <input 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white mt-1 focus:border-pink-500 outline-none transition-colors"
                  placeholder="https://twitch.tv/..."
                  value={form.url}
                  onChange={e => setForm({...form, url: e.target.value})}
                />
              </div>
            )}

            <div>
              <label className="text-sm font-bold text-slate-400 flex items-center gap-2">
                <ImageIcon size={14} /> Link Imagen (Opcional)
              </label>
              <input 
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white mt-1 focus:border-pink-500 outline-none transition-colors"
                placeholder="https://i.imgur.com/..."
                value={form.customImage}
                onChange={e => setForm({...form, customImage: e.target.value})}
              />
              <p className="text-[10px] text-slate-500 mt-1">
                {selectedCategory.type === 'text' 
                  ? "Recomendado subir portada para que se vea bonito." 
                  : "Usa link directo (.jpg, .png) si quieres personalizar."}
              </p>
            </div>

            <Button 
              className="w-full"
              disabled={isRestricted || (selectedCategory.type === 'clip' && !form.url) || !form.title}
              onClick={async () => {
                if(selectedCategory.type === 'clip' && !form.url) {
                  addToast("El link es obligatorio", "error");
                  return;
                }
                
                // --- CORRECCIÓN AQUÍ ---
                // 1. Guardamos los datos en una variable temporal
                const dataToSubmit = { ...form };

                // 2. Limpiamos el formulario INMEDIATAMENTE (Optimistic UI Update)
                // Esto evita que el detector de duplicados salte cuando llegue la data nueva
                setForm({...form, title: '', url: '', customImage: ''});
                
                // 3. Enviamos la copia a la base de datos
                await onSubmit(dataToSubmit);
                
                if(!isMod) addToast("Sugerencia enviada a revisión", "success");
                else addToast("Nominación creada correctamente", "success");
              }}
            >
              Enviar Sugerencia
            </Button>
          </div>
        </div>

        {isMod && (
          <div className="bg-yellow-900/10 border border-yellow-500/20 p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
              <Settings className="animate-spin-slow" size={20}/> Cola de Moderación ({pendingNoms.length})
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {pendingNoms.length === 0 ? (
                <p className="text-slate-500 italic text-sm">No hay nominaciones pendientes de revisión.</p>
              ) : (
                pendingNoms.map((nom: any) => (
                  <motion.div 
                    initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}}
                    key={nom.id} 
                    className="bg-slate-900 border border-yellow-500/30 p-3 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white">{nom.title}</div>
                      <div className="text-xs text-yellow-500/80">{categories.find((c:any)=>c.id === nom.categoryId)?.name}</div>
                      {nom.url && <a href={nom.url} target="_blank" className="text-xs text-blue-400 hover:underline">Ver Clip</a>}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { onDelete(nom.id); addToast("Nominación eliminada", "info"); }} 
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        onClick={() => { onApprove(nom.id); addToast("Nominación aprobada y publicada", "success"); }} 
                        className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-all"
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-300">Nominaciones Aceptadas</h3>
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
          {approvedNoms.map((nom: any) => {
            const cat = categories.find((c:any) => c.id === nom.categoryId);
            return (
              <div key={nom.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex justify-between items-center group relative">
                 <div className="flex items-center gap-4">
                    <div className="w-16 h-10 bg-black rounded overflow-hidden flex-shrink-0 relative">
                       <NominationThumbnail nom={nom} categoryType={cat?.type} size="small" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-200 group-hover:text-pink-400 transition-colors">{nom.title}</div>
                      <div className="text-xs text-slate-500">{cat?.name}</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                   {nom.url && (
                     <a href={nom.url} target="_blank" className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                       <ArrowRight size={16} className="text-slate-400"/>
                     </a>
                   )}
                   {isMod && (
                     <button onClick={() => { onDelete(nom.id); addToast("Eliminado de la lista pública", "info"); }} className="p-2 bg-red-900/20 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-colors">
                       <Trash2 size={16} />
                     </button>
                   )}
                 </div>
              </div>
            );
          })}
          {approvedNoms.length === 0 && <div className="text-slate-500 italic">No hay nominaciones aprobadas todavía...</div>}
        </div>
      </div>
    </div>
  );
};

const VotingGrid = ({ categories, nominations, userVotes, onVote }: any) => {
  const { addToast } = React.useContext(ToastContext);

  return (
    <div className="space-y-16">
      {categories.map((cat: any) => {
        const hasVoted = userVotes.includes(cat.id);
        const candidates = nominations.filter((n: any) => n.categoryId === cat.id && n.approved);
        
        return (
          <div key={cat.id} className="scroll-mt-24">
            <div className="flex items-center gap-4 mb-6 border-b border-slate-800 pb-4">
              {/* CAMBIO: Icono rosa */}
              <cat.icon className="text-pink-500 w-8 h-8" />
              <div>
                <h3 className="text-2xl font-bold text-white uppercase">{cat.name}</h3>
                <p className="text-slate-400 text-sm">{cat.desc}</p>
              </div>
              {hasVoted && (
                <div className="ml-auto bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                  <CheckCircle size={14} /> VOTADO
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidates.map((nom: any) => {
                return (
                  <motion.div 
                    key={nom.id}
                    whileHover={!hasVoted ? { y: -5 } : {}}
                    className={`relative group rounded-xl overflow-hidden border transition-all ${
                      hasVoted 
                      ? 'opacity-60 grayscale bg-slate-900 border-slate-800' 
                      // CAMBIO: Hover border y shadow rosa
                      : 'bg-slate-800/50 border-slate-700 hover:border-pink-500 hover:shadow-[0_0_30px_rgba(236,72,153,0.2)]'
                    }`}
                  >
                    <div className="aspect-video bg-black flex items-center justify-center relative overflow-hidden">
                      <NominationThumbnail nom={nom} categoryType={cat.type} size="large" />
                      
                      {nom.url && (
                        <a href={nom.url} target="_blank" className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-20" onClick={(e) => e.stopPropagation()}>
                          <ExternalLink size={14} />
                        </a>
                      )}

                      {!hasVoted && (
                        <div 
                          // CAMBIO: Overlay rosa
                          className="absolute inset-0 bg-pink-600/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10" 
                          onClick={() => {
                            onVote(cat.id, nom.id);
                            addToast(`Voto registrado para ${nom.title}`, "success");
                          }}
                        >
                          <span className="font-black text-white text-xl tracking-widest">VOTAR AHORA</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-white truncate text-lg">{nom.title}</h4>
                      {cat.type === 'clip' && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{nom.url}</p>}
                    </div>
                  </motion.div>
                );
              })}
              {candidates.length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-600 border border-dashed border-slate-800 rounded-xl">
                  Esperando candidatos oficiales...
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  );
};

const GalaView = ({ categories, nominations, isAdmin }: any) => {
  const [revealed, setRevealed] = useState<string[]>([]);
  const { addToast } = React.useContext(ToastContext);

  const getWinner = (catId: string) => {
    const cands = nominations.filter((n: any) => n.categoryId === catId && n.approved);
    if(cands.length === 0) return null;
    return cands.reduce((max: any, n: any) => max.votes_count > n.votes_count ? max : n);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-24">
      {categories.map((cat: any) => {
        const isRevealed = revealed.includes(cat.id);
        const winner = getWinner(cat.id);

        return (
          <div key={cat.id} className="text-center relative">
            <div className="mb-8">
               <h3 className="text-4xl font-black text-white uppercase italic mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">{cat.name}</h3>
            </div>
            <div className="relative min-h-[300px]">
              <AnimatePresence mode="wait">
                {!isRevealed ? (
                   <motion.div key="locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 2, filter: "blur(20px)" }} className="bg-slate-900/50 border border-slate-700 rounded-3xl p-12 flex flex-col items-center justify-center gap-6">
                     <Lock className="w-16 h-16 text-slate-600" />
                     {isAdmin ? (
                       <Button 
                         onClick={() => {
                           setRevealed([...revealed, cat.id]);
                           addToast(`Ganador de ${cat.name} revelado`, "info");
                         }} 
                         variant="primary"
                       >
                         REVELAR GANADOR (ADMIN)
                       </Button>
                     ) : (
                       <p className="text-slate-400 font-mono animate-pulse">ESPERANDO SEÑAL...</p>
                     )}
                   </motion.div>
                ) : (
                   <motion.div key="winner" initial={{ opacity: 0, scale: 0.5, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/30 rounded-full blur-[100px]" />
                     <div className="bg-gradient-to-b from-yellow-500/10 to-slate-950 border border-yellow-500/50 p-6 md:p-10 rounded-3xl relative z-10 shadow-[0_0_50px_rgba(234,179,8,0.2)] overflow-hidden">
                       <div className="relative z-10">
                        <Crown className="w-20 h-20 text-yellow-400 mx-auto mb-6 drop-shadow-lg" />
                        <div className="text-yellow-200 uppercase tracking-widest text-sm mb-2 font-bold">Ganador Indiscutible</div>
                        <div className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">{winner?.title || "Nadie"}</div>
                        <div className="w-full max-w-md mx-auto aspect-video rounded-xl overflow-hidden border border-yellow-500/30 shadow-2xl mb-6 bg-slate-900 flex items-center justify-center">
                             <NominationThumbnail nom={winner} categoryType={cat.type} size="large" />
                        </div>
                        {winner && (
                          <div className="inline-block px-4 py-1 bg-black/40 rounded text-slate-400 font-mono text-sm border border-white/10">{winner.votes_count} votos totales</div>
                        )}
                       </div>
                     </div>
                   </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- 6. COMPONENTES GLOBALES Y PRINCIPAL ---

export default function StreamerAwardsApp() {
  const [user, setUser] = useState<any>(null);
  const [phase, setPhase] = useState(0);
  const [serverPhase, setServerPhase] = useState(0);
  // ESTADOS DE ROL
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMod, setIsMod] = useState(false);
  
  const [nominations, setNominations] = useState<any[]>([]);
  const [userVotes, setUserVotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<any[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000); 
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      console.warn("FALTA CONFIGURACIÓN: No se han encontrado las variables de entorno de Firebase.");
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // --- GESTIÓN DE ROLES ---
        const userRef = doc(db, 'artifacts', APP_ID, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        let role = 'user';
        if (userSnap.exists()) {
          role = userSnap.data().role || 'user';
        } else {
          // Si es usuario nuevo, lo creamos como 'user'
          await setDoc(userRef, { 
            email: currentUser.email,
            role: 'user',
            createdAt: serverTimestamp() 
          });
        }

        // Definir permisos según el rol
        setIsAdmin(role === 'admin');
        setIsMod(role === 'admin' || role === 'moderator'); // Admin también es Mod

        // Cargar Votos
        const votesRef = collection(db, 'artifacts', APP_ID, 'users', currentUser.uid, 'votes');
        const snap = await getDocs(votesRef);
        setUserVotes(snap.docs.map(d => d.data().categoryId));
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsMod(false);
        setUserVotes([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Escuchar cambios GLOBALES de fase
    const phaseUnsub = onSnapshot(doc(db, 'artifacts', APP_ID, 'public', 'data', 'config', 'main_settings'), (docSnap) => {
      if(docSnap.exists()) {
        const livePhase = docSnap.data().phase || 0;
        setServerPhase(livePhase);
        
        // IMPORTANTE: Si NO soy admin, mi vista se actualiza automáticamente con el server.
        // Si SOY admin, mantengo mi vista local donde yo la haya dejado.
        if (!isAdmin) {
          setPhase(livePhase);
        }
      }
    });

    const nomsQuery = query(collection(db, 'artifacts', APP_ID, 'public', 'data', 'nominations'), orderBy('createdAt', 'desc'));
    const nomsUnsub = onSnapshot(nomsQuery, (snap) => {
      setNominations(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });

    return () => { phaseUnsub(); nomsUnsub(); };
  }, [isAdmin]);

  // LOGIN CON GOOGLE
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      addToast("¡Bienvenido! Sesión iniciada.", "success");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      addToast("Error al iniciar sesión. Habilita Google Auth en Firebase Console.", "error");
    }
  };

  const handleLogout = () => {
    signOut(auth);
    addToast("Has cerrado sesión.", "info");
  };

  // ACCIONES CRUD
  const handleNominate = async (form: any) => {
    if(!user) return;
    await addDoc(collection(db, 'artifacts', APP_ID, 'public', 'data', 'nominations'), {
      categoryId: form.cat,
      title: form.title,
      url: form.url,
      customImage: form.customImage || null,
      userId: user.uid,
      votes_count: 0,
      approved: false, 
      createdAt: serverTimestamp()
    });
  };

  const handleApproveNomination = async (nomId: string) => {
    if(!isMod) return; // Solo mods
    await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'nominations', nomId), {
      approved: true
    });
  };

  const handleDeleteNomination = async (nomId: string) => {
    if(!isMod) return; // Solo mods
    if(confirm("¿Estás seguro de eliminar esta nominación?")) {
      await deleteDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'nominations', nomId));
    }
  };

  const handleVote = async (catId: string, nomId: string) => {
    if(!user || userVotes.includes(catId)) return;
    
    setUserVotes([...userVotes, catId]);

    try {
      await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'votes', catId), {
        categoryId: catId, nominationId: nomId, timestamp: serverTimestamp()
      });
      await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'nominations', nomId), {
        votes_count: increment(1)
      });
    } catch (e) {
      console.error(e);
      setUserVotes(prev => prev.filter(id => id !== catId));
      addToast("Error al registrar voto", "error");
    }
  };

  // CAMBIO 3: Nueva lógica de cambio de fase LOCAL
  const handleLocalPhaseChange = (newPhase: number) => {
    setPhase(newPhase);
    addToast(`Vista previa: Fase ${newPhase + 1}`, "info");
  };

  // CAMBIO 4: Nueva función para PUBLICAR la fase al mundo
  const handlePublishPhase = async () => {
    await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'config', 'main_settings'), { phase: phase });
    addToast(`🚀 ¡FASE ${phase + 1} EN VIVO PARA TODOS!`, "success");
    setServerPhase(phase); // Actualización optimista
  };

  if (loading) return <div className="h-screen bg-slate-950 flex items-center justify-center text-white font-mono">Cargando Sistema...</div>;

  return (
    <ToastContext.Provider value={{ addToast }}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <nav className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex justify-between items-center bg-gradient-to-b from-slate-950/80 to-transparent backdrop-blur-sm pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-600 to-rose-500 rounded-lg flex items-center justify-center">
            <Trophy size={16} className="text-white" />
          </div>
          <span className="font-bold text-white tracking-tight hidden sm:block">HONGO AWARDS</span>
        </div>
        
        <div className="flex items-center gap-4 pointer-events-auto">
          {user ? (
             <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700 p-1 pl-4 rounded-full">
               <span className="text-xs text-slate-400 hidden sm:inline-block">
                 {user.email ? user.email.split('@')[0] : 'Usuario'}
               </span>
               <button onClick={handleLogout} className="p-2 bg-slate-800 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors">
                 <LogOut size={14} />
               </button>
             </div>
          ) : (
            <button onClick={handleLogin} className="text-sm font-bold text-white bg-gradient-to-r from-pink-600 to-rose-500 px-4 py-2 rounded-full hover:from-pink-500 hover:to-rose-400 transition-colors">
              Iniciar Sesión
            </button>
          )}
        </div>
      </nav>

      {/* CAMBIO 5: BARRA DE ADMIN MEJORADA (CON BOTÓN DE PUBLICAR) */}
      {isAdmin && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900 border border-red-500/50 p-2 pl-3 rounded-2xl shadow-2xl scale-90 hover:scale-100 transition-transform origin-bottom pointer-events-auto">
          
          {/* Indicador de estado */}
          <div className="flex flex-col items-center justify-center mr-2">
             <div className="p-1.5 rounded-lg bg-red-500 text-white mb-1">
               <ShieldAlert size={16} />
             </div>
             <span className="text-[10px] font-bold text-white uppercase">
               {phase === serverPhase ? "Sincronizado" : "Vista Previa"}
             </span>
          </div>

          <div className="h-8 w-px bg-slate-200 mx-1" />

          {/* Botones de Navegación Local */}
          <div className="flex gap-1">
            {[0, 1, 2].map(p => (
              <button 
                key={p} 
                onClick={() => handleLocalPhaseChange(p)}
                className={`relative px-4 py-2 rounded-lg text-xs font-bold transition-all 
                  ${phase === p ? 'bg-white text-rose-500 shadow-md ring-1 ring-rose-100' : 'text-white hover:bg-slate-50 hover:text-slate-600'}`}
              >
                Fase {p + 1}
                {/* Puntito verde si esta es la fase que ven los usuarios */}
                {serverPhase === p && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* BOTÓN DE ACCIÓN: Solo aparece si hay cambios sin publicar */}
          <AnimatePresence>
            {phase !== serverPhase && (
              <motion.button
                initial={{ width: 0, opacity: 0, padding: 0 }}
                animate={{ width: "auto", opacity: 1, padding: "0.5rem 1rem" }}
                exit={{ width: 0, opacity: 0, padding: 0 }}
                onClick={handlePublishPhase}
                className="overflow-hidden whitespace-nowrap bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl text-xs font-bold  shadow-rose-200 flex items-center gap-2"
              >
                <Zap size={14} className="animate-pulse" />
                PUBLICAR
              </motion.button>
            )}
          </AnimatePresence>

        </div>
      )}

      {!user ? (
        <LandingPage onLogin={handleLogin} />
      ) : (
        <Dashboard 
          user={user} 
          phase={phase} 
          categories={CATEGORIES}
          nominations={nominations}
          userVotes={userVotes}
          onNominate={handleNominate}
          onVote={handleVote}
          onApprove={handleApproveNomination}
          onDelete={handleDeleteNomination}
          isAdmin={isAdmin}
          isMod={isMod}
        />
      )}
    </ToastContext.Provider>
  );
}