import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { toast } from 'sonner';
import { useState, useRef, useEffect } from 'react';
import { route } from 'ziggy-js';


interface Caja {
  id: number;
  inventario_id: number;
  tipo_producto: string;
  peso: number;
  fecha_empaque: string;
}

interface ShowProps {
  inventarioId: number;
  nombre: string;
  descripcion: string;
  cajas: Caja[];
  resumen: {
    total_cajas: number;
    total_peso: number;
  };
}

export default function Show({
    inventarioId,
    nombre,
    descripcion,
    cajas: cajasIniciales,
    resumen: resumenInicial,
    flash,
}: ShowProps) {
  const [codigo, setCodigo] = useState('');
  const [cajas, setCajas] = useState<Caja[]>(cajasIniciales);
  const [resumen, setResumen] = useState(resumenInicial);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    // Mostrar mensaje de éxito si viene de crear inventario
    // Mostrar mensaje flash si existe
    if (flash) {
      if (flash.type === 'success') {
        toast.success(`✅ ${flash.message}`);
      } else if (flash.type === 'error') {
        toast.error(`❌ ${flash.message}`);
      }
    }

  }, [flash]);

  const resetInput = () => {
    setCodigo('');
    inputRef.current?.focus();
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();

    const c = codigo.trim();
    if (c.length < 10) {
      toast.error('❌ Código demasiado corto o incompleto');
        resetInput();
      return;
    }

    try {
        const csrf =
        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        const res = await fetch(route('cajas.store', { inventario: inventarioId }), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrf,
            'Accept': 'application/json',
          },
        body: JSON.stringify({ codigo_barras: c }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(`❌ ${data.mensaje}`);
          resetInput();
        return;
      }

      setCajas([...cajas, data.caja]);
      setResumen(data.resumen);

      toast.success(`✅ Caja registrada: ${data.caja.tipoProducto} | ${data.caja.pesoKg} KG`);
      resetInput();

    } catch (error: any) {
        console.error(error); // ver el error en consola
        toast.error('❌ Error de conexión con el servidor');
        resetInput()
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar esta caja?')) return;

    try {
      const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      const res = await fetch(route('cajas.destroy', { inventario: inventarioId, caja: id }), {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': csrf,
          'Accept': 'application/json',
        },
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(`❌ ${data.mensaje}`);
        resetInput();
        return;
      }

      setCajas(cajas.filter(c => c.id !== id));
      setResumen(data.resumen);
      toast.success('✅ Caja eliminada');
      resetInput();
    } catch (error: any) {
        console.error(error);
        toast.error('❌ Error al eliminar la caja');
        resetInput();
    }
  };

  return (
    <AppLayout>
      <Head title="Inventario" />

      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">{nombre} : {inventarioId}</h1>

        <div className="text-sm text-gray-600">
          <p>{descripcion}</p>
          <p>Total de cajas: {resumen.total_cajas}</p>
          <p>Total peso: {resumen.total_peso} KG</p>
        </div>

        <form onSubmit={handleScan} className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Escanea código de barras"
            className="flex-1 border px-2 py-1 rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Registrar
          </button>
        </form>
        <a
            href={route('inventarios.exportPdf', { inventario: inventarioId })}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-green-600 text-white rounded"
            >
            📄 Exportar a PDF
        </a>
        {cajas.length > 0 && (
            <div className="mt-6 overflow-x-auto">
            <h2 className="font-semibold mb-2">Cajas registradas</h2>
            <table className="w-full text-left border min-w-[600px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">#</th>
                  <th className="p-2 border">Producto</th>
                  <th className="p-2 border">Peso KG</th>
                  <th className="p-2 border">Fecha Empaque</th>
                  <th className="p-2 border">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cajas.map((caja, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border">{idx + 1}</td>
                    <td className="p-2 border">{caja.tipo_producto}</td>
                    <td className="p-2 border">{caja.peso}</td>
                    <td className="p-2 border">{caja.fecha_empaque}</td>
                    <td className="p-2 border text-center">
                      <button
                        onClick={() => handleDelete(caja.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
