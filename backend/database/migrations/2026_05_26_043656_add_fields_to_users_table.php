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
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar')->nullable()->comment('头像 URL');
            $table->boolean('status')->default(true)->comment('1=启用, 0=禁用');
            $table->dateTime('expires_at')->nullable()->comment('账号有效期');
            $table->text('remarks')->nullable()->comment('备注');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
        });
    }
};
