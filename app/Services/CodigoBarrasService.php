<?php

namespace App\Services;

use App\Models\Producto;

use Carbon\Carbon;


class CodigoBarrasService
{
    public function parse(string $codigo): array
    {
        try {

            $longitud = strlen($codigo);
            $producto = Producto::where('longitud_codigo', $longitud)->first();

            if (!$producto) {
                return [
                        "error" => true,
                        "mensaje" => "Código demasiado corto o incompleto: " . strlen($codigo),
                    ];
            }

            $pos = $producto->pos_peso;

            if ($producto->libras) {
                $librasRaw = substr($codigo, $pos, 6);
                $pesoLb = (int)$librasRaw / 10;
                $pesoKg = $pesoLb * 0.45359237;
                $pesoKg = floor($pesoKg * 100) / 100;
            } else {
                $kilosRaw = substr($codigo, $pos, 6);
                $pesoKg = (int)$kilosRaw / 100;
            }

            return [
                    "error" => false,
                    "producto" => $producto->tipo_producto,
                    "producto_id" => $producto->id,
                    "clave_producto" => $producto->clave_producto,
                    "precio_kg" => (float) $producto->precio_kg,
                    "peso_kg" => round($pesoKg, 2),
                    "fecha_empaque" => Carbon::now('America/Mexico_City')->format('Y-m-d'),
                ];

            /*
            if (strlen($codigo) == 70) {
                $pos = 0;
                // Código de producto
                $codigoProducto = substr($codigo, $pos, 8);
                $pos += 8;
                // Lote
                $lote = substr($codigo, $pos, 7);
                $pos += 7;
                // Separador
                $pos += 1;
                // Fecha de producción YYMMDD
                $fechaProduccionRaw = substr($codigo, $pos, 6);
                $anioProd = "20" . substr($fechaProduccionRaw, 0, 2);
                $mesProd = substr($fechaProduccionRaw, 2, 2);
                $diaProd = substr($fechaProduccionRaw, 4, 2);
                $pos += 6;
                // Código 3 ignorado
                $pos += 3;
                // SEQ
                $seq = substr($codigo, $pos, 4);
                $pos += 4;
                // Otro código ignorado
                $pos += 4;
                // Repite código producto
                $pos += 8;
                // Kilos
                $kilosRaw = substr($codigo, $pos, 6);
                $pesoKg = (int)$kilosRaw / 100;
                $pos += 6;
                // Fecha caducidad YYMMDD
                $fechaCadRaw = substr($codigo, $pos, 6);
                $anioCad = "20" . substr($fechaCadRaw, 0, 2);
                $mesCad = substr($fechaCadRaw, 2, 2);
                $diaCad = substr($fechaCadRaw, 4, 2);
                $fechaCaducidad = Carbon::createFromFormat('d/m/Y', "$diaCad/$mesCad/$anioCad");
                $pos += 6;
                // Código 2 ignorado
                $pos += 2;
                // Otro código ignorado
                $pos += 4;
                // Hora producción HHMM
                $horaRaw = substr($codigo, $pos, 4);
                $hora = substr($horaRaw, 0, 2);
                $minuto = substr($horaRaw, 2, 2);
                $fechaEmpaque = Carbon::createFromFormat('d/m/Y', "$diaProd/$mesProd/$anioProd");
                $pos += 4;
                // Libras
                $librasRaw = substr($codigo, $pos, 6);
                $pesoLb = (int)$librasRaw / 100;

                return [
                    "error" => false,
                    "producto" => "RECORTE COMERCIAL CONG.",
                    "peso_kg" => round($pesoKg, 2),
                    "fecha_empaque" => $fechaEmpaque->format('Y-m-d'),
                ];
            }
            if (strlen($codigo) == 48) {
                $pos = 0;
                $codigoProducto= substr($codigo, $pos, 20);
                $pos += 20;
                $librasRaw = substr($codigo, $pos, 6);
                $pesoLb = (int)$librasRaw / 10;
                $pesoKg = $pesoLb * 0.45359237;
                $pesoKg = floor($pesoKg * 100) / 100;
                $pos += 6;
                // Separador
                $pos += 2;
                // Fecha de producción YYMMDD
                $fechaProduccionRaw = substr($codigo, $pos, 6);
                $anioProd = "20" . substr($fechaProduccionRaw, 0, 2);
                $mesProd = substr($fechaProduccionRaw, 2, 2);
                $diaProd = substr($fechaProduccionRaw, 4, 2);
                $fechaEmpaque = Carbon::createFromFormat('d/m/Y', "$diaProd/$mesProd/$anioProd");
                $pos += 6;
                // Código ignorado

                return [
                    "error" => false,
                    "producto" => "RECORTE DE CERDO (PORK HAM TRIM SPECIAL)",
                    "peso_kg" => $pesoKg,
                    "fecha_empaque" => $fechaEmpaque->format('Y-m-d'),
                ];
            }
            if(strlen($codigo) == 140) {
                $pos = 0;
                $codigoProducto= substr($codigo, $pos, 20);
                $pos += 20;

                $kilosRaw = substr($codigo, $pos, 6);
                $pesoKg = (int)$kilosRaw / 100;
                $pos += 6;

                // Separador
                $pos += 24;
                // Fecha de producción YYMMDD
                $fechaProduccionRaw = substr($codigo, $pos, 6);
                $anioProd = "20" . substr($fechaProduccionRaw, 0, 2);
                $mesProd = substr($fechaProduccionRaw, 2, 2);
                $diaProd = substr($fechaProduccionRaw, 4, 2);
                $fechaEmpaque = Carbon::createFromFormat('d/m/Y', "$diaProd/$mesProd/$anioProd");
                $pos += 6;
                // Código ignorado

                return [
                    "error" => false,
                    "producto" => "PIERNA DESHUESADA DE CERDO CONGELADA (FROZEN PORK LEG BONELESS RINDLESS)",
                    "peso_kg" => $pesoKg,
                    "fecha_empaque" => $fechaEmpaque->format('Y-m-d'),
                ];
            }
            if(strlen($codigo) == 26) {

                $pos = 0;
                $codigoProducto = substr($codigo, $pos, 8);
                $pos += 8;
                // Método 1: Usando if-else
                if ($codigoProducto == "01357073") {
                    $producto = "TRIPA EMBUTIDO COMPLETA";
                } elseif ($codigoProducto == "01255544") {
                    $producto = "RECORTE ESPECIAL S";
                } else {
                    $producto = "Producto no encontrado";
                }
                $kilosRaw = substr($codigo, $pos, 6);
                $pesoKg = (int)$kilosRaw / 100;
                $pos += 6;

                // Separador
                $pos += 6;
                // Fecha de producción YYMMDD
                $fechaProduccionRaw = substr($codigo, $pos, 6);
                $anioProd = "20" . substr($fechaProduccionRaw, 0, 2);
                $mesProd = substr($fechaProduccionRaw, 2, 2);
                $diaProd = substr($fechaProduccionRaw, 4, 2);
                $fechaEmpaque = Carbon::createFromFormat('d/m/Y', "$diaProd/$mesProd/$anioProd");
                $pos += 6;
                // Código ignorado

                return [
                    "error" => false,
                    "producto" => $producto,
                    "peso_kg" => $pesoKg,
                    "fecha_empaque" => $fechaEmpaque->format('Y-m-d'),
                ];
            }
            if(strlen($codigo) == 41) {



                $pos = 0;
                $codigoProducto= substr($codigo, $pos, 24);
                $pos += 24;

                $fechaProduccionRaw = substr($codigo, $pos, 8);
                $diaProd = substr($fechaProduccionRaw, 0, 2);
                $mesProd = substr($fechaProduccionRaw, 2, 2);
                $anioProd = substr($fechaProduccionRaw, 4, 4);
                $fechaEmpaque = Carbon::createFromFormat('d/m/Y', "$diaProd/$mesProd/$anioProd");
                $pos += 8;

                $kilosRaw = substr($codigo, $pos, 4);
                $pesoKg = (int)$kilosRaw / 100;
                $pos += 4;

                return [
                    "error" => false,
                    "producto" => "FORRO PALETA DE CERDO GORDO CONGELADA (FROZEN PORK SKIN ON FAT)",
                    "peso_kg" => $pesoKg,
                    "fecha_empaque" => $fechaEmpaque->format('Y-m-d'),
                ];
            }
            else {
                return [
                    "error" => true,
                    "mensaje" => "Código demasiado corto o incompleto: " . strlen($codigo),
                ];
            }*/

        } catch (\Exception $e) {
            return [
                "error" => true,
                "mensaje" => "Código erróneo: " . $e->getMessage(),
            ];
        }
    }
}
