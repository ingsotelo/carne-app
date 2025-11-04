<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Producto extends Model
{
    use HasFactory;

    protected $fillable = [
        'clave_producto',
        'tipo_producto',
        'precio_kg',
        'longitud_codigo',
        'pos_peso',
        'libras',
    ];

    protected $casts = [
        'precio_kg' => 'decimal:2',
        'longitud_codigo' => 'integer',
        'pos_peso' => 'integer',
        'libras' => 'boolean',
    ];

    public static function rules(): array
    {
        return [
            'clave_producto' => 'required|string|max:20|unique:productos,clave_producto',
            'precio_kg' => 'required|decimal:2',
            'tipo_producto' => 'required|string|max:255',
            'longitud_codigo' => 'required|integer|min:1',
            'pos_peso' => 'required|integer|min:0|max:65535',
            'libras' => 'required|boolean',
        ];
    }

    public function cajas(): HasMany
    {
        return $this->hasMany(Caja::class, 'tipo_producto', 'tipo_producto');
    }
}
