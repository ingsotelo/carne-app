<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CajaController;
use App\Http\Controllers\InventarioController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\VentaController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// Nueva ruta
Route::get('inventarios/prueba', [InventarioController::class, 'prueba'])
->middleware(['auth', 'verified'])->name('inventarios.prueba');

Route::middleware(['auth', 'verified'])->group(function () {
    // Ruta para listar inventarios
    Route::get('/inventarios', [InventarioController::class, 'index'])->name('inventarios.index');
    Route::get('/inventarios/create', [InventarioController::class, 'create'])->name('inventarios.create');
    Route::post('/inventarios', [InventarioController::class, 'store'])->name('inventarios.store');
    Route::resource('inventarios', InventarioController::class)->only(['show']);
    Route::patch('/inventarios/{inventario}/terminar', [InventarioController::class, 'terminar'])->name('inventarios.terminar');
    Route::delete('/inventarios/{inventario}', [InventarioController::class, 'destroy'])->name('inventarios.destroy');
    Route::patch('/inventarios/{inventario}/reactivar', [InventarioController::class, 'reactivar'])->name('inventarios.reactivar');

    Route::post('/inventarios/{inventario}/cajas', [CajaController::class, 'store'])->name('cajas.store');
    Route::delete('/inventarios/{inventario}/cajas/{caja}', [CajaController::class, 'destroy'])->name('cajas.destroy');
    Route::get('/inventarios/{inventario}/export-pdf', [InventarioController::class, 'exportPdf'])
        ->name('inventarios.exportPdf');

    Route::resource('productos', ProductoController::class)->except(['show']);

    Route::get('ventas', [VentaController::class, 'index'])->name('ventas.index');
    Route::get('ventas/registros', [VentaController::class, 'registros'])->name('ventas.registros');
    Route::post('ventas', [VentaController::class, 'store'])->name('ventas.store');
    Route::post('ventas/scan', [VentaController::class, 'scan'])->name('ventas.scan');
    Route::get('ventas/{venta}/recibo', [VentaController::class, 'recibo'])->name('ventas.recibo');
    Route::put('ventas/{venta}', [VentaController::class, 'update'])->name('ventas.update');
    Route::delete('ventas/{venta}', [VentaController::class, 'destroy'])->name('ventas.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

