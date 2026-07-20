<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Rename columns (using DB statements for safer ENUM handling in some cases, but Schema builder works for simple strings)
        Schema::table('members', function (Blueprint $table) {
            $table->renameColumn('member_number', 'no_induk_anggota');
            $table->renameColumn('name', 'nama_lengkap');
            $table->renameColumn('phone', 'no_whatsapp');
            $table->renameColumn('address', 'alamat_domisili');
            $table->renameColumn('division', 'wilayah_cabang');
            $table->renameColumn('blood_type', 'golongan_darah');
        });

        // 1.5. Add new columns
        Schema::table('members', function (Blueprint $table) {
            $table->boolean('status_aktif')->default(true)->after('status');
            $table->string('profesi_utama', 100)->nullable()->after('wilayah_cabang');
            $table->boolean('kesiapan_mobilisasi')->default(false)->after('golongan_darah');
            $table->string('ukuran_baju', 10)->nullable()->after('kesiapan_mobilisasi');
        });

        // 2. Migrate data from ENUM `status` to boolean `status_aktif`
        DB::statement("UPDATE members SET status_aktif = (status = 'active')");

        // 3. Drop the old `status` column
        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->enum('status', ['active', 'inactive'])->default('active');
        });

        DB::statement("UPDATE members SET status = IF(status_aktif = 1, 'active', 'inactive')");

        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn(['status_aktif', 'profesi_utama', 'kesiapan_mobilisasi', 'ukuran_baju']);
        });

        Schema::table('members', function (Blueprint $table) {
            $table->renameColumn('no_induk_anggota', 'member_number');
            $table->renameColumn('nama_lengkap', 'name');
            $table->renameColumn('no_whatsapp', 'phone');
            $table->renameColumn('alamat_domisili', 'address');
            $table->renameColumn('wilayah_cabang', 'division');
            $table->renameColumn('golongan_darah', 'blood_type');
        });
    }
};
