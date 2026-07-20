<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('logistics_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('logistics_item_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['masuk', 'keluar'])->default('masuk');
            $table->integer('quantity');
            $table->date('date');
            $table->string('source')->nullable();
            $table->string('destination')->nullable();
            $table->string('donor_name')->nullable();
            $table->foreignId('beneficiary_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('program_id')->nullable()->constrained()->nullOnDelete();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logistics_transactions');
    }
};
