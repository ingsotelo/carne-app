<?php

namespace App\Services;

use App\Models\Producto;
use Carbon\Carbon;

class CodigoBarrasService
{
    public function parse(string $codigo): array
    {
        try {
            // Limpia el valor entrante
            $codigo = trim($codigo);
            $codigo = preg_replace('/\s/', '0', $codigo);

            if ($codigo === '') {
                return [
                    'error' => true,
                    'codigo_error' => 'codigo_vacio',
                    'mensaje' => 'El codigo de barras viene vacio.',
                ];
            }

            $longitud = strlen($codigo);
            $producto = Producto::where('longitud_codigo', $longitud)->first();

            if (!$producto) {
                return [
                    'error' => true,
                    'codigo_error' => 'producto_no_configurado',
                    'mensaje' => "No hay producto configurado para un codigo de {$longitud} caracteres.",
                ];
            }

            $pos = $producto->pos_peso;
            $longitudPeso = (int) ($producto->longitud_peso ?? 6);

            if ($longitudPeso <= 0) {
                $longitudPeso = 6;
            }

            // Asegura que podamos extraer el peso dentro del rango del codigo
            if ($pos < 0 || ($pos + $longitudPeso) > $longitud) {
                return [
                    'error' => true,
                    'codigo_error' => 'posicion_fuera_de_rango',
                    'mensaje' => "La posicion de peso ({$pos}) y longitud ({$longitudPeso}) no son validas para un codigo de {$longitud} caracteres.",
                ];
            }

            if ($producto->libras) {
                $pesoRaw = substr($codigo, $pos, $longitudPeso);
                $pesoLb = (int) $pesoRaw / 10;
                $pesoKg = $pesoLb * 0.45359237;
                $pesoKg = floor($pesoKg * 100) / 100;
            } else {
                $pesoRaw = substr($codigo, $pos, $longitudPeso);
                $pesoKg = (int) $pesoRaw / 100;
            }

            return [
                'error' => false,
                'producto' => $producto->tipo_producto,
                'producto_id' => $producto->id,
                'clave_producto' => $producto->clave_producto,
                'precio_kg' => (float) $producto->precio_kg,
                'peso_kg' => round($pesoKg, 2),
                'fecha_empaque' => Carbon::now('America/Mexico_City')->format('Y-m-d'),
            ];
        } catch (\Throwable $e) {
            return [
                'error' => true,
                'codigo_error' => 'excepcion',
                'mensaje' => 'Error al interpretar el codigo de barras.',
                'detalle' => $e->getMessage(),
            ];
        }
    }
}
