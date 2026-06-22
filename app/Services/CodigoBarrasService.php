<?php

namespace App\Services;

use App\Models\Producto;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class CodigoBarrasService
{
    private const CODIGOS_54_POR_PRODUCTO = [
        'RECORTE COMERCIAL CONG.' => ['2106125'],
        'RECORTE 80/20' => ['1255519', '2106561'],
        'PIERNA SIN HUESO CONG.' => ['2101030'],
        'GRASA BACHOCO' => ['1204010'],
        'TRIPA EMBUTIDO COMPLETA' => ['1357073'],
        'PIERNA S/HUESO A GRANEL CONG' => ['2101500'],
    ];

    private const CODIGOS_32_POR_PRODUCTO = [
        'ENTRECOT S/F GRANJERO' => ['007792'],
        'COSTILLA MEAT GRANJERO AV' => ['008640', '008630'],
        'CUERO GRANJERO C/G Y C/C' => ['021236', '021237'],
    ];

    private const CODIGOS_41_POR_PRODUCTO = [
        'FORRO PIERNA DE CERDO, CONGELADO' => ['05020106005010702170'],
        'FORRO PALETA DE CERDO, CONGELADO' => ['01020108113200659120'],
    ];

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
            $productos = Producto::where('longitud_codigo', $longitud)->get();

            if ($productos->isEmpty()) {
                return $this->buildProductoNoConfiguradoResponse($longitud);
            }

            $producto = $this->resolveProductoPorCodigo($productos, $codigo, $longitud);

            if (!$producto) {
                if ($this->usaPatronIdentificador($longitud)) {
                    $segmento = $this->getSegmentoIdentificador($codigo, $longitud);
                    $tipoEsperado = $this->getTipoProductoPorPatron($longitud, $segmento);

                    if ($tipoEsperado) {
                        return [
                            'error' => true,
                            'codigo_error' => 'producto_faltante_en_bd',
                            'mensaje' => "El patron {$segmento} corresponde a {$tipoEsperado}, pero ese producto no esta registrado en la base de datos con longitud {$longitud}.",
                            'longitud_recibida' => $longitud,
                            'segmento_identificador' => $segmento,
                            'tipo_producto_esperado' => $tipoEsperado,
                        ];
                    }

                    return [
                        'error' => true,
                        'codigo_error' => 'producto_no_identificado',
                        'mensaje' => "No hay producto configurado para el patron {$segmento} en codigos de {$longitud} caracteres.",
                        'longitud_recibida' => $longitud,
                        'segmento_identificador' => $segmento,
                    ];
                }

                return $this->buildProductoNoConfiguradoResponse($longitud);
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

    private function buildProductoNoConfiguradoResponse(int $longitud): array
    {
        $longitudesConfiguradas = Producto::query()
            ->select('longitud_codigo')
            ->distinct()
            ->orderBy('longitud_codigo')
            ->pluck('longitud_codigo')
            ->map(fn ($value) => (string) $value)
            ->values();

        $sugerencia = $longitudesConfiguradas->isNotEmpty()
            ? ' Longitudes configuradas: ' . $longitudesConfiguradas->implode(', ') . '.'
            : '';

        return [
            'error' => true,
            'codigo_error' => 'producto_no_configurado',
            'mensaje' => "No hay producto configurado para un codigo de {$longitud} caracteres." . $sugerencia,
            'longitud_recibida' => $longitud,
            'longitudes_configuradas' => $longitudesConfiguradas->all(),
        ];
    }

    private function resolveProductoPorCodigo(Collection $productos, string $codigo, int $longitud): ?Producto
    {
        if (!$this->usaPatronIdentificador($longitud)) {
            return $productos->first();
        }

        $segmento = $this->getSegmentoIdentificador($codigo, $longitud);
        $tipoEsperado = $this->getTipoProductoPorPatron($longitud, $segmento);

        if (!$tipoEsperado) {
            return null;
        }

        return $productos->first(function (Producto $producto) use ($tipoEsperado) {
            return $this->normalizeTipoProducto($producto->tipo_producto) === $this->normalizeTipoProducto($tipoEsperado);
        });
    }

    private function usaPatronIdentificador(int $longitud): bool
    {
        return in_array($longitud, [32, 41, 54], true);
    }

    private function getSegmentoIdentificador(string $codigo, int $longitud): string
    {
        if ($longitud === 32) {
            return substr($codigo, 0, 6);
        }

        if ($longitud === 41) {
            return substr($codigo, 0, 20);
        }

        return substr($codigo, 18, 7);
    }

    private function getTipoProductoPorPatron(int $longitud, string $segmento): ?string
    {
        foreach ($this->getPatronesPorLongitud($longitud) as $tipoProducto => $patrones) {
            if (in_array($segmento, $patrones, true)) {
                return $tipoProducto;
            }
        }

        return null;
    }

    private function getPatronesPorLongitud(int $longitud): array
    {
        return match ($longitud) {
            32 => self::CODIGOS_32_POR_PRODUCTO,
            41 => self::CODIGOS_41_POR_PRODUCTO,
            54 => self::CODIGOS_54_POR_PRODUCTO,
            default => [],
        };
    }

    private function normalizeTipoProducto(string $tipoProducto): string
    {
        $tipoProducto = strtoupper(trim($tipoProducto));
        $tipoProducto = preg_replace('/[^\p{L}\p{N}\/]+/u', ' ', $tipoProducto);
        $tipoProducto = preg_replace('/\s+/', ' ', $tipoProducto) ?? $tipoProducto;

        return trim($tipoProducto);
    }
}
