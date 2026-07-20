<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class NewsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $gallery = [
            '/images/gallery/slide-1.png',
            '/images/gallery/slide-2.png',
            '/images/gallery/slide-3.png',
            '/images/gallery/slide-4.png',
            '/images/gallery/slide-5.png',
        ];

        $news = [
            [
                'title' => 'Distribusi Bantuan Logistik Pasca Banjir Bandang',
                'slug' => 'distribusi-bantuan-logistik-pasca-banjir-bandang',
                'content' => "Relawan Bulan Sabit Merah Indonesia (BSMI) telah terjun langsung ke lokasi terdampak banjir bandang untuk menyalurkan bantuan logistik. Bantuan berupa makanan siap saji, obat-obatan, dan pakaian layak pakai diserahkan langsung kepada warga yang mengungsi di posko darurat.\n\nDalam keterangannya, koordinator lapangan BSMI menyampaikan bahwa kebutuhan mendesak saat ini adalah air bersih dan selimut. Tim paramedis BSMI juga telah mendirikan tenda medis untuk melayani keluhan kesehatan warga, terutama penyakit kulit dan pernapasan yang sering muncul pasca banjir.\n\nKegiatan ini merupakan bentuk respon cepat BSMI terhadap bencana alam, sejalan dengan visi kemanusiaan yang dijunjung tinggi oleh seluruh elemen relawan di berbagai daerah.",
                'category' => 'Kegiatan',
                'images' => json_encode($gallery),
                'status' => 'published',
                'published_at' => now()->subDays(2),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Pelatihan Pertolongan Pertama (First Aid) Angkatan X',
                'slug' => 'pelatihan-pertolongan-pertama-angkatan-x',
                'content' => "Sebagai upaya peningkatan kapasitas dan kesiapsiagaan, BSMI kembali mengadakan Pelatihan Pertolongan Pertama (First Aid) Angkatan X yang diikuti oleh lebih dari 50 calon relawan baru. Pelatihan ini berlangsung selama tiga hari dengan menghadirkan instruktur medis bersertifikasi.\n\nMateri yang diberikan mencakup Bantuan Hidup Dasar (BHD), penanganan luka, stabilisasi patah tulang, serta simulasi evakuasi medis di lapangan. Para peserta terlihat antusias mengikuti setiap sesi praktik, karena kemampuan ini sangat krusial saat bertugas di area darurat atau bencana.\n\nDiharapkan melalui pelatihan ini, relawan BSMI semakin profesional dan sigap dalam memberikan pertolongan pertama guna menyelamatkan lebih banyak nyawa sebelum penanganan medis lanjutan.",
                'category' => 'Berita',
                'images' => json_encode($gallery),
                'status' => 'published',
                'published_at' => now()->subDays(5),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Layanan Ambulans Darurat BSMI Siaga 24 Jam',
                'slug' => 'layanan-ambulans-darurat-bsmi-siaga-24-jam',
                'content' => "Layanan Ambulans Darurat BSMI terus beroperasi siaga 24 jam untuk melayani masyarakat yang membutuhkan evakuasi medis mendesak. Dengan fasilitas alat medis darurat (Emergency Medical Kit) yang lengkap, tim paramedis di dalam ambulans siap memberikan stabilisasi pasien sebelum tiba di fasilitas kesehatan terdekat.\n\nMasyarakat dapat menghubungi call center darurat BSMI jika mengalami kecelakaan, serangan jantung mendadak, atau kondisi medis kritis lainnya yang membutuhkan transportasi medis segera. Layanan ini sepenuhnya didukung oleh donasi dan dedikasi penuh dari para relawan medis dan driver ambulans terlatih.\n\nKehadiran ambulans siaga ini merupakan bukti komitmen nyata BSMI dalam mengabdi dan berkontribusi langsung pada keselamatan masyarakat luas.",
                'category' => 'Informasi',
                'images' => json_encode($gallery),
                'status' => 'published',
                'published_at' => now()->subDays(10),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        \App\Models\News::insert($news);
    }
}
