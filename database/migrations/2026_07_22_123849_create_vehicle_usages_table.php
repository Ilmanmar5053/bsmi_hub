<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_usages', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal_pengajuan');
            $table->string('nama_pengaju');
            $table->foreignId('asset_id')->constrained('assets')->onDelete('cascade');
            $table->string('pic_pemakai');
            $table->string('no_telp', 20);
            $table->text('alasan_keperluan');
            $table->string('tujuan');
            $table->dateTime('tanggal_mulai');
            $table->integer('km_awal');
            $table->dateTime('tanggal_selesai')->nullable();
            $table->integer('km_akhir')->nullable();
            $table->string('ktp_path')->nullable();
            $table->string('status')->default('Diajukan'); // Diajukan, Disetujui, Sedang Dipakai, Selesai, Ditolak
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_usages');
    }
};
