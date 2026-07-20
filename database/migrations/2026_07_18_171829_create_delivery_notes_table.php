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
        Schema::create('delivery_notes', function (Blueprint $table) {
            $table->id();
            $table->string('document_number')->unique();
            $table->date('date');
            $table->string('destination');
            $table->string('vehicle_plate')->nullable();
            $table->string('driver_name')->nullable();
            $table->string('warehouse_pic')->nullable();
            $table->string('equipment_pic')->nullable();
            $table->string('coordinator_pic')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_notes');
    }
};
