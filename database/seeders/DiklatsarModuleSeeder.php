<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\DiklatsarModule;

class DiklatsarModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modules = [
            ['stage_number' => 1, 'title' => 'Sejarah & Prinsip Dasar BSMI'],
            ['stage_number' => 2, 'title' => 'Pertolongan Pertama (First Aid)'],
            ['stage_number' => 3, 'title' => 'Manajemen Bencana & Dapur Umum'],
            ['stage_number' => 4, 'title' => 'Logistik & Komunikasi Lapangan'],
            ['stage_number' => 5, 'title' => 'Simulasi & Praktik Lapangan'],
        ];

        foreach ($modules as $module) {
            DiklatsarModule::updateOrCreate(
                ['stage_number' => $module['stage_number']],
                $module
            );
        }
    }
}
