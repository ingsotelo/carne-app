<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventario extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'descripcion',
        'activo',
    ];

    /**
     * Casts automáticos
     */
    protected $casts = [
        'activo' => 'boolean',
    ];

    /**
     * Validaciones automáticas
     */
    public static function rules()
    {
        return [
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string|max:1000',
            'activo' => 'boolean',
        ];
    }

    /**
     * Relación con cajas
     */
    public function cajas()
    {
        return $this->hasMany(Caja::class);
    }

    /**
     * Scope para obtener inventarios activos
     */
    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }
}
