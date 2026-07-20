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
        Schema::table('members', function (Blueprint $table) {
            $table->string('regional_cabang')->nullable()->after('bagian_divisi');
            $table->string('pendidikan_terakhir')->nullable()->after('profesi_utama');
            $table->string('jurusan')->nullable()->after('pendidikan_terakhir');
            $table->string('status_keluarga')->nullable()->after('jurusan');
            $table->string('agama')->nullable()->after('status_keluarga');
            $table->string('jumlah_tanggungan')->nullable()->after('agama');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn([
                'regional_cabang',
                'pendidikan_terakhir',
                'jurusan',
                'status_keluarga',
                'agama',
                'jumlah_tanggungan',
            ]);
        });
    }
};
