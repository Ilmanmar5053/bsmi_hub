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
        Schema::table('volunteers', function (Blueprint $table) {
            $table->string('gender')->nullable()->after('name');
            $table->string('golongan_darah', 5)->nullable()->after('birth_date');
            $table->string('regional_cabang')->nullable()->after('address');
            $table->string('pendidikan_terakhir')->nullable()->after('id_card_path');
            $table->string('jurusan')->nullable()->after('pendidikan_terakhir');
            $table->string('status_keluarga')->nullable()->after('jurusan');
            $table->string('agama')->nullable()->after('status_keluarga');
            $table->string('jumlah_tanggungan')->nullable()->after('agama');
            $table->string('emergency_contact')->nullable()->after('phone');
            $table->string('emergency_phone', 20)->nullable()->after('emergency_contact');
            $table->boolean('kesiapan_mobilisasi')->default(false)->after('golongan_darah');
            $table->string('ukuran_baju', 10)->nullable()->after('kesiapan_mobilisasi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('volunteers', function (Blueprint $table) {
            $table->dropColumn([
                'gender',
                'golongan_darah',
                'regional_cabang',
                'pendidikan_terakhir',
                'jurusan',
                'status_keluarga',
                'agama',
                'jumlah_tanggungan',
                'emergency_contact',
                'emergency_phone',
                'kesiapan_mobilisasi',
                'ukuran_baju',
            ]);
        });
    }
};
