<?php

namespace Tests\Unit;

use App\Models\Producto;
use App\Services\CodigoBarrasService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CodigoBarrasServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_parse_resuelve_productos_de_32_caracteres_por_prefijo(): void
    {
        $productos = [
            ['tipo_producto' => 'ENTRECOT S/F GRANJERO', 'clave_producto' => '007792'],
            ['tipo_producto' => 'COSTILLA MEAT GRANJERO AV', 'clave_producto' => '008640'],
            ['tipo_producto' => 'CUERO GRANJERO C/G Y C/C', 'clave_producto' => '021236'],
        ];

        foreach ($productos as $producto) {
            Producto::create([
                ...$producto,
                'precio_kg' => 100,
                'longitud_codigo' => 32,
                'pos_peso' => 15,
                'longitud_peso' => 6,
                'libras' => false,
            ]);
        }

        $service = new CodigoBarrasService();

        $casos = [
            '00779226426114A00336728042610016' => 'ENTRECOT S/F GRANJERO',
            '00864030426132A00179802052610037' => 'COSTILLA MEAT GRANJERO AV',
            '021236010526AA300276501052610077' => 'CUERO GRANJERO C/G Y C/C',
        ];

        foreach ($casos as $codigo => $tipoProducto) {
            $parsed = $service->parse($codigo);

            $this->assertFalse($parsed['error']);
            $this->assertSame($tipoProducto, $parsed['producto']);
        }
    }

    public function test_parse_resuelve_grasa_bachoco_en_codigos_de_54_caracteres(): void
    {
        Producto::create([
            'tipo_producto' => 'GRASA BACHOCO',
            'clave_producto' => '1204010',
            'precio_kg' => 100,
            'longitud_codigo' => 54,
            'pos_peso' => 25,
            'longitud_peso' => 6,
            'libras' => false,
        ]);

        $service = new CodigoBarrasService();

        $codigos = [
            '260415050111101120120401000314028041310670112470069227',
            '260415050072301120120401000307028041310670110330067684',
            '260415050004901120120401000308028041310670104510067900',
            '260415050111701120120401000310028041310670112510068342',
        ];

        foreach ($codigos as $codigo) {
            $parsed = $service->parse($codigo);

            $this->assertFalse($parsed['error']);
            $this->assertSame('GRASA BACHOCO', $parsed['producto']);
        }
    }

    public function test_parse_resuelve_productos_de_41_caracteres_por_prefijo(): void
    {
        $productos = [
            ['tipo_producto' => 'FORRO PIERNA DE CERDO, CONGELADO', 'clave_producto' => '05020106005010702170'],
            ['tipo_producto' => 'FORRO PALETA DE CERDO, CONGELADO', 'clave_producto' => '01020108113200659120'],
        ];

        foreach ($productos as $producto) {
            Producto::create([
                ...$producto,
                'precio_kg' => 100,
                'longitud_codigo' => 41,
                'pos_peso' => 32,
                'longitud_peso' => 4,
                'libras' => false,
            ]);
        }

        $service = new CodigoBarrasService();

        $casos = [
            '05020106005010702170200108042026238420891' => ['FORRO PIERNA DE CERDO, CONGELADO', 23.84],
            '05020106005010702170200108042026240423047' => ['FORRO PIERNA DE CERDO, CONGELADO', 24.04],
            '01020108113200659120200125022026235922308' => ['FORRO PALETA DE CERDO, CONGELADO', 23.59],
            '01020108113200659120200126022026228525087' => ['FORRO PALETA DE CERDO, CONGELADO', 22.85],
        ];

        foreach ($casos as $codigo => [$tipoProducto, $pesoKg]) {
            $parsed = $service->parse($codigo);

            $this->assertFalse($parsed['error']);
            $this->assertSame($tipoProducto, $parsed['producto']);
            $this->assertSame($pesoKg, $parsed['peso_kg']);
        }
    }
}
