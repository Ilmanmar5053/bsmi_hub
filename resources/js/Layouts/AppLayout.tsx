import React, { useState, PropsWithChildren } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, Building2, Users, UserCog, Heart, Calendar,
    Package, CreditCard, BarChart3, UserPlus, ChevronLeft,
    Menu, X, Sun, Moon, LogOut, User, Bell, Settings, Stethoscope, UserCheck, GraduationCap, Newspaper, FileText
} from 'lucide-react';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    permission?: string;
}

const navItems: NavItem[] = [
    { label: 'Dashboard',         href: '/dashboard',           icon: <LayoutDashboard size={18} />, permission: 'view-dashboard' },
    { label: 'Profil Organisasi', href: '/profil-organisasi',   icon: <Building2 size={18} />,       permission: 'view-organization' },
    { label: 'Data Anggota',      href: '/members',             icon: <Users size={18} />,           permission: 'manage-members' },
    { label: 'Data Pengurus',     href: '/executives',          icon: <UserCog size={18} />,         permission: 'manage-executives' },
    { label: 'Penerima Manfaat',  href: '/beneficiaries',       icon: <Heart size={18} />,           permission: 'manage-beneficiaries' },
    { label: 'Program & Kegiatan',href: '/programs',            icon: <Calendar size={18} />,        permission: 'manage-programs' },
    { label: 'Logistik',          href: '/logistics',           icon: <Package size={18} />,         permission: 'manage-logistics' },
    { label: 'Berita & Informasi',href: '/news',                icon: <Newspaper size={18} />,       permission: 'manage-news' },
    { label: 'Iuran',             href: '/dues',                icon: <CreditCard size={18} />,      permission: 'manage-dues' },
    { label: 'Keuangan',          href: '/finance',             icon: <BarChart3 size={18} />,       permission: 'manage-finance' },
    { label: 'Relawan',           href: '/volunteers',          icon: <UserPlus size={18} />,        permission: 'manage-volunteers' },
    { label: 'Diklatsar',         href: '/diklatsar',           icon: <GraduationCap size={18} />,   permission: 'manage-volunteers' },
    { label: 'Pelaporan',         href: '/reports',             icon: <FileText size={18} />,        permission: 'view-reports' },
    { label: 'Manajemen Pengguna',href: '/users',               icon: <UserCheck size={18} />,       permission: 'manage-users' },
];

export default function AppLayout({ children }: PropsWithChildren) {
    const { url, props } = usePage<any>();
    const organization = props.organization;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    const toggleDark = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('dark');
    };

    const isActive = (href: string) => {
        if (href === '/dashboard') return url === '/dashboard';
        return url.startsWith(href);
    };

    React.useEffect(() => {
        const roles = (props as any).auth?.roles || [];
        let roleTheme = 'admin';
        if (roles.includes('anggota')) roleTheme = 'anggota';
        else if (roles.includes('relawan')) roleTheme = 'relawan';
        
        document.documentElement.setAttribute('data-theme', roleTheme);
    }, [(props as any).auth?.roles]);

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">

                {/* Sidebar */}
                <aside
                    className={`fixed top-0 left-0 h-full bg-gradient-to-b from-theme-700 via-theme-800 to-theme-900 border-r border-theme-800 z-40 transition-all duration-300 flex flex-col shadow-xl ${
                        sidebarOpen ? 'w-[260px]' : 'w-[70px]'
                    }`}
                >
                    {/* Logo */}
                    <div className="flex items-center gap-3 px-4 py-5 border-b border-theme-600/30">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/10 backdrop-blur-sm overflow-hidden p-1.5 border border-white/20">
                            {organization?.logo_url ? (
                                <img src={organization.logo_url} alt="Logo" className="w-full h-full object-contain drop-shadow-md" />
                            ) : (
                                <Stethoscope size={20} className="text-white drop-shadow-md" />
                            )}
                        </div>
                        {sidebarOpen && (
                            <div className="overflow-hidden">
                                <p className="font-bold text-sm text-white leading-tight">BSMI</p>
                                <p className="text-[10px] text-white/60 leading-tight">Bulan Sabit Merah Indonesia</p>
                            </div>
                        )}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="ml-auto p-1 rounded-lg hover:bg-white/10 text-white/70 transition-colors"
                        >
                            {sidebarOpen ? <ChevronLeft size={16} /> : <Menu size={16} />}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
                        {sidebarOpen && (
                            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider px-3 pb-2">Menu Utama</p>
                        )}
                        {navItems.filter(item => {
                            const userPermissions = (props as any).auth?.permissions || [];
                            if (item.permission) {
                                return userPermissions.includes(item.permission);
                            }
                            return true;
                        }).map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                                    isActive(item.href)
                                        ? 'bg-white/15 text-white shadow-sm'
                                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }`}
                                title={!sidebarOpen ? item.label : undefined}
                            >
                                <span className="flex-shrink-0">{item.icon}</span>
                                {sidebarOpen && <span className="truncate">{item.label}</span>}
                                {isActive(item.href) && sidebarOpen && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Bottom user section */}
                    <div className="px-3 py-3 border-t border-theme-600/30">
                        {sidebarOpen ? (
                            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {(props as any).auth?.user?.name?.charAt(0) ?? 'A'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                        {(props as any).auth?.user?.name ?? 'Admin'}
                                    </p>
                                    <p className="text-xs text-white/60 truncate">
                                        {(props as any).auth?.user?.email ?? ''}
                                    </p>
                                </div>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                                    title="Logout"
                                >
                                    <LogOut size={15} />
                                </Link>
                            </div>
                        ) : (
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="flex items-center justify-center w-full p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </Link>
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-[260px]' : 'ml-[70px]'}`}>
                    {/* Top Header */}
                    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                {/* Breadcrumb placeholder */}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={toggleDark}
                                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                                    title="Toggle Dark Mode"
                                >
                                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                                </button>
                                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                                <div className="flex items-center gap-2 pl-1">
                                    <div className="w-7 h-7 rounded-full bg-theme-600 flex items-center justify-center text-white text-xs font-bold">
                                        {(props as any).auth?.user?.name?.charAt(0) ?? 'A'}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                                        {(props as any).auth?.user?.name ?? 'Admin'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <div className="flex-1 p-6 animate-fade-in relative">
                        {((props as any).flash?.success || (props as any).flash?.error) && (
                            <div className={`mb-6 p-4 rounded-xl shadow-sm border flex items-start gap-3 ${
                                (props as any).flash?.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                            }`}>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{(props as any).flash?.success || (props as any).flash?.error}</p>
                                </div>
                            </div>
                        )}
                        {children}
                    </div>

                    {/* Footer */}
                    <footer className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400">
                        © {new Date().getFullYear()} BSMI — Bulan Sabit Merah Indonesia. Sistem Manajemen Organisasi.
                    </footer>
                </main>
            </div>
        </div>
    );
}
