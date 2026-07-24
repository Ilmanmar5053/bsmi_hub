import React, { useState } from 'react';
import { CheckCircle, XCircle, X, Eye, EyeOff } from 'lucide-react';
import { Link } from '@inertiajs/react';

export function SensitiveDataField({ value, label }: { value: string | null | undefined, label?: string }) {
    const [isVisible, setIsVisible] = useState(false);
    
    if (!value) return <span className="font-medium text-gray-900 dark:text-white">-</span>;

    // Mask logic: mask all characters except maybe keep length same but just use asterisks
    const maskedValue = value.replace(/./g, '•');

    return (
        <div className="flex items-center gap-2">
            <span className={`font-medium text-gray-900 dark:text-white break-all ${!isVisible ? 'font-mono tracking-wider' : ''}`}>
                {isVisible ? value : maskedValue}
            </span>
            <button 
                type="button" 
                onClick={() => setIsVisible(!isVisible)} 
                className="text-gray-400 hover:text-theme-600 dark:hover:text-theme-400 focus:outline-none transition-colors"
                title={isVisible ? "Sembunyikan" : "Tampilkan"}
            >
                {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
        </div>
    );
}

interface FlashProps {
    success?: string;
    error?: string;
}

interface Props {
    flash: FlashProps;
    onClose?: () => void;
}

export function FlashMessage({ flash, onClose }: Props) {
    const [visible, setVisible] = React.useState(true);
    const [isFadingOut, setIsFadingOut] = React.useState(false);

    React.useEffect(() => {
        if (flash.success || flash.error) {
            setVisible(true);
            setIsFadingOut(false);
            
            // Auto hide after 20 seconds
            const timer = setTimeout(() => {
                setIsFadingOut(true);
                setTimeout(() => {
                    setVisible(false);
                    onClose?.();
                }, 500); // Wait for fade-out animation to finish
            }, 20000);
            
            return () => clearTimeout(timer);
        }
    }, [flash]);

    if (!visible || (!flash.success && !flash.error)) return null;

    const isSuccess = !!flash.success;
    return (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg border text-sm max-w-sm w-full ${
            isFadingOut ? 'animate-fade-out' : 'animate-bounce-in-right'
        } ${
            isSuccess
                ? 'bg-white dark:bg-gray-800 border-green-200 dark:border-green-800 text-green-800 dark:text-green-400'
                : 'bg-white dark:bg-gray-800 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400'
        }`}>
            {isSuccess ? <CheckCircle size={20} className="flex-shrink-0 text-green-500" /> : <XCircle size={20} className="flex-shrink-0 text-red-500" />}
            <span className="flex-1 font-medium">{flash.success || flash.error}</span>
            <button
                onClick={() => { 
                    setIsFadingOut(true); 
                    setTimeout(() => { setVisible(false); onClose?.(); }, 500); 
                }}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
                <X size={16} />
            </button>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: React.ReactNode;
    icon: React.ReactNode;
    iconBg: string;
    subtitle?: string;
    trend?: { value: string; positive: boolean };
    compact?: boolean;
}

export function StatCard({ title, value, icon, iconBg, subtitle, trend, compact = false }: StatCardProps) {
    // Extract color from iconBg (e.g. 'bg-blue-100' -> 'blue')
    const colorMatch = iconBg.match(/bg-(\w+)-/);
    const color = colorMatch ? colorMatch[1] : 'gray';

    const gradientMap: Record<string, string> = {
        blue:   'from-blue-50 to-blue-100/60 dark:from-blue-950/40 dark:to-blue-900/20',
        green:  'from-emerald-50 to-emerald-100/60 dark:from-emerald-950/40 dark:to-emerald-900/20',
        purple: 'from-purple-50 to-purple-100/60 dark:from-purple-950/40 dark:to-purple-900/20',
        orange: 'from-orange-50 to-orange-100/60 dark:from-orange-950/40 dark:to-orange-900/20',
        red:    'from-red-50 to-red-100/60 dark:from-red-950/40 dark:to-red-900/20',
        yellow: 'from-amber-50 to-amber-100/60 dark:from-amber-950/40 dark:to-amber-900/20',
        teal:   'from-teal-50 to-teal-100/60 dark:from-teal-950/40 dark:to-teal-900/20',
        indigo: 'from-indigo-50 to-indigo-100/60 dark:from-indigo-950/40 dark:to-indigo-900/20',
    };

    const borderMap: Record<string, string> = {
        blue:   'border-blue-200/60 dark:border-blue-800/30',
        green:  'border-emerald-200/60 dark:border-emerald-800/30',
        purple: 'border-purple-200/60 dark:border-purple-800/30',
        orange: 'border-orange-200/60 dark:border-orange-800/30',
        red:    'border-red-200/60 dark:border-red-800/30',
        yellow: 'border-amber-200/60 dark:border-amber-800/30',
        teal:   'border-teal-200/60 dark:border-teal-800/30',
        indigo: 'border-indigo-200/60 dark:border-indigo-800/30',
    };

    const gradient = gradientMap[color] || gradientMap.blue;
    const border = borderMap[color] || borderMap.blue;

    return (
        <div className={`relative overflow-hidden rounded-xl ${compact ? 'p-3' : 'p-4'} bg-gradient-to-br ${gradient} border ${border} hover:shadow-md transition-all duration-300 group`}>
            {/* Large transparent background icon */}
            <div className={`absolute ${compact ? '-right-2 -bottom-2' : '-right-3 -bottom-3'} opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-300 transform group-hover:scale-110`}>
                {React.cloneElement(icon as React.ReactElement, { size: compact ? 60 : 80, strokeWidth: 1.5 })}
            </div>

            <div className="relative z-10 flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <p className={`text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1`}>{title}</p>
                    <p className={`${compact ? 'text-lg sm:text-xl' : 'text-2xl'} font-extrabold text-gray-800 dark:text-white leading-tight`}>{value}</p>
                    {subtitle && <p className="text-[10px] sm:text-xs text-gray-400 mt-1">{subtitle}</p>}
                    {trend && (
                        <p className={`text-xs font-semibold mt-1 ${trend.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                            {trend.positive ? '↑' : '↓'} {trend.value}
                        </p>
                    )}
                </div>
                <div className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg ${iconBg} dark:bg-opacity-20 flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    {React.cloneElement(icon as React.ReactElement, { size: compact ? 16 : 20 })}
                </div>
            </div>
        </div>
    );
}

interface BadgeProps {
    status: string;
    map?: Record<string, string>;
}

export function StatusBadge({ status, map }: BadgeProps) {
    const defaultMap: Record<string, string> = {
        active: 'badge-green',
        inactive: 'badge-gray',
        paid: 'badge-green',
        unpaid: 'badge-red',
        late: 'badge-yellow',
        approved: 'badge-green',
        rejected: 'badge-red',
        pending: 'badge-yellow',
        ongoing: 'badge-blue',
        planned: 'badge-yellow',
        completed: 'badge-green',
        cancelled: 'badge-gray',
        masuk: 'badge-green',
        keluar: 'badge-orange',
        pemasukan: 'badge-green',
        pengeluaran: 'badge-red',
    };

    const labelMap: Record<string, string> = {
        active: 'Aktif', inactive: 'Tidak Aktif',
        paid: 'Lunas', unpaid: 'Belum Lunas', late: 'Terlambat',
        approved: 'Disetujui', rejected: 'Ditolak', pending: 'Menunggu',
        ongoing: 'Berlangsung', planned: 'Direncanakan', completed: 'Selesai', cancelled: 'Dibatalkan',
        masuk: 'Masuk', keluar: 'Keluar',
        pemasukan: 'Pemasukan', pengeluaran: 'Pengeluaran',
    };

    const appliedMap = map ?? defaultMap;
    const cls = appliedMap[status] ?? 'badge-gray';
    const label = labelMap[status] ?? status;

    return <span className={cls}>{label}</span>;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto animate-fade-in`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

export function formatRupiah(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
}

export function formatDate(value: string | null): string {
    if (!value) return '-';
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));
}

interface SearchInputProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Cari...' }: SearchInputProps) {
    return (
        <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 w-full"
            />
        </div>
    );
}

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 mb-4">
                {icon}
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
            {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
            {action}
        </div>
    );
}

export function Pagination({ links }: { links: any[] }) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex flex-wrap gap-1 justify-center mt-4">
            {links.map((link, key) => (
                <Link
                    key={key}
                    href={link.url || '#'}
                    className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
                        link.active
                            ? 'bg-theme-600 text-white border-theme-600'
                            : link.url 
                                ? 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200' 
                                : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    onClick={(e: React.MouseEvent<any>) => {
                        if (!link.url) e.preventDefault();
                    }}
                />
            ))}
        </div>
    );
}
