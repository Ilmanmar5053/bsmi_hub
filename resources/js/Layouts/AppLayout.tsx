import React, { useState, PropsWithChildren, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard, Building2, Users, UserCog, Heart, Calendar,
    Package, CreditCard, BarChart3, UserPlus, ChevronLeft,
    Menu, Sun, Moon, LogOut, Settings, Stethoscope, UserCheck, GraduationCap, Newspaper, FileText, ShieldAlert,
    ChevronDown, ChevronRight, LifeBuoy, X, Bell, Clock
} from 'lucide-react';
import { FlashMessage, SensitiveDataField } from '@/Components/Shared';

interface NavItem {
    label: string;
    href?: string;
    icon?: React.ReactNode;
    permission?: string | string[];
    children?: NavItem[];
}

const navItems: NavItem[] = [
    { label: 'Dashboard',         href: '/dashboard',           icon: <LayoutDashboard size={18} />, permission: 'menu-dashboard' },
    { label: 'Profil Organisasi', href: '/profil-organisasi',   icon: <Building2 size={18} />,       permission: 'menu-organization' },
    {
        label: 'Data Master',
        icon: <Users size={18} />,
        children: [
            { label: 'Data Anggota',      href: '/members',             permission: 'menu-members' },
            { 
                label: 'Data Pengurus',     
                icon: <UserCog size={18} />,
                permission: 'menu-executives',
                children: [
                    { label: 'Semua Pengurus', href: '/executives', permission: 'menu-executives' },
                    { label: 'Provinsi Banten', href: '/executives?regional_cabang=BSMI Provinsi Banten', permission: 'menu-executives' },
                    { label: 'Kabupaten Serang', href: '/executives?regional_cabang=BSMI Kabupaten Serang', permission: 'menu-executives' },
                    { label: 'Kota Serang', href: '/executives?regional_cabang=BSMI Kota Serang', permission: 'menu-executives' },
                    { label: 'Kabupaten Tangerang', href: '/executives?regional_cabang=BSMI Kabupaten Tangerang', permission: 'menu-executives' },
                    { label: 'Kota Tangerang', href: '/executives?regional_cabang=BSMI Kota Tangerang', permission: 'menu-executives' },
                    { label: 'Kota Tangerang Selatan', href: '/executives?regional_cabang=BSMI Kota Tangerang Selatan', permission: 'menu-executives' },
                    { label: 'Kabupaten Pandeglang', href: '/executives?regional_cabang=BSMI Kabupaten Pandeglang', permission: 'menu-executives' },
                    { label: 'Kota Cilegon', href: '/executives?regional_cabang=BSMI Kota Cilegon', permission: 'menu-executives' },
                    { label: 'Lebak', href: '/executives?regional_cabang=BSMI Lebak', permission: 'menu-executives' },
                ]
            },
        ]
    },
    {
        label: 'Relawan & Diklat',
        icon: <UserPlus size={18} />,
        children: [
            { label: 'Data Relawan',      href: '/volunteers',          permission: 'menu-volunteers' },
            { label: 'Modul Diklatsar',   href: '/diklatsar',           permission: 'menu-diklatsar' },
        ]
    },
    {
        label: 'Program & Publikasi',
        icon: <Calendar size={18} />,
        children: [
            { label: 'Program Kerja',     href: '/programs',            permission: 'menu-programs' },
            { label: 'Penerima Manfaat',  href: '/beneficiaries',       permission: 'menu-beneficiaries' },
            { label: 'Berita & Informasi',href: '/news',                permission: 'menu-news' },
        ]
    },
    {
        label: 'Keuangan & Logistik',
        icon: <BarChart3 size={18} />,
        children: [
            { label: 'Arus Kas',          href: '/finance',             permission: 'menu-finance' },
            { label: 'Transaksi Keuangan',href: '/financial-receipts',  permission: 'menu-finance' },
            { label: 'Manajemen Donasi',  href: '/donations',           permission: 'menu-donations' },
            { label: 'Manajemen Iuran',   href: '/dues',                permission: 'menu-dues' },
            { label: 'Logistik',          href: '/logistics',           permission: 'menu-logistics' },
            { label: 'Manajemen Aset',    href: '/assets',              permission: 'menu-assets' },
            { label: 'Layanan Mobil Operasional', href: '/vehicle-usages', permission: 'menu-vehicle-usages' },
        ]
    },
    {
        label: 'Sistem & Laporan',
        icon: <Settings size={18} />,
        children: [
            { label: 'Pelaporan',         href: '/reports',             permission: 'menu-reports' },
            { label: 'Manajemen Pengguna',href: '/users',               permission: 'menu-users' },
            { label: 'Log Aktivitas',     href: '/activity-logs',       permission: 'menu-activity-logs' },
        ]
    },
    {
        label: 'Pengaduan & Helpdesk',
        icon: <LifeBuoy size={18} />,
        children: [
            { label: 'Pusat Bantuan', href: '/helpdesk' },
            { label: 'Manajemen Pengaduan', href: '/helpdesk/manage', permission: 'menu-helpdesk-manage' },
        ]
    }
];

export default function AppLayout({ children }: PropsWithChildren) {
    const { url, props } = usePage<any>();
    const organization = props.organization;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    const isSidebarExpanded = sidebarOpen || isHovered;

    const isActive = (href: string) => {
        if (href === '/dashboard') return url === '/dashboard';
        
        // Handle exact matching with query params for nested menus
        if (href.includes('?')) {
            return decodeURI(url) === decodeURI(href);
        }

        // Default path prefix matching
        return url.startsWith(href);
    };

    const isGroupActive = (item: NavItem): boolean => {
        if (item.href && isActive(item.href)) return true;
        if (item.children) {
            return item.children.some(child => isGroupActive(child));
        }
        return false;
    };

    const [expandedGroups, setExpandedGroups] = useState<string[]>(() => {
        const initialGroups: string[] = [];
        if (typeof window !== 'undefined') {
            navItems.forEach(item => {
                if (item.children) {
                    if (isGroupActive(item)) {
                        initialGroups.push(item.label);
                        item.children.forEach(child => {
                            if (child.children && isGroupActive(child)) {
                                initialGroups.push(child.label);
                            }
                        });
                    }
                }
            });
        }
        return initialGroups;
    });

    const toggleGroup = (label: string) => {
        setExpandedGroups(prev => 
            prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
        );
    };

    const markNotificationAsRead = (id: string, url: string) => {
        router.post(`/notifications/${id}/mark-read`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setNotificationOpen(false);
                if (url) router.visit(url);
            }
        });
    };

    const toggleDark = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('dark');
    };

    const hasPermission = (permission?: string | string[]) => {
        if (!permission) return true;
        const userRoles = (props as any).auth?.roles || [];
        if (userRoles.includes('super_admin')) return true;

        const userPermissions = (props as any).auth?.permissions || [];
        if (Array.isArray(permission)) {
            return permission.some(p => userPermissions.includes(p));
        }
        return userPermissions.includes(permission);
    };

    const renderNavItem = (item: NavItem, depth = 0) => {
        if (!hasPermission(item.permission)) return null;

        if (item.children) {
            const hasVisibleChildren = item.children.some(child => hasPermission(child.permission));
            if (!hasVisibleChildren) return null;

            const isExpanded = expandedGroups.includes(item.label);
            const hasActiveChild = isGroupActive(item);

            return (
                <div key={item.label} className="mb-1">
                    <button
                        onClick={() => toggleGroup(item.label)}
                        className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] group ${
                            isExpanded ? 'bg-white/10 text-white shadow-sm' : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                        title={!isSidebarExpanded ? item.label : undefined}
                    >
                        <span className="flex-shrink-0">{item.icon}</span>
                        {isSidebarExpanded && <span className="flex-1 text-left truncate">{item.label}</span>}
                        {isSidebarExpanded && (
                            <span className="ml-auto">
                                <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                            </span>
                        )}
                    </button>
                    
                    {isSidebarExpanded && (
                        <div className={`mt-1 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="pl-4 space-y-1">
                                {item.children.map(child => renderNavItem(child, depth + 1))}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <Link
                key={item.href}
                href={item.href!}
                onClick={() => {
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] group ${
                    depth === 0 ? 'px-3 mb-1' : 'pl-10 pr-3 relative'
                } ${
                    isActive(item.href!)
                        ? (depth === 0 ? 'bg-white/15 text-white shadow-sm' : 'text-white bg-white/5 font-semibold')
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
                title={!isSidebarExpanded ? item.label : undefined}
            >
                {depth > 0 && <span className="absolute left-[20px] top-1/2 -translate-y-1/2 w-3 h-px bg-white/20" />}
                
                {depth === 0 && <span className="flex-shrink-0">{item.icon}</span>}
                {isSidebarExpanded && <span className="truncate">{item.label}</span>}
                {isActive(item.href!) && isSidebarExpanded && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                )}
            </Link>
        );
    };

    React.useEffect(() => {
        const roles = (props as any).auth?.roles || [];
        let roleTheme = 'admin';
        if (roles.includes('anggota')) roleTheme = 'anggota';
        else if (roles.includes('relawan')) roleTheme = 'relawan';
        
        document.documentElement.setAttribute('data-theme', roleTheme);
        
    }, [(props as any).auth?.roles]);

    // Idle Auto-Logout Timer (15 minutes)
    React.useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                // Perform logout and redirect to main page on inactivity
                router.post('/logout');
            }, 15 * 60 * 1000); // 15 minutes
        };

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        
        // Start timer
        resetTimer();

        // Attach listeners
        events.forEach(event => document.addEventListener(event, resetTimer, true));

        return () => {
            clearTimeout(timeoutId);
            events.forEach(event => document.removeEventListener(event, resetTimer, true));
        };
    }, []);

    // Notification Polling (Every 15 seconds)
    React.useEffect(() => {
        const intervalId = setInterval(() => {
            router.reload({ only: ['auth'] });
        }, 15000); // 15 seconds

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-gray-900/50 z-30 lg:hidden backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className={`fixed top-0 left-0 h-full bg-gradient-to-b from-theme-700 via-theme-800 to-theme-900 border-r border-theme-800 z-40 transition-all duration-300 ease-in-out flex flex-col shadow-xl ${
                        isSidebarExpanded ? 'w-[280px]' : 'w-[70px]'
                    }`}
                >
                    {/* Logo */}
                    <div className="flex items-center gap-3 px-4 py-5 border-b border-theme-600/30">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-white shadow-md overflow-hidden ring-1 ring-black/5">
                            {organization?.logo_url ? (
                                <img src={organization.logo_url} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                                <Stethoscope size={24} className="text-theme-600" />
                            )}
                        </div>
                        {isSidebarExpanded && (
                            <div className="overflow-hidden">
                                <p className="font-bold text-sm text-white leading-tight">BSMI</p>
                                <p className="text-[15px] text-white/90 leading-tight tracking-wide mt-0.5" style={{ fontFamily: '"Dancing Script", cursive' }}>Care For Life</p>
                            </div>
                        )}
                        <button
                            onClick={() => { setSidebarOpen(!sidebarOpen); setIsHovered(false); }}
                            className={`p-1.5 rounded-lg hover:bg-white/10 text-white/70 transition-colors z-50 ${
                                isSidebarExpanded 
                                ? 'ml-auto' 
                                : 'absolute -right-4 top-8 bg-theme-700 border border-theme-600 shadow-md text-white rounded-full'
                            }`}
                        >
                            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-4 overflow-y-auto">
                        {isSidebarExpanded && (
                            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider px-3 pb-2 mb-1">Menu Utama</p>
                        )}
                        {navItems.map(item => renderNavItem(item))}
                    </nav>

                    {/* Bottom user section */}
                    <div className="px-3 py-3 border-t border-theme-600/30">
                        {isSidebarExpanded ? (
                            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {(props as any).auth?.user?.name?.charAt(0) ?? 'A'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                        {(props as any).auth?.user?.name ?? 'Admin'}
                                    </p>
                                    <button onClick={toggleDark} className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 transition-colors" title="Toggle Theme">
                                        {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                                    </button>
                                </div>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                                    title="Logout"
                                >
                                    <LogOut size={15} />
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 py-2">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                                    {(props as any).auth?.user?.name?.charAt(0) ?? 'A'}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:pl-[280px]' : 'lg:pl-[70px]'}`}>
                    {/* Top Header */}
                    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 lg:hidden">
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                                >
                                    <Menu size={20} />
                                </button>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hidden lg:flex">
                                {/* Breadcrumb placeholder */}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 mr-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm">
                                    <Clock size={16} className="text-gray-400" />
                                    <span>
                                        {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(currentTime)} | {new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(currentTime).replace(/\./g, ':')}
                                    </span>
                                </div>
                                <button
                                    onClick={toggleDark}
                                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                                    title="Toggle Dark Mode"
                                >
                                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                                </button>

                                {/* Notification Bell */}
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setNotificationOpen(!notificationOpen);
                                            setUserDropdownOpen(false);
                                        }}
                                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors relative"
                                    >
                                        <Bell size={18} />
                                        {(props as any).auth?.notifications?.length > 0 && (
                                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-900 animate-pulse"></span>
                                        )}
                                    </button>

                                    {notificationOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setNotificationOpen(false)}></div>
                                            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-50 animate-fade-in max-h-[400px] overflow-y-auto">
                                                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifikasi</h3>
                                                </div>
                                                <div className="py-1">
                                                    {((props as any).auth?.notifications || []).length === 0 ? (
                                                        <div className="px-4 py-6 text-center text-gray-500 text-sm">
                                                            Belum ada notifikasi baru.
                                                        </div>
                                                    ) : (
                                                        ((props as any).auth?.notifications || []).map((notif: any) => (
                                                            <div 
                                                                key={notif.id}
                                                                onClick={() => markNotificationAsRead(notif.id, notif.data.url)}
                                                                className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                                                            >
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">{notif.data.title}</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{notif.data.message}</p>
                                                                <p className="text-[10px] text-gray-400 mt-1">{new Date(notif.created_at).toLocaleDateString('id-ID', {hour: '2-digit', minute:'2-digit'})}</p>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                                <div className="relative">
                                    <div 
                                        className="flex items-center gap-2 pl-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 pr-2 rounded-xl transition-colors"
                                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    >
                                        <div className="w-7 h-7 rounded-full bg-theme-600 flex items-center justify-center text-white text-xs font-bold">
                                            {(props as any).auth?.user?.name?.charAt(0) ?? 'A'}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block select-none">
                                            {(props as any).auth?.user?.name ?? 'Admin'}
                                        </span>
                                        <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
                                    </div>

                                    {userDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)}></div>
                                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50 animate-fade-in">
                                                <button 
                                                    onClick={() => { setIsProfileModalOpen(true); setUserDropdownOpen(false); }}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                                                >
                                                    <UserCog size={16} className="text-gray-400" />
                                                    View Profile
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <div className="flex-1 p-6 animate-fade-in relative">
                        {/* Global Flash Message */}
                        {((props as any).flash?.success || (props as any).flash?.error) && (
                            <FlashMessage flash={(props as any).flash} />
                        )}
                        {children}
                    </div>

                    {/* Footer */}
                    <footer className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400">
                        © {new Date().getFullYear()} BSMI — Bulan Sabit Merah Indonesia. Sistem Manajemen Organisasi.
                    </footer>
                </main>
            </div>

            {/* Profile Modal */}
            {isProfileModalOpen && (
                <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-lg">
                                <UserCheck size={18} className="text-theme-600 dark:text-theme-500" />
                                Overview Profile
                            </h3>
                            <button 
                                onClick={() => setIsProfileModalOpen(false)} 
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-5 mb-6">
                                <div className="w-20 h-20 rounded-full bg-theme-100 dark:bg-theme-900/40 flex items-center justify-center text-theme-600 dark:text-theme-400 text-3xl font-bold shadow-sm ring-4 ring-white dark:ring-gray-800">
                                    {(props as any).auth?.user?.name?.charAt(0) ?? 'A'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white truncate">{(props as any).auth?.user?.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">{(props as any).auth?.user?.email}</p>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {(props as any).auth?.roles?.map((r: string) => (
                                            <span key={r} className="px-2.5 py-0.5 bg-theme-50 dark:bg-theme-900/30 text-theme-600 dark:text-theme-400 border border-theme-100 dark:border-theme-800/50 text-[10px] rounded-full font-medium uppercase tracking-wider">
                                                {r}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {(props as any).auth?.member ? (
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/40 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <div className="col-span-2 sm:col-span-1">
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">No. Induk Anggota</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{(props as any).auth?.member?.no_induk_anggota || '-'}</p>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Regional Cabang</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{(props as any).auth?.member?.regional_cabang || '-'}</p>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Bagian Divisi</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{(props as any).auth?.member?.bagian_divisi || '-'}</p>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">No. WhatsApp</p>
                                        <SensitiveDataField value={(props as any).auth?.member?.no_whatsapp} />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Email</p>
                                        <SensitiveDataField value={(props as any).auth?.member?.email} />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Pendidikan Terakhir</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{(props as any).auth?.member?.pendidikan_terakhir || '-'}</p>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Jurusan</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{(props as any).auth?.member?.jurusan || '-'}</p>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Status Keluarga</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{(props as any).auth?.member?.status_keluarga || '-'}</p>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Golongan Darah</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{(props as any).auth?.member?.golongan_darah || '-'}</p>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Profesi Utama</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{(props as any).auth?.member?.profesi_utama || '-'}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 text-sm text-center">
                                    Akun ini merupakan akun pengurus/administrator dan tidak terhubung dengan data keanggotaan spesifik.
                                </div>
                            )}

                            <div className="mt-6 p-3.5 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-xl text-[13px] text-orange-700 dark:text-orange-400 flex gap-3 items-start shadow-sm">
                                <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                                <p className="leading-relaxed">Sesuai kebijakan organisasi, pembaruan data profil hanya dapat dilakukan secara terpusat oleh <strong>Administrator Pusat</strong> untuk menjaga validitas data keanggotaan.</p>
                            </div>
                            
                            <div className="mt-6 flex justify-end">
                                <button 
                                    onClick={() => setIsProfileModalOpen(false)}
                                    className="px-5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
