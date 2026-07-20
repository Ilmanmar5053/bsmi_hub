<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dues_periods', function (Blueprint $table) {
            $table->id();
            $table->tinyInteger('month');
            $table->year('year');
            $table->decimal('amount', 15, 2);
            $table->date('due_date');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['month', 'year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dues_periods');
    }
};
