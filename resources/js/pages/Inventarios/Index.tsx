import { Head, Link } from '@inertiajs/react';
import { CheckCircle, Eye, Package, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

import AppLayout from '@/layouts/app-layout';

interface Inventario {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  total_cajas: number;
  total_peso: string;
  created_at: string;
}

interface FlashMessage {
  type: 'success' | 'error';
  message: string;
}

interface IndexProps {
  inventarios: Inventario[];
  flash?: FlashMessage;
}

export default function Index({ inventarios, flash }: IndexProps) {
  useEffect(() => {
    if (!flash) {
      return;
    }

    if (flash.type === 'success') {
      toast.success(flash.message);
    } else if (flash.type === 'error') {
      toast.error(flash.message);
    }
  }, [flash]);

  const handleTerminar = async (id: number, nombre: string) => {
    if (!confirm(`Seguro que deseas TERMINAR el inventario "${nombre}"? Se marcara como inactivo y no podra agregar mas cajas.`)) {
      return;
    }

    try {
      const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      const res = await fetch(route('inventarios.terminar', { inventario: id }), {
        method: 'PATCH',
        headers: {
          'X-CSRF-TOKEN': csrf,
          Accept: 'application/json',
        },
      });

      if (res.ok) {
        toast.success('Inventario terminado exitosamente');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error('Error al terminar el inventario');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error de conexion');
    }
  };

  const handleReactivar = async (id: number, nombre: string) => {
    if (!confirm(`Seguro que deseas REACTIVAR el inventario "${nombre}"?`)) {
      return;
    }

    try {
      const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      const res = await fetch(route('inventarios.reactivar', { inventario: id }), {
        method: 'PATCH',
        headers: {
          'X-CSRF-TOKEN': csrf,
          Accept: 'application/json',
        },
      });

      if (res.ok) {
        toast.success('Inventario reactivado exitosamente');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error('Error al reactivar el inventario');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error de conexion');
    }
  };

  const handleEliminar = async (id: number, nombre: string, totalCajas: number) => {
    if (
      !confirm(
        `Seguro que deseas ELIMINAR COMPLETAMENTE el inventario "${nombre}"? Se eliminara junto con sus ${totalCajas} caja(s) registradas. Esta accion no se puede deshacer.`,
      )
    ) {
      return;
    }

    try {
      const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      const res = await fetch(route('inventarios.destroy', { inventario: id }), {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': csrf,
          Accept: 'application/json',
        },
      });

      if (res.ok) {
        toast.success('Inventario eliminado exitosamente');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error('Error al eliminar el inventario');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error de conexion');
    }
  };

  return (
    <AppLayout>
      <Head title="Inventarios" />

      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Inventarios</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">Gestiona los inventarios de cajas de carne</p>
          </div>
          <Link
            href="/inventarios/create"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Inventario
          </Link>
        </div>

        {inventarios.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No hay inventarios</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Crea tu primer inventario para comenzar.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Descripcion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Total Cajas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Total Peso (KG)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Fecha Creacion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {inventarios.map((inventario) => (
                    <tr key={inventario.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                        #{inventario.id}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{inventario.nombre}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs truncate text-sm text-gray-600 dark:text-gray-300">
                          {inventario.descripcion}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <Package className="mr-1 h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {inventario.total_cajas}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-sm text-gray-900 dark:text-gray-100">
                        {inventario.total_peso}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {inventario.created_at}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/inventarios/${inventario.id}`}
                            className="inline-flex items-center rounded px-2 py-1 text-xs font-medium text-white transition-colors bg-blue-600 hover:bg-blue-700"
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            Ver
                          </Link>

                          {inventario.activo ? (
                            <button
                              onClick={() => handleTerminar(inventario.id, inventario.nombre)}
                              className="inline-flex items-center rounded bg-yellow-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-yellow-700"
                              title="Terminar inventario"
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Terminar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivar(inventario.id, inventario.nombre)}
                              className="inline-flex items-center rounded bg-green-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-green-700"
                              title="Reactivar inventario"
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Reactivar
                            </button>
                          )}

                          <button
                            onClick={() =>
                              handleEliminar(inventario.id, inventario.nombre, inventario.total_cajas)
                            }
                            className="inline-flex items-center rounded bg-red-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-red-700"
                            title="Eliminar inventario completamente"
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {inventarios.length > 0 && (
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Resumen:</strong> {inventarios.length} inventario(s) activo(s) -{' '}
              {inventarios.reduce((total, inv) => total + inv.total_cajas, 0)} cajas totales -{' '}
              {inventarios.reduce((total, inv) => total + parseFloat(inv.total_peso), 0).toFixed(2)} KG totales
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
