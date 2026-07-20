import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ChevronLeft, Calendar as CalendarIcon, Clock, Share2, Tag, ChevronRight, ChevronLeft as ChevronLeftIcon } from 'lucide-react';

export default function NewsShow({ newsItem, relatedNews }: any) {
    const images = typeof newsItem.images === 'string' ? JSON.parse(newsItem.images) : (newsItem.images || []);
    
    // Faded Image Slideshow State
    const [currentSlide, setCurrentSlide] = useState(0);

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
                        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {newsItem.content}
                        </div>

                        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-gray-500">
                                <Tag size={16} />
                                <span className="text-sm">Kategori: {newsItem.category}</span>
                            </div>
                            <button className="flex items-center gap-2 text-gray-500 hover:text-theme-600 transition-colors text-sm font-medium">
                                <Share2 size={16} />
                                Bagikan
                            </button>
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
