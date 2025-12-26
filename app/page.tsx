"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Gamepad2, Users, AlertCircle, Ghost, Heart, MessageSquare, Mic, Skull, Gem, Sparkles, Paintbrush, Share2, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';

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
  <div className="fixed top-24 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
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

// --- GLITCH ANIMADO ---
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

// --- COMPONENTE THUMBNAIL (Reutilizable) ---
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
           crossOrigin="anonymous" // Importante para html2canvas
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
    </div>
  );
};

// --- NUEVO COMPONENTE: MODAL PARA COMPARTIR ---
// --- COMPONENTE MODAL PARA COMPARTIR (FIX RESPONSIVE + ALINEACIÓN) ---
const ShareModal = ({ isOpen, onClose, categories, nominations, myChoices }: any) => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  const votedCategories = categories.filter((c: any) => myChoices[c.id]);

  // --- SUB-COMPONENTE SEGURO ---
  const SafeExportThumbnail = ({ nom, catType }: any) => {
    const displayImage = getDisplayImage(nom);
    
    if (displayImage) {
      return (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <img
            src={displayImage}
            alt="tmb"
            crossOrigin="anonymous"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      );
    }

    if (catType === 'text') {
      return (
        <div style={{ 
          width: '100%', height: '100%', 
          background: 'linear-gradient(135deg, #1e293b, #0f172a)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
           <span style={{ fontSize: '24px', fontWeight: '900', color: '#ec4899', fontFamily: 'Arial, sans-serif', lineHeight: '1.2' }}>
             {nom.title.charAt(0).toUpperCase()}
           </span>
        </div>
      );
    }

    return (
      <div style={{ 
        width: '100%', height: '100%', 
        backgroundColor: '#1e293b', 
        display: 'flex', alignItems: 'center', justifyContent: 'center' 
      }}>
         <Play size={20} color="#cbd5e1" />
      </div>
    );
  };

  const generateImage = async () => {
    if (!ticketRef.current) return;
    setGenerating(true);
    
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const canvas = await html2canvas(ticketRef.current, {
        useCORS: true, 
        backgroundColor: '#020617',
        scale: 2,
        logging: false,
        onclone: (clonedDoc) => {
           const element = clonedDoc.getElementById('ticket-node');
           if(element) {
             element.style.transform = 'translateZ(0)';
             element.style.fontFeatureSettings = '"liga" 0';
           }
        }
      });
      setImgUrl(canvas.toDataURL('image/png'));
    } catch (err) {
      console.error("Error generando imagen:", err);
    }
    setGenerating(false);
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (!imgUrl) generateImage();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleShareTwitter = () => {
    const text = "¡Estas son mis predicciones para los Hongo Awards 2025! 🍄🏆\n\n¿Quiénes son tus favoritos? Vota aquí:";
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-hidden">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full max-h-[95vh] flex flex-col md:flex-row shadow-2xl overflow-hidden"
      >
        {/* COLUMNA 1: VISTA PREVIA (CON SCROLL EN MÓVIL) */}
        <div className="flex-1 bg-slate-950 p-6 md:p-10 overflow-y-auto overflow-x-auto flex items-start justify-center relative">
          
          {/* --- AREA DE CAPTURA --- */}
          {/* Añadido min-w-fit para asegurar que el contenedor no se aplaste */}
          <div className={`${imgUrl ? 'absolute opacity-0 pointer-events-none' : 'relative'} min-w-fit origin-top transform md:scale-100 scale-[0.65]`}>
             <div 
               ref={ticketRef} 
               id="ticket-node"
               // CAMBIO CLAVE: minWidth: '600px' y width: '600px' fuerzan el tamaño real
               className="relative overflow-hidden shadow-2xl"
               style={{ 
                 width: '600px', 
                 minWidth: '600px', 
                 flexShrink: 0,
                 backgroundColor: '#0f172a', 
                 fontFamily: 'Arial, sans-serif', 
                 padding: '40px' 
               }} 
             >
                {/* Fondo Decorativo */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(#ec4899 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '12px', background: 'linear-gradient(90deg, #ec4899, #a855f7, #f43f5e)' }} />
                
                {/* Header */}
                <div style={{ 
                  marginBottom: '40px', 
                  position: 'relative', 
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                   <h2 style={{ fontSize: '48px', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', marginBottom: '24px', color: '#ffffff', letterSpacing: '-1px', lineHeight: 1, textAlign: 'center', padding: '10px 0' }}>
                     MIS PREDICCIONES
                   </h2>
                   
                   {/* BADGE (NUBE ROSA) */}
                   <div style={{ 
                     display: 'inline-flex', 
                     alignItems: 'center', 
                     justifyContent: 'center',
                     padding: '6px 20px', 
                     borderRadius: '999px', 
                     backgroundColor: '#380e22', 
                     border: '1px solid #831843', 
                     color: '#f472b6', 
                     fontSize: '14px', 
                     fontWeight: 'bold',
                     lineHeight: '1'
                   }}>
                      <div style={{ display: 'flex', marginRight: '8px' }}>
                         <Trophy size={16} color="#f472b6" />
                      </div>
                      <span style={{ position: 'relative', top: '-2px', fontFamily: 'Arial, sans-serif' }}>
                        HONGO AWARDS 2025
                      </span>
                   </div>
                </div>

                {/* Grid de Votos */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', position: 'relative', zIndex: 10 }}>
                  {votedCategories.map((cat: any) => {
                    const nomId = myChoices[cat.id];
                    const candidate = nominations.find((n: any) => n.id === nomId);
                    if (!candidate) return null;
                    return (
                      <div 
                        key={cat.id} 
                        style={{ 
                          padding: '16px 12px', 
                          borderRadius: '8px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px',
                          backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                          border: '1px solid #334155',
                          minHeight: '80px'
                        }}
                      >
                         {/* THUMBNAIL */}
                         <div style={{ width: '52px', height: '52px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, border: '1px solid #334155' }}>
                           <SafeExportThumbnail nom={candidate} catType={cat.type} />
                         </div>
                         
                         {/* TEXTO */}
                         <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                            <div style={{ 
                              fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#f472b6', 
                              marginBottom: '2px', fontFamily: 'Arial, sans-serif', letterSpacing: '0.5px',
                              lineHeight: '1.2'
                            }}>
                              {cat.name}
                            </div>
                            <div style={{ 
                              fontWeight: 'bold', fontSize: '15px', color: '#ffffff', 
                              lineHeight: '1.3', 
                              fontFamily: 'Arial, sans-serif',
                              wordWrap: 'break-word'
                            }}>
                              {candidate.title}
                            </div>
                         </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div style={{ marginTop: '40px', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10, borderTop: '1px solid #1e293b' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 'bold', backgroundColor: '#db2777' }}>HA</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.3' }}>Generado por<br/> <span style={{ color: '#ffffff', fontWeight: 'bold' }}>hongoawards.app</span></div>
                   </div>
                   <div style={{ textAlign: 'right', fontSize: '11px', fontFamily: 'monospace', color: '#64748b' }}>{new Date().toLocaleDateString()}</div>
                </div>
             </div>
          </div>

          {/* IMAGEN GENERADA (Resultado) */}
          {imgUrl && (
             <div className="w-full flex justify-center">
                <motion.img initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={imgUrl} alt="Mis Votos" className="max-w-full h-auto rounded-lg shadow-2xl border border-slate-700" />
             </div>
          )}
        </div>

        {/* CONTROLES */}
        <div className="w-full md:w-80 bg-slate-900 border-l border-slate-800 p-8 flex flex-col gap-6 relative z-20 shadow-[-20px_0_30px_rgba(0,0,0,0.5)]">
          <div>
             <h3 className="text-2xl font-bold text-white mb-2">¡Difunde la palabra!</h3>
             <p className="text-slate-400 text-sm">Comparte tus elegidos y reta a tus amigos.</p>
          </div>

          <div className="space-y-3">
             {generating && (
               <div className="flex items-center justify-center gap-2 text-pink-400 text-sm font-bold animate-pulse py-4">
                 <Settings className="animate-spin" size={16} /> Generando tarjeta...
               </div>
             )}

             {imgUrl && (
                <a 
                  href={imgUrl} 
                  download={`HongoAwards_Votos_${Date.now()}.png`}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-pink-500/25"
                >
                  <Download size={18} /> Descargar Imagen
                </a>
             )}

             <button 
               onClick={handleShareTwitter}
               className="flex items-center justify-center gap-2 w-full py-4 bg-black hover:bg-slate-800 text-white border border-slate-700 rounded-xl font-bold transition-all"
             >
               <Share2 size={18} /> Postear en X
             </button>
             
             <p className="text-[10px] text-center text-slate-500 mt-2">
                *Debes adjuntar la imagen descargada manualmente en X/Twitter.
             </p>
          </div>

          <div className="mt-auto">
             <button onClick={onClose} className="w-full py-3 text-slate-400 hover:text-white font-bold text-sm">
               Cerrar
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};


// --- RESTO DE COMPONENTES ---

const PhaseStepper = ({ currentPhase }: { currentPhase: number }) => {
  const steps = [
    { id: 0, label: "Nominaciones", date: "Activo ahora" },
    { id: 1, label: "Votaciones", date: "Próximamente" },
    { id: 2, label: "Gran Gala", date: "31 Dic" }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mb-24 relative px-4"> 
      <div className="relative flex justify-between items-start">
        <div className="absolute top-5 left-9 right-9 h-1 bg-slate-800 rounded-full -translate-y-1/2"></div>
        <div className="absolute top-5 left-9 right-9 h-1 -translate-y-1/2 rounded-full overflow-hidden">
           <motion.div 
             className="h-full bg-gradient-to-r from-pink-600 to-rose-500"
             initial={{ width: "0%" }}
             animate={{ width: `${(currentPhase / (steps.length - 1)) * 100}%` }}
             transition={{ duration: 0.5, delay: 0.2 }}
           />
        </div>

        {steps.map((step, idx) => {
          const isActive = idx === currentPhase;
          const isCompleted = idx < currentPhase;
          
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center w-10">
              <motion.div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors
                  ${isActive ? 'bg-slate-900 border-pink-500 text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.5)]' : 
                    isCompleted ? 'bg-pink-600 border-pink-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-600'}
                `}
                animate={{ scale: isActive ? 1.2 : 1 }}
              >
                {isCompleted ? <Check size={16} /> : <span className="font-bold text-sm">{idx + 1}</span>}
              </motion.div>
              <div className="absolute top-14 w-24 md:w-40 text-center -left-7 md:-left-14">
                <div className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-slate-500'}`}>
                  {step.label}
                </div>
                {isActive && (
                    <div className="text-[9px] md:text-[10px] text-pink-400 mt-1 font-medium animate-pulse">
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
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between w-full max-w-2xl mx-auto mb-8 gap-4 md:gap-0">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
          <Clock size={20} />
        </div>
        <span className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wide text-center md:text-left">
          {label}
        </span>
      </div>
      <div className="flex gap-2 font-mono text-white font-bold text-lg md:text-xl bg-slate-950/50 px-4 py-2 rounded-lg border border-slate-800/50">
        <div className="flex flex-col items-center">
          <span>{timeLeft.days}</span>
          <span className="text-[9px] text-slate-600 uppercase font-sans">días</span>
        </div>
        <div className="text-slate-600 py-1">:</div>
        <div className="flex flex-col items-center">
          <span>{timeLeft.hours.toString().padStart(2, '0')}</span>
          <span className="text-[9px] text-slate-600 uppercase font-sans">hrs</span>
        </div>
        <div className="text-slate-600 py-1">:</div>
        <div className="flex flex-col items-center">
          <span>{timeLeft.minutes.toString().padStart(2, '0')}</span>
          <span className="text-[9px] text-slate-600 uppercase font-sans">min</span>
        </div>
        <div className="text-slate-600 py-1">:</div>
        <div className="flex flex-col items-center w-8">
          <span>{timeLeft.seconds.toString().padStart(2, '0')}</span>
          <span className="text-[9px] text-slate-600 uppercase font-sans">seg</span>
        </div>
      </div>
    </div>
  );
};

const LandingPage = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden py-20">
        <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-pink-950/20 to-slate-950" />
           <div className="w-full h-full opacity-20 bg-[radial-gradient(#831843_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="relative z-10 space-y-6 max-w-4xl"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
             <span className="px-3 py-1 border border-pink-500/50 rounded-full text-pink-300 text-xs font-mono bg-pink-500/10 uppercase tracking-widest">
               Edición 2025
             </span>
          </div>
          
          <GlitchTextAnimated text="HONGO AWARDS" size="text-7xl sm:text-7xl md:text-9xl" />
          
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

const Dashboard = ({ user, phase, categories, nominations, userVotes, myChoices, onNominate, onVote, onApprove, onDelete, isAdmin, isMod }: any) => {
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-32 px-4">
      
      {/* MODAL COMPARTIR */}
      <ShareModal 
        isOpen={isShareOpen} 
        onClose={() => setIsShareOpen(false)} 
        categories={categories}
        nominations={nominations}
        myChoices={myChoices}
      />

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
                myChoices={myChoices} // NUEVO
                onVote={onVote} 
                onOpenShare={() => setIsShareOpen(true)} // NUEVO
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

  const handleBackToSafe = () => {
    const safeCat = categories.find((c: any) => !c.restricted) || categories[0];
    setForm(prev => ({ ...prev, cat: safeCat.id }));
  };

  return (
    <div className="grid lg:grid-cols-2 gap-12">
      <div className="space-y-6">
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm relative overflow-hidden">
          
          {isRestricted && (
            <div className="absolute inset-0 bg-slate-950/90 z-20 flex flex-col items-center justify-center text-center p-6 backdrop-blur-sm">
              <div className="bg-red-500/10 p-4 rounded-full mb-3 border border-red-500/20">
                <ShieldAlert size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Categoría Restringida</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-xs">
                La categoría <span className="text-red-400 font-bold">"{selectedCategory.name}"</span> es exclusiva para nominaciones del staff.
              </p>
              <button 
                onClick={handleBackToSafe}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm transition-all border border-slate-600 flex items-center gap-2 group"
              >
                Volver a Categorías Públicas
              </button>
            </div>
          )}

          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
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
                const dataToSubmit = { ...form };
                setForm({...form, title: '', url: '', customImage: ''});
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

const VotingGrid = ({ categories, nominations, userVotes, onVote, myChoices, onOpenShare }: any) => {
  const { addToast } = React.useContext(ToastContext);

  // Calcular si ya votó en todas las categorías NO restringidas
  const publicCategories = categories.filter((c: any) => !c.restricted);
  const completedVotes = publicCategories.every((c: any) => userVotes.includes(c.id));

  return (
    <div className="space-y-16 relative">
      
      {/* BANNER FLOTANTE DE COMPLETADO */}
      <AnimatePresence>
        {completedVotes && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none"
          >
            <div className="bg-slate-900/90 backdrop-blur-md border border-pink-500 p-4 rounded-2xl shadow-[0_0_50px_rgba(236,72,153,0.3)] flex items-center gap-6 pointer-events-auto max-w-xl w-full">
              <div className="hidden sm:flex h-12 w-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full items-center justify-center shrink-0">
                <CheckCircle size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-bold text-lg leading-none">¡Votación Completa!</h4>
                <p className="text-pink-200/70 text-sm mt-1">Has votado en todas las categorías públicas.</p>
              </div>
              <Button onClick={onOpenShare} variant="primary" className="whitespace-nowrap shadow-none">
                 Compartir Votos
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {categories.map((cat: any) => {
        const hasVoted = userVotes.includes(cat.id);
        const candidates = nominations.filter((n: any) => n.categoryId === cat.id && n.approved);
        
        return (
          <div key={cat.id} className="scroll-mt-24">
            <div className="flex items-center gap-4 mb-6 border-b border-slate-800 pb-4">
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
                const isSelected = myChoices[cat.id] === nom.id;
                return (
                  <motion.div 
                    key={nom.id}
                    whileHover={!hasVoted ? { y: -5 } : {}}
                    className={`relative group rounded-xl overflow-hidden border transition-all ${
                      hasVoted 
                      ? (isSelected ? 'bg-pink-900/20 border-pink-500 opacity-100' : 'opacity-40 grayscale bg-slate-900 border-slate-800')
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
  // NUEVO: Guardar las elecciones del usuario (ID de nominación por categoría)
  const [myChoices, setMyChoices] = useState<Record<string, string>>({});

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
          await setDoc(userRef, { 
            email: currentUser.email,
            role: 'user',
            createdAt: serverTimestamp() 
          });
        }

        setIsAdmin(role === 'admin');
        setIsMod(role === 'admin' || role === 'moderator');

        // Cargar Votos
        const votesRef = collection(db, 'artifacts', APP_ID, 'users', currentUser.uid, 'votes');
        const snap = await getDocs(votesRef);
        setUserVotes(snap.docs.map(d => d.data().categoryId));
        
        // NUEVO: Cargar elecciones exactas
        const choices: Record<string, string> = {};
        snap.docs.forEach(d => {
           const data = d.data();
           choices[data.categoryId] = data.nominationId;
        });
        setMyChoices(choices);

      } else {
        setUser(null);
        setIsAdmin(false);
        setIsMod(false);
        setUserVotes([]);
        setMyChoices({});
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const phaseUnsub = onSnapshot(doc(db, 'artifacts', APP_ID, 'public', 'data', 'config', 'main_settings'), (docSnap) => {
      if(docSnap.exists()) {
        const livePhase = docSnap.data().phase || 0;
        setServerPhase(livePhase);
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

  useEffect(() => {
    if (!user) return; 

    const TIMEOUT_DURATION = 15 * 60 * 1000; 
    const STORAGE_KEY = 'hongo_last_active'; 
    let timeoutId: NodeJS.Timeout;

    const checkPersistedInactivity = () => {
      const lastActive = localStorage.getItem(STORAGE_KEY);
      if (lastActive) {
        const diff = Date.now() - parseInt(lastActive);
        if (diff > TIMEOUT_DURATION) {
          signOut(auth);
          addToast("Tu sesión ha expirado por seguridad", "info");
          localStorage.removeItem(STORAGE_KEY); 
          return false; 
        }
      }
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
      return true;
    };

    if (!checkPersistedInactivity()) return;

    const handleInactivity = () => {
      signOut(auth);
      addToast("Sesión cerrada por inactividad", "info");
      localStorage.removeItem(STORAGE_KEY);
    };

    let isThrottled = false;
    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(handleInactivity, TIMEOUT_DURATION);

      if (!isThrottled) {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
        isThrottled = true;
        setTimeout(() => { isThrottled = false; }, 5000); 
      }
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);
    window.addEventListener('touchstart', resetTimer);

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [user]);

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
    if(!isMod) return; 
    await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'nominations', nomId), {
      approved: true
    });
  };

  const handleDeleteNomination = async (nomId: string) => {
    if(!isMod) return; 
    if(confirm("¿Estás seguro de eliminar esta nominación?")) {
      await deleteDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'nominations', nomId));
    }
  };

  const handleVote = async (catId: string, nomId: string) => {
    if(!user || userVotes.includes(catId)) return;
    
    setUserVotes([...userVotes, catId]);
    // NUEVO: Actualizar elección local
    setMyChoices(prev => ({...prev, [catId]: nomId}));

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
      setMyChoices(prev => {
         const copy = {...prev};
         delete copy[catId];
         return copy;
      });
      addToast("Error al registrar voto", "error");
    }
  };

  const handleLocalPhaseChange = (newPhase: number) => {
    setPhase(newPhase);
    addToast(`Vista previa: Fase ${newPhase + 1}`, "info");
  };

  const handlePublishPhase = async () => {
    await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'config', 'main_settings'), { phase: phase });
    addToast(`🚀 ¡FASE ${phase + 1} EN VIVO PARA TODOS!`, "success");
    setServerPhase(phase); 
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

      {isAdmin && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900 border border-red-500/50 p-2 pl-3 rounded-2xl shadow-2xl scale-90 hover:scale-100 transition-transform origin-bottom pointer-events-auto">
          <div className="flex flex-col items-center justify-center mr-2">
             <div className="p-1.5 rounded-lg bg-red-500 text-white mb-1">
               <ShieldAlert size={16} />
             </div>
             <span className="text-[10px] font-bold text-white uppercase">
               {phase === serverPhase ? "Sincronizado" : "Vista Previa"}
             </span>
          </div>

          <div className="h-8 w-px bg-slate-200 mx-1" />

          <div className="flex gap-1">
            {[0, 1, 2].map(p => (
              <button 
                key={p} 
                onClick={() => handleLocalPhaseChange(p)}
                className={`relative px-4 py-2 rounded-lg text-xs font-bold transition-all 
                  ${phase === p ? 'bg-white text-rose-500 shadow-md ring-1 ring-rose-100' : 'text-white hover:bg-slate-50 hover:text-slate-600'}`}
              >
                Fase {p + 1}
                {serverPhase === p && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
                  </span>
                )}
              </button>
            ))}
          </div>

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
          myChoices={myChoices} // NUEVO
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