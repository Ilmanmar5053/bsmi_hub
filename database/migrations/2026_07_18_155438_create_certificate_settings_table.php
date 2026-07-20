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
        Schema::create('certificate_settings', function (Blueprint $table) {
            $table->id();
            $table->string('certificate_number')->nullable();
            $table->string('role_text')->default('Peserta');
            $table->text('description_text')->nullable();
            $table->string('year_text')->nullable();
            $table->string('organizer')->nullable();
            $table->string('location')->nullable();
            $table->string('day_text')->nullable();
            $table->string('date_text')->nullable();
            $table->string('signature_1_name')->nullable();
            $table->string('signature_1_title')->nullable();
            $table->string('signature_2_name')->nullable();
            $table->string('signature_2_title')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificate_settings');
    }
};
