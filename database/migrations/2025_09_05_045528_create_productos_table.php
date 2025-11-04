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
        Schema::create('productos', function (Blueprint $table) {
            $table->id();
            $table->string('clave_producto', 20)->unique();
            $table->string('tipo_producto', 255);
            $table->decimal('precio_kg', 8, 2);
            $table->unsignedSmallInteger('pos_peso');
            $table->boolean('libras')->default(false);
            $table->unsignedSmallInteger('longitud_codigo');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};
