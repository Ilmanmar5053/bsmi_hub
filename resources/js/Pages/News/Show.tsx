import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ChevronLeft, Calendar as CalendarIcon, Clock, Share2, Tag, ChevronRight, ChevronLeft as ChevronLeftIcon, Link as LinkIcon, Check } from 'lucide-react';

export default function NewsShow({ newsItem, relatedNews }: any) {
    const images = typeof newsItem.images === 'string' ? JSON.parse(newsItem.images) : (newsItem.images || []);
    
    // Faded Image Slideshow State
    const [currentSlide, setCurrentSlide] = useState(0);
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        const url = window.location.href;
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(url).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        } else {
            // Fallback for non-HTTPS local environments (.test)
            const textArea = document.createElement("textarea");
            textArea.value = url;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Unable to copy', err);
            }
            document.body.removeChild(textArea);
        }
    };

    const getShareUrl = (platform: string) => {
        if (typeof window === 'undefined') return '#';
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(newsItem.title);
        
        switch(platform) {
            case 'whatsapp':
                return `https://api.whatsapp.com/send?text=${text}%20${url}`;
            case 'facebook':
                return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            case 'twitter':
                return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
            default:
                return '#';
        }
    };

    useEffect(() => {
        if (!images || images.length <= 1) return;
        
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % images.length);
        }, 5000); // 5 seconds
        
        return () => clearInterval(interval);
    }, [images]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    };

    return (
        <AppLayout>
            <Head title={`${newsItem.title} - Berita BSMI`} />
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <Link 
                    href="/news"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-theme-600 transition-colors mb-6"
                >
                    <ChevronLeft size={16} />
                    Kembali ke Daftar Berita
                </Link>

                <article className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    
                    {/* Header Info */}
                    <div className="p-6 md:p-10 pb-6">
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
                            <span className="px-3 py-1 bg-theme-50 dark:bg-theme-900/30 text-theme-600 dark:text-theme-400 font-bold rounded-lg uppercase tracking-wider text-xs">
                                {newsItem.category}
                            </span>
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                            <div className="flex items-center gap-1.5">
                                <CalendarIcon size={14} />
                                {formatDate(newsItem.published_at)}
                            </div>
                        </div>
                        
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                            {newsItem.title}
                        </h1>

                        {/* Faded Slideshow Gallery */}
                        {images && images.length > 0 && (
                            <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden bg-gray-900 shadow-inner group">
                                {images.map((img: string, idx: number) => (
                                    <img 
                                        key={idx}
                                        src={img} 
                                        alt={`Slide ${idx + 1}`}
                                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                                            currentSlide === idx ? 'opacity-100' : 'opacity-0'
                                        }`}
                                    />
                                ))}
                                
                                {/* Overlay gradient for better look */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                
                                {/* Slideshow controls & indicator */}
                                {images.length > 1 && (
                                    <>
                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                                            {images.map((_: any, idx: number) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCurrentSlide(idx)}
                                                    className={`w-2 h-2 rounded-full transition-all ${
                                                        currentSlide === idx ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-10 pt-0">
                        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-justify">
                            {newsItem.content}
                        </div>

                        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-gray-500">
                                <Tag size={16} />
                                <span className="text-sm">Kategori: {newsItem.category}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-500 mr-1 hidden sm:block">Bagikan:</span>
                                
                                {/* WhatsApp */}
                                <a href={getShareUrl('whatsapp')} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm" title="Bagikan ke WhatsApp">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                    </svg>
                                </a>
                                
                                {/* Facebook */}
                                <a href={getShareUrl('facebook')} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm" title="Bagikan ke Facebook">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                </a>

                                {/* X / Twitter */}
                                <a href={getShareUrl('twitter')} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm" title="Bagikan ke X">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
                                    </svg>
                                </a>

                                {/* Copy Link */}
                                <button onClick={handleCopyLink} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-110 transition-all shadow-sm" title="Salin Tautan">
                                    {copied ? <Check size={14} className="text-green-600" /> : <LinkIcon size={14} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </article>

                {/* Related News */}
                {relatedNews && relatedNews.length > 0 && (
                    <div className="mt-12">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Berita Terkait</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedNews.map((item: any) => {
                                const relImages = typeof item.images === 'string' ? JSON.parse(item.images) : (item.images || []);
                                const cover = relImages.length > 0 ? relImages[0] : null;

                                return (
                                    <Link href={`/news/${item.slug}`} key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group">
                                        <div className="h-32 overflow-hidden bg-gray-100">
                                            {cover && <img src={cover} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                                        </div>
                                        <div className="p-4">
                                            <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-theme-600 transition-colors">{item.title}</h4>
                                            <p className="text-xs text-gray-500 mt-2">{formatDate(item.published_at)}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
