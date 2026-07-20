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
        Schema::create('diklatsar_modules', function (Blueprint $table) {
            $table->id();
            $table->tinyInteger('stage_number')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('schedule')->nullable();
            $table->string('speaker')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diklatsar_modules');
    }
};
