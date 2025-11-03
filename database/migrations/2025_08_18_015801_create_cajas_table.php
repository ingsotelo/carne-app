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
        Schema::create('cajas', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_barras');
            $table->string('tipo_producto');
            $table->decimal('peso', 8, 2);      // peso en KG
            $table->date('fecha_empaque');

            // Relación con inventarios
            $table->foreignId('inventario_id')
                  ->constrained('inventarios')
                  ->onDelete('cascade');

            $table->timestamps();

            // Evitar cajas duplicadas en el mismo inventario
            $table->unique(['codigo_barras', 'inventario_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cajas');
    }
};
