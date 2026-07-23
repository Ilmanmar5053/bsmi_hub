import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Modal } from '@/Components/Shared';
import { Plus, Search, Image as ImageIcon, ChevronRight, Clock, Trash2, Newspaper, Edit } from 'lucide-react';
import { confirmAction } from '@/Utils/swal';

// Helper function to compress images
const compressImage = (file: File, maxWidth = 1920, quality = 0.7): Promise<File> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        resolve(file);
                    }
                }, file.type, quality);
            };
        };
    });
};

export default function NewsIndex({ news, filters }: any) {
    const { auth } = usePage<any>().props;
    const isSuperAdmin = auth.roles?.includes('administrator');
    const canManageNews = isSuperAdmin || (auth.permissions?.includes('menu-news')
        && !auth.roles?.includes('anggota')
        && !auth.roles?.includes('relawan'));
    
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'Semua');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const categories = ['Semua', 'Berita', 'Pengumuman', 'Kegiatan', 'Informasi'];

    const { data, setData, post, processing, reset, errors, delete: destroy } = useForm({
        title: '',
        category: 'Berita',
        content: '',
        images: [] as File[],
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        window.location.href = `/news?search=${searchTerm}&category=${selectedCategory}`;
    };

    const handleCategoryClick = (category: string) => {
        setSelectedCategory(category);
        window.location.href = `/news?search=${searchTerm}&category=${category}`;
    };

    const handleOpenAdd = () => {
        reset();
        setData('_method' as any, 'post');
        setEditingId(null);
        setIsCreateModalOpen(true);
    };

    const handleEdit = (item: any) => {
        setData({
            title: item.title,
            category: item.category,
            content: item.content,
            images: [], // Images are managed separately or replaced entirely
            _method: 'put'
        } as any);
        setEditingId(item.id);
        setIsCreateModalOpen(true);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setEditingId(null);
                reset();
            }
        };

        if (editingId) {
            post(`/news/${editingId}`, options);
        } else {
            post('/news', options);
        }
    };

    const handleDelete = async (item: any) => {
        if (await confirmAction(`Anda yakin ingin menghapus berita "${item.title}"? Tindakan ini tidak dapat dibatalkan.`)) {
            destroy(`/news/${item.id}`);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(date);
    };

    return (
        <AppLayout>
            <Head title="Berita & Informasi" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portal Berita</h1>
                        <p className="text-gray-500 mt-2 text-sm">Informasi, Pengumuman, dan Dokumentasi Kegiatan BSMI</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <form onSubmit={handleSearch} className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Cari berita..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-theme-500 transition-all dark:text-white"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        </form>
                        
                        {canManageNews && (
                            <button
                                onClick={handleOpenAdd}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-theme-600 hover:bg-theme-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm"
                            >
                                <Plus size={16} />
                                Tambah Berita
                            </button>
                        )}
                    </div>
                </div>

                {/* Categories */}
                <div className="flex overflow-x-auto pb-4 mb-6 gap-2 hide-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryClick(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                                selectedCategory === cat 
                                    ? 'bg-theme-600 text-white shadow-md' 
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid News Cards */}
                {news.data.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {news.data.map((item: any) => {
                            const images = typeof item.images === 'string' ? JSON.parse(item.images) : item.images;
                            const coverImage = images && images.length > 0 ? images[0] : null;

                            return (
                                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
                                    <div className="relative h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
                                        {coverImage ? (
                                            <img 
                                                src={coverImage} 
                                                alt={item.title} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ImageIcon size={40} className="text-gray-400" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-theme-700 text-xs font-bold rounded-lg shadow-sm">
                                                {item.category}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={14} />
                                                {formatDate(item.published_at)}
                                            </div>
                                            {images && images.length > 1 && (
                                                <div className="flex items-center gap-1.5">
                                                    <ImageIcon size={14} />
                                                    {images.length} Foto
                                                </div>
                                            )}
                                        </div>
                                        
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-theme-600 transition-colors">
                                            {item.title}
                                        </h3>
                                        
                                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 flex-1">
                                            {item.content}
                                        </p>
                                        
                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <Link 
                                                href={`/news/${item.slug}`}
                                                className="text-theme-600 dark:text-theme-400 text-sm font-medium hover:text-theme-700 flex items-center gap-1"
                                            >
                                                Baca Selengkapnya
                                                <ChevronRight size={16} />
                                            </Link>

                                            {canManageNews && (
                                                <div className="flex items-center gap-1">
                                                    <button 
                                                        onClick={() => handleEdit(item)}
                                                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Berita"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(item)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Hapus Berita"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Newspaper size={24} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Belum Ada Berita</h3>
                        <p className="text-gray-500 text-sm">Tidak ada artikel berita yang ditemukan untuk pencarian atau kategori ini.</p>
                    </div>
                )}
            </div>

            {/* Create / Edit News Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title={editingId ? "Edit Berita" : "Buat Berita Baru"} size="xl">
                <form onSubmit={handleCreate} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Berita</label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={e => setData('title', e.target.value)}
                            className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:ring-theme-500 bg-white dark:bg-gray-700 dark:text-white"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                        <select
                            value={data.category}
                            onChange={e => setData('category', e.target.value)}
                            className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:ring-theme-500 bg-white dark:bg-gray-700 dark:text-white"
                        >
                            <option value="Berita">Berita</option>
                            <option value="Pengumuman">Pengumuman</option>
                            <option value="Kegiatan">Kegiatan</option>
                            <option value="Informasi">Informasi</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Konten / Isi Artikel</label>
                        <textarea
                            value={data.content}
                            onChange={e => setData('content', e.target.value)}
                            rows={8}
                            className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:ring-theme-500 bg-white dark:bg-gray-700 dark:text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Galeri Foto (Min/Max 5 Foto)</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={async (e) => {
                                const files = e.target.files;
                                if (files) {
                                    // Set processing so user can't submit while compressing
                                    // We will compress images one by one
                                    const compressedFiles: File[] = [];
                                    for (let i = 0; i < Math.min(files.length, 5); i++) {
                                        const compressed = await compressImage(files[i]);
                                        compressedFiles.push(compressed);
                                    }
                                    setData('images', compressedFiles);
                                }
                            }}
                            className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 text-sm focus:ring-theme-500 bg-white dark:bg-gray-700 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 mt-1">Pilih maksimal 5 foto dokumentasi terkait berita ini.</p>
                        {errors.images && <p className="text-xs text-red-500 mt-1">{errors.images}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 text-sm font-medium text-white bg-theme-600 hover:bg-theme-700 disabled:opacity-50 rounded-xl shadow-sm shadow-theme-200 transition-all flex items-center justify-center gap-2"
                        >
                            {processing ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Simpan & Publikasikan')}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
