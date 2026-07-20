<?php

namespace Database\Seeders;

use App\Models\Beneficiary;
use App\Models\DuesPayment;
use App\Models\DuesPeriod;
use App\Models\Executive;
use App\Models\FinancialTransaction;
use App\Models\LogisticsItem;
use App\Models\Member;
use App\Models\OrganizationProfile;
use App\Models\Program;
use App\Models\User;
use App\Models\Volunteer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ── Reset cached roles & permissions ──────────────────────────────────
        $this->call(RoleAndPermissionSeeder::class);
        $this->call(DiklatsarModuleSeeder::class);

        // Fetch roles for assigning to users later
        $superAdmin = Role::where('name', 'super_admin')->first();
        $ketua = Role::where('name', 'ketua')->first();
        $sekretaris = Role::where('name', 'sekretaris')->first();
        $bendahara = Role::where('name', 'bendahara')->first();
        $koordinatorLogistik = Role::where('name', 'koordinator_logistik')->first();
        $staff = Role::where('name', 'staff')->first();

        // ── 3. Demo Users ─────────────────────────────────────────────────────
        $admin = User::firstOrCreate(
            ['email' => 'admin@bsmi.org'],
            [
                'name'              => 'Administrator',
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole($superAdmin);

        $ketuaUser = User::firstOrCreate(
            ['email' => 'ketua@bsmi.org'],
            [
                'name'              => 'Ketua BSMI',
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $ketuaUser->assignRole($ketua);

        $bendaharaUser = User::firstOrCreate(
            ['email' => 'bendahara@bsmi.org'],
            [
                'name'              => 'Bendahara',
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $bendaharaUser->assignRole($bendahara);

        // ── 4. Organization Profile ───────────────────────────────────────────
        OrganizationProfile::firstOrCreate(
            ['name' => 'BSMI – Bulan Sabit Merah Indonesia'],
            [
                'vision'       => 'Menjadi organisasi kemanusiaan terpercaya yang mewujudkan masyarakat sejahtera, sehat, dan berdaya berdasarkan nilai-nilai Islam.',
                'mission'      => "1. Memberikan bantuan kemanusiaan tanpa memandang suku, agama, ras, dan golongan.\n2. Meningkatkan kapasitas relawan dan anggota dalam bidang kesehatan dan kebencanaan.\n3. Menjalin kerjasama dengan lembaga nasional dan internasional.\n4. Mengelola sumber daya secara transparan dan akuntabel.",
                'address'      => 'Jl. Proklamasi No. 45, Kelurahan Pegangsaan, Kecamatan Menteng, Jakarta Pusat 10320',
                'phone'        => '(021) 3192-4561',
                'email'        => 'info@bsmi.or.id',
                'website'      => 'https://www.bsmi.or.id',
                'founded_year' => 2002,
                'history'      => 'Bulan Sabit Merah Indonesia (BSMI) didirikan pada tahun 2002 oleh para aktivis kemanusiaan dan profesional kesehatan yang terinspirasi oleh nilai-nilai Islam. Sejak berdiri, BSMI telah aktif memberikan bantuan darurat di berbagai daerah bencana di Indonesia maupun luar negeri, serta menjalankan program pemberdayaan masyarakat berkelanjutan.',
            ]
        );

        // ── 5. Members (15 demo anggota) ──────────────────────────────────────
        $memberData = [
            ['BSM-001', 'Ahmad Fauzi Ramadhan',    'ahmad.fauzi@email.com',   '08112345001', 'Medis & Kesehatan',  '2020-03-15', 'active'],
            ['BSM-002', 'Siti Nurhaliza Putri',    'siti.nurhaliza@email.com','08112345002', 'Logistik',           '2020-05-20', 'active'],
            ['BSM-003', 'Muhammad Rizki Pratama',  'rizki.pratama@email.com', '08112345003', 'Relawan',            '2020-07-10', 'active'],
            ['BSM-004', 'Dewi Rahayu Susanti',     'dewi.rahayu@email.com',   '08112345004', 'Administrasi',       '2021-01-08', 'active'],
            ['BSM-005', 'Hendra Gunawan Saputra',  'hendra.gunawan@email.com','08112345005', 'Medis & Kesehatan',  '2021-03-22', 'active'],
            ['BSM-006', 'Rina Widyastuti',         'rina.widya@email.com',    '08112345006', 'Logistik',           '2021-06-14', 'active'],
            ['BSM-007', 'Dodi Firmansyah',         'dodi.firmansyah@email.com','08112345007','Relawan',            '2021-09-01', 'active'],
            ['BSM-008', 'Yulia Anggraeni',         'yulia.anggraeni@email.com','08112345008', 'Keuangan',          '2022-01-17', 'active'],
            ['BSM-009', 'Budi Santoso Wibowo',     'budi.santoso@email.com',  '08112345009', 'Medis & Kesehatan', '2022-04-05', 'active'],
            ['BSM-010', 'Nurul Hidayah',           'nurul.hidayah@email.com', '08112345010', 'Administrasi',      '2022-06-30', 'active'],
            ['BSM-011', 'Irfan Hakim Nasution',    'irfan.hakim@email.com',   '08112345011', 'Relawan',           '2022-09-12', 'active'],
            ['BSM-012', 'Lestari Wulandari',       'lestari.wulan@email.com', '08112345012', 'Keuangan',          '2023-02-20', 'active'],
            ['BSM-013', 'Fajar Setiawan',          'fajar.setiawan@email.com','08112345013', 'Logistik',          '2023-05-07', 'inactive'],
            ['BSM-014', 'Anggraeni Kusuma Dewi',   'anggraeni.kd@email.com',  '08112345014', 'Medis & Kesehatan', '2023-08-18', 'active'],
            ['BSM-015', 'Reza Maulana Habibie',    'reza.maulana@email.com',  '08112345015', 'Relawan',           '2024-01-10', 'active'],
        ];

        $members = collect();
        $regionalOptions = [
            'BSMI Kabupaten Serang', 'BSMI Kota Serang', 'BSMI Kabupaten Tangerang',
            'BSMI Kota Tangerang', 'BSMI Kota Cilegon', 'BSMI Lebak'
        ];
        $pendidikanOptions = ['SMA/SMK Sederajat', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3'];
        $jurusanOptions = ['Kedokteran', 'Keperawatan', 'Farmasi', 'Teknik Informatika', 'Akuntansi', 'Manajemen', 'Hukum', 'Hubungan Internasional'];
        $statusKeluargaOptions = ['Belum Menikah', 'Menikah', 'Cerai Hidup', 'Cerai Mati'];
        $agamaOptions = ['Islam', 'Protestan', 'Katolik', 'Hindu', 'Buddha', 'Khonghucu'];
        $tanggunganOptions = ['TK', 'K1', 'K2', 'K3'];

        foreach ($memberData as $i => [$number, $name, $email, $phone, $division, $joinDate, $status]) {
            $members->push(Member::firstOrCreate(
                ['no_induk_anggota' => $number],
                [
                    'nama_lengkap'         => $name,
                    'email'                => $email,
                    'no_whatsapp'          => $phone,
                    'bagian_divisi'        => $division,
                    'join_date'            => $joinDate,
                    'status_aktif'         => $status === 'active',
                    'alamat_domisili'      => 'Jl. Contoh No. ' . ($i + 1) . ', Serang, Banten',
                    'birth_date'           => Carbon::create(1985 + $i, ($i % 12) + 1, ($i % 28) + 1),
                    'golongan_darah'       => ['A', 'B', 'AB', 'O'][$i % 4],
                    'regional_cabang'      => $regionalOptions[$i % count($regionalOptions)],
                    'pendidikan_terakhir'  => $pendidikanOptions[$i % count($pendidikanOptions)],
                    'jurusan'              => $jurusanOptions[$i % count($jurusanOptions)],
                    'status_keluarga'      => $statusKeluargaOptions[$i % count($statusKeluargaOptions)],
                    'agama'                => $agamaOptions[$i % count($agamaOptions)],
                    'jumlah_tanggungan'    => $tanggunganOptions[$i % count($tanggunganOptions)],
                    'gender'               => ['L', 'P'][$i % 2],
                ]
            ));
        }

        // ── 6. Executives (5 pengurus aktif) ──────────────────────────────────
        $executiveData = [
            [0, 'Ketua Umum',        'Pimpinan Umum',        '2023-01-01', '2025-12-31'],
            [1, 'Wakil Ketua',       'Pimpinan',             '2023-01-01', '2025-12-31'],
            [2, 'Sekretaris Umum',   'Administrasi',         '2023-01-01', '2025-12-31'],
            [3, 'Bendahara Umum',    'Keuangan',             '2023-01-01', '2025-12-31'],
            [4, 'Koordinator Lapangan', 'Operasional',       '2023-01-01', '2025-12-31'],
        ];

        foreach ($executiveData as [$memberIndex, $position, $division, $start, $end]) {
            $member = $members->get($memberIndex);
            Executive::firstOrCreate(
                ['member_id' => $member->id, 'jabatan' => $position],
                [
                    'nama_lengkap'    => $member->nama_lengkap,
                    'bagian_divisi'   => $division,
                    'periode_mulai'   => $start,
                    'periode_selesai' => $end,
                    'status_aktif'    => true,
                ]
            );
        }

        // ── 7. Beneficiaries (10 penerima manfaat) ────────────────────────────
        $beneficiaryData = [
            ['Keluarga Pak Suparman',     'ekonomi',       'Bekasi Timur',   '02198765001', 4, 'Kepala keluarga tidak mampu bekerja karena sakit kronis'],
            ['Panti Asuhan Al-Ikhlas',    'lainnya',       'Depok',          '02198765002', 45,'Panti asuhan dengan 45 anak yatim piatu'],
            ['Ibu Saminah (Janda)',       'ekonomi',       'Tangerang',      '02198765003', 3, 'Janda lansia dengan 3 cucu tanggungan'],
            ['Keluarga Bapak Rohman',     'bencana',       'Jakarta Timur',  '02198765004', 6, 'Korban kebakaran, kehilangan tempat tinggal'],
            ['Madrasah Nurul Iman',       'pendidikan',    'Bogor',          '02198765005', 80,'Madrasah dengan 80 siswa kurang mampu'],
            ['Keluarga Pak Joko',         'ekonomi',       'Jakarta Selatan','02198765006', 5, 'Penghasilan sangat rendah, anak 3 orang'],
            ['Komunitas Nelayan Muara',   'ekonomi',       'Jakarta Utara',  '02198765007', 35,'Komunitas nelayan tradisional berpenghasilan rendah'],
            ['Nenek Kasmini',             'ekonomi',       'Bekasi Barat',   '02198765008', 1, 'Lansia sebatang kara, tidak ada keluarga'],
            ['Keluarga Pak Slamet',       'medis',         'Tangerang Sel.', '02198765009', 4, 'Kepala keluarga penyandang disabilitas'],
            ['Yayasan Rumah Harapan',     'lainnya',       'Bekasi Utara',   '02198765010', 30,'Panti jompo dengan kapasitas 30 lansia'],
        ];

        foreach ($beneficiaryData as [$name, $category, $address, $phone, $familyMembers, $description]) {
            Beneficiary::firstOrCreate(
                ['phone' => $phone],
                [
                    'name'           => $name,
                    'category'       => $category,
                    'address'        => $address,
                    'family_members' => $familyMembers,
                    'description'    => $description,
                    'total_received' => rand(500_000, 5_000_000),
                ]
            );
        }

        // ── 8. Programs (5 program) ───────────────────────────────────────────
        $programData = [
            [
                'title'               => 'Bantuan Pangan Ramadan 1446H',
                'description'         => 'Distribusi paket sembako kepada keluarga dhuafa selama bulan Ramadan.',
                'category'            => 'sosial',
                'status'              => 'completed',
                'start_date'          => '2025-03-01',
                'end_date'            => '2025-03-31',
                'budget'              => 50_000_000,
                'spent'               => 48_750_000,
                'location'            => 'DKI Jakarta & Bekasi',
                'target_beneficiaries'=> 200,
            ],
            [
                'title'               => 'Klinik Kesehatan Gratis',
                'description'         => 'Pelayanan kesehatan gratis bagi masyarakat tidak mampu setiap bulan.',
                'category'            => 'kesehatan',
                'status'              => 'ongoing',
                'start_date'          => '2024-01-01',
                'end_date'            => '2025-12-31',
                'budget'              => 120_000_000,
                'spent'               => 65_300_000,
                'location'            => 'Puskesmas Mitra, Jakarta Timur',
                'target_beneficiaries'=> 1000,
            ],
            [
                'title'               => 'Beasiswa Pendidikan Anak Yatim',
                'description'         => 'Program beasiswa untuk anak yatim piatu berprestasi tingkat SD-SMA.',
                'category'            => 'pendidikan',
                'status'              => 'ongoing',
                'start_date'          => '2025-01-15',
                'end_date'            => '2025-12-15',
                'budget'              => 75_000_000,
                'spent'               => 30_000_000,
                'location'            => 'Jabodetabek',
                'target_beneficiaries'=> 50,
            ],
            [
                'title'               => 'Tanggap Darurat Banjir Jabodetabek',
                'description'         => 'Bantuan darurat berupa makanan siap saji, pakaian, dan obat-obatan bagi korban banjir.',
                'category'            => 'bencana',
                'status'              => 'planned',
                'start_date'          => '2025-11-01',
                'end_date'            => '2025-11-30',
                'budget'              => 30_000_000,
                'spent'               => 0,
                'location'            => 'Jabodetabek',
                'target_beneficiaries'=> 500,
            ],
            [
                'title'               => 'Pelatihan Keterampilan Masyarakat',
                'description'         => 'Pelatihan menjahit dan kerajinan tangan untuk ibu rumah tangga kurang mampu.',
                'category'            => 'sosial',
                'status'              => 'planned',
                'start_date'          => '2025-09-01',
                'end_date'            => '2025-11-30',
                'budget'              => 25_000_000,
                'spent'               => 0,
                'location'            => 'Jakarta Selatan',
                'target_beneficiaries'=> 40,
            ],
        ];

        foreach ($programData as $data) {
            Program::firstOrCreate(
                ['title' => $data['title']],
                array_merge($data, ['created_by' => $admin->id])
            );
        }

        // ── 9. Logistics Items (8 item) ───────────────────────────────────────
        $logisticsData = [
            ['Beras 5 Kg',           'makanan',    150,  'karung',  'baik',       'Gudang Utama'],
            ['Minyak Goreng 2L',     'makanan',    80,   'botol',   'baik',       'Gudang Utama'],
            ['Pakaian Layak Pakai',  'pakaian',    300,  'potong',  'baik',       'Gudang Pakaian'],
            ['Obat-obatan Umum',     'obat',       50,   'paket',   'baik',       'Gudang Medis'],
            ['Selimut Tebal',        'pakaian',    120,  'lembar',  'baik',       'Gudang Pakaian'],
            ['Susu Formula',         'makanan',    40,   'kaleng',  'baik',       'Gudang Utama'],
            ['Tenda Darurat',        'peralatan',  10,   'unit',    'baik',       'Gudang Alat'],
            ['Alat P3K',             'obat',       25,   'kotak',   'baik',       'Gudang Medis'],
        ];

        foreach ($logisticsData as [$name, $category, $qty, $unit, $condition, $location]) {
            LogisticsItem::firstOrCreate(
                ['name' => $name],
                [
                    'category'  => $category,
                    'quantity'  => $qty,
                    'unit'      => $unit,
                    'condition' => $condition,
                    'location'  => $location,
                ]
            );
        }

        // ── 10. Dues Period & Payments ────────────────────────────────────────
        $now = Carbon::now();
        $duesPeriod = DuesPeriod::firstOrCreate(
            ['month' => $now->month, 'year' => $now->year],
            [
                'amount'   => 50_000,
                'due_date' => $now->copy()->endOfMonth(),
                'notes'    => 'Iuran bulanan anggota BSMI periode ' . $now->isoFormat('MMMM YYYY'),
            ]
        );

        // Create payments for all members (alternating paid/unpaid)
        foreach ($members as $index => $member) {
            $isPaid = $index % 3 !== 2; // first 2 of every 3 paid, third unpaid
            DuesPayment::firstOrCreate(
                ['dues_period_id' => $duesPeriod->id, 'member_id' => $member->id],
                [
                    'amount'    => 50_000,
                    'status'    => $isPaid ? 'paid' : 'unpaid',
                    'paid_date' => $isPaid ? $now->copy()->subDays(rand(1, 15)) : null,
                    'notes'     => $isPaid ? 'Lunas' : null,
                ]
            );
        }

        // ── 11. Financial Transactions (20 transaksi) ─────────────────────────
        $transactionData = [
            // Income
            ['pemasukan',  '2025-01-05', 'donasi',        'Donasi dari Bapak H. Ahmad',                  5_000_000],
            ['pemasukan',  '2025-01-15', 'iuran_anggota', 'Iuran anggota Januari 2025',                 700_000],
            ['pemasukan',  '2025-02-10', 'donasi',        'Donasi dari Yayasan Amanah',                 10_000_000],
            ['pemasukan',  '2025-02-20', 'iuran_anggota', 'Iuran anggota Februari 2025',                650_000],
            ['pemasukan',  '2025-03-05', 'donasi',        'Donasi Ramadan dari berbagai donatur',        25_000_000],
            ['pemasukan',  '2025-03-18', 'hibah',         'Hibah dari Kemensos untuk program sembako',   15_000_000],
            ['pemasukan',  '2025-04-10', 'iuran_anggota', 'Iuran anggota April 2025',                   700_000],
            ['pemasukan',  '2025-05-08', 'donasi',        'Donasi dari Komunitas Pengusaha Muslim',       8_000_000],
            ['pemasukan',  '2025-06-12', 'donasi',        'Penggalangan dana bazar amal',                3_500_000],
            ['pemasukan',  '2025-06-30', 'iuran_anggota', 'Iuran anggota Juni 2025',                    700_000],
            // Expenses
            ['pengeluaran', '2025-01-20', 'operasional',   'Biaya sewa kantor bulan Januari',             2_000_000],
            ['pengeluaran', '2025-01-25', 'program',       'Pembelian sembako Januari',                    3_200_000],
            ['pengeluaran', '2025-02-15', 'operasional',   'Biaya ATK dan perlengkapan kantor',             450_000],
            ['pengeluaran', '2025-02-28', 'operasional',   'Biaya sewa kantor bulan Februari',             2_000_000],
            ['pengeluaran', '2025-03-10', 'program',       'Distribusi paket Ramadan – Batch 1',          12_000_000],
            ['pengeluaran', '2025-03-20', 'program',       'Distribusi paket Ramadan – Batch 2',          11_500_000],
            ['pengeluaran', '2025-04-05', 'operasional',   'Biaya listrik & air kuartal 1',                 750_000],
            ['pengeluaran', '2025-04-18', 'program',       'Pembelian obat-obatan klinik gratis',           5_000_000],
            ['pengeluaran', '2025-05-22', 'operasional',   'Biaya pelatihan relawan baru',                2_500_000],
            ['pengeluaran', '2025-06-15', 'program',       'Pembelian perlengkapan beasiswa',              3_000_000],
        ];

        foreach ($transactionData as [$type, $date, $category, $description, $amount]) {
            FinancialTransaction::firstOrCreate(
                ['description' => $description, 'date' => $date],
                [
                    'type'       => $type,
                    'amount'     => $amount,
                    'category'   => $category,
                    'date'       => $date,
                    'created_by' => $bendaharaUser->id,
                ]
            );
        }

        // ── 12. Volunteers (8 relawan) ────────────────────────────────────────
        $volunteerData = [
            ['Andi Kurniawan',         'andi.kurniawan@email.com',   '08219876001', 'pending',  '2025-06-01', null],
            ['Mega Putri Lestari',     'mega.putri@email.com',       '08219876002', 'approved', '2025-05-15', $admin->id],
            ['Dimas Arfian Nugroho',   'dimas.arfian@email.com',     '08219876003', 'approved', '2025-05-20', $admin->id],
            ['Fitria Rahmawati',       'fitria.rahma@email.com',     '08219876004', 'pending',  '2025-06-10', null],
            ['Gilang Permana',         'gilang.permana@email.com',   '08219876005', 'approved', '2025-04-28', $admin->id],
            ['Hasna Aulia Zahra',      'hasna.aulia@email.com',      '08219876006', 'rejected', '2025-04-10', $admin->id],
            ['Ivan Setyawan Putra',    'ivan.setyawan@email.com',    '08219876007', 'pending',  '2025-06-20', null],
            ['Kartika Dewi Maharani',  'kartika.dewi@email.com',     '08219876008', 'approved', '2025-03-15', $admin->id],
        ];

        $occupations = [
            ['Kesehatan & Medis', 'Perawat'],
            ['Swasta & Profesional', 'Karyawan Swasta'],
            ['Wiraswasta & Pekerja Mandiri', 'Freelancer'],
            ['Pendidikan & Akademik', 'Mahasiswa'],
            ['Lainnya', 'Guru']
        ];
        $skillsList  = ['Medis & P3K', 'Logistik & Transportasi', 'Dokumentasi & Fotografi', 'Administrasi', 'Dapur Umum'];

        $regionalOptions = [
            'BSMI Kabupaten Serang', 'BSMI Kota Serang', 'BSMI Kabupaten Tangerang',
            'BSMI Kota Tangerang', 'BSMI Kota Cilegon', 'BSMI Lebak'
        ];
        $pendidikanOptions = ['SMA/SMK Sederajat', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3'];
        $jurusanOptions = ['Kedokteran', 'Keperawatan', 'Farmasi', 'Teknik Informatika', 'Akuntansi', 'Manajemen', 'Hukum', 'Hubungan Internasional'];
        $statusKeluargaOptions = ['Belum Menikah', 'Menikah', 'Cerai Hidup', 'Cerai Mati'];
        $agamaOptions = ['Islam', 'Protestan', 'Katolik', 'Hindu', 'Buddha', 'Khonghucu'];
        $tanggunganOptions = ['TK', 'K1', 'K2', 'K3'];

        foreach ($volunteerData as $i => [$name, $email, $phone, $status, $appliedDate, $reviewedBy]) {
            $occ = $occupations[$i % count($occupations)];
            Volunteer::firstOrCreate(
                ['email' => $email],
                [
                    'name'                => $name,
                    'phone'               => $phone,
                    'address'             => 'Jl. Relawan No. ' . ($i + 1) . ', Jakarta',
                    'birth_date'          => Carbon::create(1995 + ($i % 5), ($i % 12) + 1, 10),
                    'skills'              => $skillsList[$i % count($skillsList)],
                    'motivation'          => 'Ingin berkontribusi untuk masyarakat dan mengamalkan nilai-nilai kemanusiaan yang saya yakini.',
                    'job_category'        => $occ[0],
                    'job_type'            => $occ[1],
                    'status'              => $status,
                    'applied_date'        => $appliedDate,
                    'reviewed_by'         => $reviewedBy,
                    'reviewed_at'         => $reviewedBy ? Carbon::parse($appliedDate)->addDays(5) : null,
                    'review_notes'        => $status === 'rejected' ? 'Tidak memenuhi syarat usia minimum.' : null,
                    'gender'              => ['L', 'P'][$i % 2],
                    'golongan_darah'      => ['A', 'B', 'AB', 'O'][$i % 4],
                    'kesiapan_mobilisasi' => ($i % 3 === 0),
                    'ukuran_baju'         => ['S', 'M', 'L', 'XL', 'XXL'][$i % 5],
                    'emergency_contact'   => 'Kontak Darurat ' . ($i + 1),
                    'emergency_phone'     => '0812999900' . $i,
                    'regional_cabang'     => $regionalOptions[$i % count($regionalOptions)],
                    'pendidikan_terakhir' => $pendidikanOptions[$i % count($pendidikanOptions)],
                    'jurusan'             => $jurusanOptions[$i % count($jurusanOptions)],
                    'status_keluarga'     => $statusKeluargaOptions[$i % count($statusKeluargaOptions)],
                    'agama'               => $agamaOptions[$i % count($agamaOptions)],
                    'jumlah_tanggungan'   => $tanggunganOptions[$i % count($tanggunganOptions)],
                ]
            );
        }

        $this->call(NewsSeeder::class);

        $this->command->info('✅  DatabaseSeeder selesai. Data demo berhasil dibuat.');
        $this->command->table(
            ['Entitas', 'Jumlah'],
            [
                ['Permissions', \Spatie\Permission\Models\Permission::count()],
                ['Roles',       6],
                ['Users',       3],
                ['Members',     count($memberData)],
                ['Executives',  count($executiveData)],
                ['Beneficiaries', count($beneficiaryData)],
                ['Programs',    count($programData)],
                ['Logistics Items', count($logisticsData)],
                ['Dues Payments', $members->count()],
                ['Financial Transactions', count($transactionData)],
                ['Volunteers',  count($volunteerData)],
            ]
        );
    }
}
