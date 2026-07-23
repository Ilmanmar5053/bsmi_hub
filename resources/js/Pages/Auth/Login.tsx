import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Stethoscope, Lock, Mail, Eye, EyeOff, Shield } from 'lucide-react';
import { Modal } from '@/Components/Shared';
import { X } from 'lucide-react';

interface Props {
    canResetPassword: boolean;
    status?: string;
    announcement?: any;
}

export default function Login({ canResetPassword, status, announcement }: Props) {
    const { props } = usePage<any>();
    const organization = props.organization;
    const [showPassword, setShowPassword] = React.useState(false);
    const [isForgotModalOpen, setIsForgotModalOpen] = React.useState(false);
    const [showAnnouncement, setShowAnnouncement] = React.useState(
        !!announcement && !!announcement.images && announcement.images.length > 0
    );
    const [loginRole, setLoginRole] = React.useState<'administrator' | 'anggota' | 'relawan'>('administrator');
    const [currentSlide, setCurrentSlide] = React.useState(1);
    const totalSlides = 5;

    React.useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev % totalSlides) + 1);
        }, 5000); // 5 detik
        return () => clearInterval(interval);
    }, []);

    const themes = {
        administrator: {
            bg: 'from-red-700 via-red-600 to-red-800',
            bgSoft: 'from-red-50/80 via-white to-red-100/50',
            patternColor: '#ef4444', // red-500
            textLight: 'text-red-100',
            btn: 'bg-red-600 hover:bg-red-700 shadow-red-200',
            textActive: 'text-red-600',
            ring: 'focus:ring-red-500',
            badge: 'bg-red-50 text-red-600',
        },
        anggota: {
            bg: 'from-blue-700 via-blue-600 to-blue-800',
            bgSoft: 'from-blue-50/80 via-white to-blue-100/50',
            patternColor: '#3b82f6', // blue-500
            textLight: 'text-blue-100',
            btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
            textActive: 'text-blue-600',
            ring: 'focus:ring-blue-500',
            badge: 'bg-blue-50 text-blue-600',
        },
        relawan: {
            bg: 'from-emerald-700 via-emerald-600 to-emerald-800',
            bgSoft: 'from-emerald-50/80 via-white to-emerald-100/50',
            patternColor: '#10b981', // emerald-500
            textLight: 'text-emerald-100',
            btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200',
            textActive: 'text-emerald-600',
            ring: 'focus:ring-emerald-500',
            badge: 'bg-emerald-50 text-emerald-600',
        }
    };
    const activeTheme = themes[loginRole];

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login', { onFinish: () => reset('password') });
    };

    return (
        <div className="h-[100dvh] w-full flex overflow-hidden">
            <Head title="BSMI | Care For Life" />

            {/* Left: Decorative Panel with Gallery Slideshow */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12">
                {/* Gallery Slideshow Backgrounds */}
                {Array.from({ length: totalSlides }).map((_, idx) => (
                    <div
                        key={idx}
                        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${currentSlide === idx + 1 ? 'opacity-100' : 'opacity-0'
                            }`}
                        style={{
                            backgroundImage: `url('/images/gallery/slide-${idx + 1}.png')`,
                        }}
                    />
                ))}

                {/* Theme Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${activeTheme.bg} opacity-85 transition-all duration-700`} />

                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10 mix-blend-overlay">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full border border-white"
                            style={{
                                width: `${80 + i * 40}px`,
                                height: `${80 + i * 40}px`,
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                            }}
                        />
                    ))}
                </div>

                <div className="relative z-10 text-center text-white">
                    {/* Logo */}
                    <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center mx-auto mb-8 shadow-xl overflow-hidden ring-1 ring-black/5">
                        {organization?.logo_url ? (
                            <img src={organization.logo_url} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                            <Stethoscope size={48} className="text-white" />
                        )}
                    </div>

                    <h1 className="text-4xl font-bold mb-3 transition-colors">{organization?.name ? organization.name.split(' – ')[0] : 'BSMI'}</h1>
                    <p className={`text-xl font-medium ${activeTheme.textLight} mb-2 transition-colors`}>{organization?.name ? organization.name.split(' – ')[1] || organization.name : 'Indonesian Red Crescent'}</p>
                    <div className="w-16 h-1 bg-white/40 rounded-full mx-auto mb-8" />
                    <p className={`${activeTheme.textLight} text-base max-w-xs leading-relaxed transition-colors`}>
                        Sistem Manajemen Organisasi Kemanusiaan yang terpadu untuk mendukung operasional dan pelayanan BSMI.
                    </p>

                    <div className="mt-12 grid grid-cols-3 gap-4 text-center">
                        {[
                            { label: 'Anggota', icon: '👥' },
                            { label: 'Program', icon: '📅' },
                            { label: 'Relawan', icon: '🤝' },
                        ].map((item) => (
                            <div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 transition-colors">
                                <div className="text-2xl mb-1">{item.icon}</div>
                                <div className={`text-xs ${activeTheme.textLight}`}>{item.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Social Media Links */}
                    <div className="mt-10">
                        <p className={`text-xs ${activeTheme.textLight} mb-3 opacity-70`}>Ikuti kami di media sosial</p>
                        <div className="flex items-center justify-center gap-3">
                            {/* Instagram */}
                            <a
                                href="https://www.instagram.com/bsmi.banten"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Instagram: @bsmi.banten"
                                className="w-9 h-9 bg-white/15 hover:bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                            >
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                                </svg>
                            </a>
                            {/* Facebook */}
                            <a
                                href="https://www.facebook.com/BSMIProvBanten"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Facebook: BSMI Prov Banten II"
                                className="w-9 h-9 bg-white/15 hover:bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                            >
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </a>
                            {/* TikTok */}
                            <a
                                href="https://www.tiktok.com/@bsmi.banten"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="TikTok: @bsmi.banten"
                                className="w-9 h-9 bg-white/15 hover:bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                            >
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                                </svg>
                            </a>
                            {/* YouTube */}
                            <a
                                href="https://www.youtube.com/@bsmi.banten"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="YouTube: bsmi.banten"
                                className="w-9 h-9 bg-white/15 hover:bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                            >
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                            </a>
                            {/* Website */}
                            <a
                                href="https://bsmi.or.id"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Website Nasional: bsmi.or.id"
                                className="w-9 h-9 bg-white/15 hover:bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                            >
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="2" y1="12" x2="22" y2="12" />
                                    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                                </svg>
                            </a>
                        </div>
                        <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1">
                            <span className={`text-[10px] ${activeTheme.textLight} opacity-60`}>@bsmi.banten</span>
                            <span className={`text-[10px] ${activeTheme.textLight} opacity-40`}>•</span>
                            <span className={`text-[10px] ${activeTheme.textLight} opacity-60`}>bsmi.or.id</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Login Form */}
            <div className={`flex-1 flex flex-col items-center justify-center p-6 sm:p-8 relative overflow-y-auto bg-gradient-to-br ${activeTheme.bgSoft} transition-colors duration-700`}>
                
                {/* Palestine Map Background (Emerald Green Gradient) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none transition-opacity duration-700 p-8">
                    <svg viewBox="0 0 350 850" className="w-full h-full object-contain drop-shadow-xl">
                        <defs>
                            <linearGradient id="palestine-map-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#34d399" />
                                <stop offset="50%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#059669" />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>
                        {/* Stylized Silhouette of Palestine */}
                        <path 
                            d="M174.6,33.5 L211.2,12.1 C211.2,12.1 234.5,49.2 248.3,77.5 C262.1,105.8 288.6,183.1 288.6,183.1 L298.1,232.7 C298.1,232.7 284.4,265.5 284.4,265.5 L263.3,371.6 C263.3,371.6 242.2,423.8 242.2,423.8 L257,440.6 L265.5,537.4 L251.7,532.7 C251.7,532.7 220,629.5 210.5,651.8 L204.2,746.5 L190.4,736 L154.5,827 L114.3,835 L116.5,798 L85.8,771 C85.8,771 161.9,644 196.8,574 C231.7,504 290.7,314.1 290.7,314.1 L257.5,257.5 C257.5,257.5 220.3,165 197.1,114.4 C173.9,63.8 174.6,33.5 174.6,33.5 Z" 
                            fill="url(#palestine-map-gradient)"
                            filter="url(#glow)"
                            transform="translate(-40, 0) scale(1.05)"
                        />
                    </svg>
                </div>

                <div className="relative z-10 w-full max-w-md">
                    {/* Free Palestine Badge */}
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white/40 shadow-sm px-4 py-2 rounded-full text-sm font-bold text-gray-800">
                            <div className="w-6 h-4 rounded-sm overflow-hidden flex flex-col relative shadow-sm shrink-0">
                                <div className="h-1/3 bg-black"></div>
                                <div className="h-1/3 bg-white"></div>
                                <div className="h-1/3 bg-[#009736]"></div>
                                <div className="absolute left-0 top-0 bottom-0 w-0 h-0 border-y-[8px] border-y-transparent border-l-[10px] border-l-[#EE2A35]"></div>
                            </div>
                            <span>Free Palestine, From</span>
                            <div className="w-6 h-4 rounded-sm overflow-hidden flex flex-col shadow-sm shrink-0">
                                <div className="h-1/2 bg-[#ff0000]"></div>
                                <div className="h-1/2 bg-white"></div>
                            </div>
                            <span>Indonesia</span>
                        </div>
                    </div>
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-md overflow-hidden ring-1 ring-black/5">
                            {organization?.logo_url ? (
                                <img src={organization.logo_url} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                                <div className={`w-full h-full ${activeTheme.bg} rounded flex items-center justify-center transition-colors`}>
                                    <Stethoscope size={20} className="text-white" />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">{organization?.name ? organization.name.split(' – ')[0] : 'BSMI'}</p>
                            <p className="text-xs text-gray-400">{organization?.name ? organization.name.split(' – ')[1] || organization.name : 'Bulan Sabit Merah Indonesia'}</p>
                        </div>
                    </div>

                    <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/60">
                        <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
                            <button type="button" onClick={() => setLoginRole('administrator')} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${loginRole === 'administrator' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'}`}>Admin</button>
                            <button type="button" onClick={() => setLoginRole('anggota')} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${loginRole === 'anggota' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Anggota</button>
                            <button type="button" onClick={() => setLoginRole('relawan')} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${loginRole === 'relawan' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>Relawan</button>
                        </div>

                        <div className="mb-8">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4 transition-colors ${activeTheme.badge}`}>
                                <Shield size={12} />
                                Akses Terbatas
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Masuk ke Sistem</h2>
                            <p className="text-gray-500 text-sm mt-1">Masukkan kredensial akun Anda untuk melanjutkan.</p>
                        </div>

                        {status && (
                            <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all ${activeTheme.ring}`}
                                        placeholder="nama@bsmi.org"
                                        required
                                        autoFocus
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all ${activeTheme.ring}`}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                            </div>

                            {/* Remember + Forgot */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className={`w-4 h-4 rounded border-gray-300 transition-colors ${activeTheme.textActive} ${activeTheme.ring}`}
                                    />
                                    <span className="text-sm text-gray-600">Ingat saya</span>
                                </label>
                                {canResetPassword && (
                                    <button type="button" onClick={() => setIsForgotModalOpen(true)} className={`text-sm font-medium transition-colors hover:opacity-80 ${activeTheme.textActive}`}>
                                        Lupa password?
                                    </button>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className={`w-full flex items-center justify-center gap-2 py-3 px-4 text-white rounded-xl font-semibold text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg ${activeTheme.btn}`}
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Memproses...
                                    </>
                                ) : (
                                    'Masuk'
                                )}
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                            <p className="text-xs text-gray-400">
                                Ingin mendaftar sebagai relawan?{' '}
                                <Link href="/daftar-relawan" className={`font-medium hover:underline transition-colors ${activeTheme.textActive}`}>
                                    Daftar di sini
                                </Link>
                            </p>
                        </div>
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-6">
                        © {new Date().getFullYear()} BSMI — Bulan Sabit Merah Indonesia
                    </p>

                    {/* Social Media Links - Right Panel */}
                    <div className="mt-4 flex items-center justify-center gap-2">
                        {/* Instagram */}
                        <a href="https://www.instagram.com/bsmi.banten" target="_blank" rel="noopener noreferrer" title="Instagram: @bsmi.banten"
                            className="w-7 h-7 bg-gray-100 hover:bg-pink-100 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 group">
                            <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-pink-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                            </svg>
                        </a>
                        {/* Facebook */}
                        <a href="https://www.facebook.com/BSMIProvBanten" target="_blank" rel="noopener noreferrer" title="Facebook: BSMI Prov Banten II"
                            className="w-7 h-7 bg-gray-100 hover:bg-blue-100 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 group">
                            <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                        </a>
                        {/* TikTok */}
                        <a href="https://www.tiktok.com/@bsmi.banten" target="_blank" rel="noopener noreferrer" title="TikTok: @bsmi.banten"
                            className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 group">
                            <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-800 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                            </svg>
                        </a>
                        {/* YouTube */}
                        <a href="https://www.youtube.com/@bsmi.banten" target="_blank" rel="noopener noreferrer" title="YouTube: bsmi.banten"
                            className="w-7 h-7 bg-gray-100 hover:bg-red-100 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 group">
                            <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-600 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                        </a>
                        {/* Website */}
                        <a href="https://bsmi.or.id" target="_blank" rel="noopener noreferrer" title="Website Nasional: bsmi.or.id"
                            className="w-7 h-7 bg-gray-100 hover:bg-emerald-100 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 group">
                            <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="2" y1="12" x2="22" y2="12" />
                                <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            <Modal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} title="Lupa Password">
                <div className="text-center py-6 px-4">
                    <div className="w-16 h-16 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center mx-auto mb-5">
                        <Lock size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Reset Password</h3>
                    <p className="text-gray-600 text-sm mb-8 leading-relaxed">
                        Untuk keamanan akun dan integrasi data, fitur reset password mandiri saat ini dinonaktifkan. <br /><br />
                        <strong>Untuk Reset Password mohon hubungi administrator atau Tim IT Organisasi.</strong>
                    </p>
                    <button type="button" onClick={() => setIsForgotModalOpen(false)} className={`w-full py-3 px-4 rounded-xl text-white font-semibold transition-colors shadow-lg ${activeTheme.btn}`}>
                        Kembali ke Halaman Login
                    </button>
                </div>
            </Modal>

            {/* Announcement Popup */}
            {showAnnouncement && (
                <>
                <style>
                    {`
                    @keyframes smoothFloat {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-15px); }
                    }
                    .animate-smooth-float {
                        animation: smoothFloat 4s ease-in-out infinite;
                    }
                    `}
                </style>
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAnnouncement(false)}>
                    <div className="w-full max-w-md animate-smooth-float">
                        <div 
                            className="relative w-full bg-transparent rounded-2xl overflow-hidden shadow-2xl animate-scale-up"
                            style={{ aspectRatio: '4/5' }}
                            onClick={(e) => e.stopPropagation()} // prevent closing when clicking the image
                        >
                        <button 
                            onClick={() => setShowAnnouncement(false)}
                            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-colors backdrop-blur-md"
                        >
                            <X size={20} />
                        </button>
                        <img 
                            src={announcement.images[0]} 
                            alt={announcement.title || 'Pengumuman'}
                            className="w-full h-full object-cover"
                        />
                        </div>
                    </div>
                </div>
                </>
            )}
        </div>
    );
}
