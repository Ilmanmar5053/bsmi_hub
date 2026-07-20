<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('executives', function (Blueprint $table) {
            $table->renameColumn('name', 'nama_lengkap');
            $table->renameColumn('position', 'jabatan');
            $table->renameColumn('division', 'bagian_divisi');
            $table->renameColumn('period_start', 'periode_mulai');
            $table->renameColumn('period_end', 'periode_selesai');
            $table->renameColumn('is_active', 'status_aktif');
        });

        Schema::table('executives', function (Blueprint $table) {
            $table->string('profesi_utama', 100)->nullable()->after('bagian_divisi');
            $table->boolean('kesiapan_mobilisasi')->default(false)->after('profesi_utama');
            $table->string('ukuran_baju', 10)->nullable()->after('kesiapan_mobilisasi');
            $table->string('golongan_darah', 5)->nullable()->after('ukuran_baju');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('executives', function (Blueprint $table) {
            $table->dropColumn(['profesi_utama', 'kesiapan_mobilisasi', 'ukuran_baju', 'golongan_darah']);
        });

        Schema::table('executives', function (Blueprint $table) {
            $table->renameColumn('nama_lengkap', 'name');
            $table->renameColumn('jabatan', 'position');
            $table->renameColumn('bagian_divisi', 'division');
            $table->renameColumn('periode_mulai', 'period_start');
            $table->renameColumn('periode_selesai', 'period_end');
            $table->renameColumn('status_aktif', 'is_active');
        });
    }
};
