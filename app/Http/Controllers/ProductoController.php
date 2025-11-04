<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductoController extends Controller
{
    public function index(): Response
    {
        $productos = Producto::query()
            ->withCount('cajas')
            ->withSum('cajas', 'peso')
            ->orderBy('tipo_producto')
            ->get()
            ->map(function (Producto $producto) {
                $totalPeso = (float) ($producto->cajas_sum_peso ?? 0);
                $precioKg = (float) $producto->precio_kg;

                return [
                    'id' => $producto->id,
                    'clave_producto' => $producto->clave_producto,
                    'tipo_producto' => $producto->tipo_producto,
                    'precio_kg' => number_format($precioKg, 2, '.', ''),
                    'longitud_codigo' => $producto->longitud_codigo,
                    'pos_peso' => $producto->pos_peso,
                    'libras' => (bool) $producto->libras,
                    'total_cajas' => $producto->cajas_count ?? 0,
                    'total_peso' => number_format($totalPeso, 2, '.', ''),
                    'costo_total' => number_format($totalPeso * $precioKg, 2, '.', ''),
                ];
            });

        return Inertia::render('Productos/Index', [
            'productos' => $productos,
            'flash' => session('flash'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate(Producto::rules());

        Producto::create($validated);

        return redirect()
            ->route('productos.index')
            ->with('flash', [
                'type' => 'success',
                'message' => 'Producto creado correctamente.',
            ]);
    }

    public function update(Request $request, Producto $producto)
    {
        $validated = $request->validate([
            'clave_producto' => [
                'required',
                'string',
                'max:20',
                Rule::unique('productos', 'clave_producto')->ignore($producto->id),
            ],
            'precio_kg' => 'required|decimal:2',
            'tipo_producto' => 'required|string|max:255',
            'longitud_codigo' => 'required|integer|min:1',
            'pos_peso' => 'required|integer|min:0|max:65535',
            'libras' => 'required|boolean',
        ]);

        $producto->update($validated);

        return redirect()
            ->route('productos.index')
            ->with('flash', [
                'type' => 'success',
                'message' => 'Producto actualizado correctamente.',
            ]);
    }

    public function destroy(Producto $producto)
    {
        $producto->delete();

        return redirect()
            ->route('productos.index')
            ->with('flash', [
                'type' => 'success',
                'message' => 'Producto eliminado correctamente.',
            ]);
    }
}
