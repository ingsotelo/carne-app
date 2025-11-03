<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    use HasFactory;

    protected $fillable = [
        'clave_producto',
        'nombre',
        'descripcion',
        'precio_kg',
        'codigo_barras',
    ];


    public static function rules()
    {
        return [
            'clave_producto' => 'required|string|max:20|unique:productos,clave_producto',
            'precio_kg' => 'required|decimal:2',
            'codigo_barras' => 'nullable|string|max:20|unique:productos,codigo_barras',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string|max:1000',
        ];
    }


}
