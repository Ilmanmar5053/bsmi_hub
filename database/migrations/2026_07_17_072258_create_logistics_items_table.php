<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('logistics_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('category', ['makanan', 'pakaian', 'obat', 'peralatan', 'lainnya'])->default('lainnya');
            $table->integer('quantity')->default(0);
            $table->string('unit', 20)->default('pcs');
            $table->enum('condition', ['baik', 'rusak_ringan', 'rusak_berat'])->default('baik');
            $table->string('location')->nullable();
            $table->date('expiry_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logistics_items');
    }
};
