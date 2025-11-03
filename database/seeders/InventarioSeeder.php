<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Inventario;
use App\Models\Caja;
use Carbon\Carbon;

class InventarioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear un inventario activo
        $inventario = Inventario::create([
            'nombre' => 'Inventario Inicial',
            'descripcion' => 'Inventario de prueba para desarrollo',
            'activo' => true,
        ]);

    }
}
