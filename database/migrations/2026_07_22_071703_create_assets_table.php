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
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('nama_barang');
            $table->string('kategori_barang');
            $table->string('tipe_model')->nullable();
            $table->string('nomor_sku_serial')->nullable();
            $table->date('tanggal_pembelian')->nullable();
            $table->string('kepemilikan')->nullable();
            $table->foreignId('pic_id')->nullable()->constrained('members')->nullOnDelete();
            $table->string('foto_aset')->nullable();
            $table->string('lokasi')->nullable();
            $table->date('tanggal_stock_opname')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
