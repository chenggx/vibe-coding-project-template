<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('parent_id')->nullable()->index();
            $table->string('name');
            $table->enum('type', ['catalog', 'menu', 'permission']);
            $table->string('path')->nullable();
            $table->string('icon')->nullable();
            $table->string('permission')->nullable()->unique();
            $table->integer('sort_order')->default(0);
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index('type');
            $table->foreign('parent_id')
                ->references('id')
                ->on('menus')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};
