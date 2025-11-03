<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CajaController;
use App\Http\Controllers\InventarioController;



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

Route::get('/ventas', function () {
    return Inertia::render('Ventas/Index');
})->middleware(['auth', 'verified'])->name('ventas.index');

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
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';





