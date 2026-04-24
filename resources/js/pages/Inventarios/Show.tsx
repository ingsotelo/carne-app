import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

import AppLayout from '@/layouts/app-layout';

interface Caja {
  id: number;
  inventario_id: number;
  tipo_producto: string;
  peso: number;
  fecha_empaque: string;
}

interface FlashMessage {
  type: 'success' | 'error';
  message: string;
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
  flash?: FlashMessage;
}

const getErrorMessage = (payload: unknown, fallback: string) => {
  if (!payload || typeof payload !== 'object') {
    return fallback;
  }

  const data = payload as {
    mensaje?: string;
    message?: string;
    errors?: Record<string, string | string[]>;
  };

  if (typeof data.mensaje === 'string' && data.mensaje.trim()) {
    return data.mensaje;
  }

  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message;
  }

  if (data.errors && typeof data.errors === 'object') {
    const firstError = Object.values(data.errors)
      .flat()
      .find((value) => typeof value === 'string' && value.trim());

    if (typeof firstError === 'string') {
      return firstError;
    }
  }

  return fallback;
};

export default function Show({
  inventarioId,
  nombre,
  descripcion,
  cajas: cajasIniciales,
  resumen: resumenInicial,
  flash,
}: ShowProps) {
  const [codigo, setCodigo] = useState('');
  const [cajas, setCajas] = useState<Caja[]>([...cajasIniciales].sort((a, b) => b.id - a.id));
  const [resumen, setResumen] = useState(resumenInicial);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();

    if (!flash) {
      return;
    }

    if (flash.type === 'success') {
      toast.success(flash.message);
    } else if (flash.type === 'error') {
      toast.error(flash.message);
    }
  }, [flash]);

  const resetInput = () => {
    setCodigo('');
    inputRef.current?.focus();
  };

  const handleScan = async (event: React.FormEvent) => {
    event.preventDefault();

    const codigoNormalizado = codigo.trim();

    if (codigoNormalizado.length < 10) {
      toast.error('Codigo demasiado corto o incompleto.');
      resetInput();
      return;
    }

    try {
      const csrfToken =
        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

      const response = await fetch(route('cajas.store', { inventario: inventarioId }), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          Accept: 'application/json',
        },
        body: JSON.stringify({ codigo_barras: codigoNormalizado }),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(getErrorMessage(data, 'No se pudo interpretar el codigo de barras.'));
        resetInput();
        return;
      }

      setCajas((current) => [data.caja, ...current]);
      setResumen(data.resumen);

      const producto = data.caja.tipo_producto ?? data.caja.tipoProducto ?? 'Producto';
      const peso = data.caja.peso ?? data.caja.pesoKg ?? 0;
      toast.success(`Caja registrada: ${producto} | ${peso} KG`);
      resetInput();
    } catch (error) {
      console.error(error);
      toast.error('Error de conexion con el servidor.');
      resetInput();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Seguro que deseas eliminar esta caja?')) {
      return;
    }

    try {
      const csrfToken =
        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

      const response = await fetch(route('cajas.destroy', { inventario: inventarioId, caja: id }), {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          Accept: 'application/json',
        },
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(getErrorMessage(data, 'No se pudo eliminar la caja.'));
        resetInput();
        return;
      }

      setCajas((current) => current.filter((caja) => caja.id !== id));
      setResumen(data.resumen);
      toast.success('Caja eliminada.');
      resetInput();
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar la caja.');
      resetInput();
    }
  };

  return (
    <AppLayout>
      <Head title="Inventario" />

      <div className="space-y-4 p-6">
        <h1 className="text-2xl font-bold">
          {nombre} : {inventarioId}
        </h1>

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
            onChange={(event) => setCodigo(event.target.value)}
            placeholder="Escanea codigo de barras"
            className="flex-1 rounded border px-2 py-1"
          />
          <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
            Registrar
          </button>
        </form>

        <a
          href={route('inventarios.exportPdf', { inventario: inventarioId })}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded bg-green-600 px-4 py-2 text-white"
        >
          Exportar a PDF
        </a>

        {cajas.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <h2 className="mb-2 font-semibold">Cajas registradas</h2>
            <table className="min-w-[600px] w-full border text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">#</th>
                  <th className="border p-2">Producto</th>
                  <th className="border p-2">Peso KG</th>
                  <th className="border p-2">Fecha Empaque</th>
                  <th className="border p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cajas.map((caja, idx) => {
                  const consecutivo = cajas.length - idx;

                  return (
                    <tr key={caja.id}>
                      <td className="border p-2">{consecutivo}</td>
                      <td className="border p-2">{caja.tipo_producto}</td>
                      <td className="border p-2">{caja.peso}</td>
                      <td className="border p-2">{caja.fecha_empaque}</td>
                      <td className="border p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(caja.id)}
                          className="rounded bg-red-600 px-2 py-1 text-white"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
