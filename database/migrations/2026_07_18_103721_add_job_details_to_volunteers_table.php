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
        Schema::table('volunteers', function (Blueprint $table) {
            $table->string('job_category')->nullable()->after('motivation');
            $table->string('job_type')->nullable()->after('job_category');
            $table->string('id_card_path')->nullable()->after('job_type');
            $table->dropColumn('occupation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('volunteers', function (Blueprint $table) {
            $table->dropColumn(['job_category', 'job_type', 'id_card_path']);
            $table->string('occupation')->nullable()->after('motivation');
        });
    }
};
