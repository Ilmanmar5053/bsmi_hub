<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('beneficiaries', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('category', ['sembako', 'medis', 'pendidikan', 'bencana', 'ekonomi', 'lainnya'])->default('lainnya');
            $table->text('address')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('nik', 16)->nullable();
            $table->integer('family_members')->default(1);
            $table->text('description')->nullable();
            $table->decimal('total_received', 15, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('beneficiaries');
    }
};
