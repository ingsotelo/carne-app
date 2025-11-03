import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { FormEventHandler } from 'react';

interface FormData {
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export default function Create() {
  const { data, setData, post, processing, errors, reset } = useForm<FormData>({
    nombre: '',
    descripcion: '',
    activo: true,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post('/inventarios');
  };

  return (
    <AppLayout>
      <Head title="Crear Inventario" />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/inventarios"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Volver a Inventarios
            </Link>
          </div>
        </div>

        <div className="max-w-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Crear Nuevo Inventario
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Completa la información para crear un nuevo inventario de cajas
              </p>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={submit} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4">
              {/* Nombre */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Inventario *
                </label>
                <input
                  id="nombre"
                  type="text"
                  value={data.nombre}
                  onChange={(e) => setData('nombre', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                    errors.nombre ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Ej: Inventario Febrero 2025"
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.nombre}
                  </p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  rows={3}
                  value={data.descripcion}
                  onChange={(e) => setData('descripcion', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                    errors.descripcion ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Descripción opcional del inventario..."
                />
                {errors.descripcion && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.descripcion}
                  </p>
                )}
              </div>

              {/* Estado Activo */}
              <div>
                <div className="flex items-center">
                  <input
                    id="activo"
                    type="checkbox"
                    checked={data.activo}
                    onChange={(e) => setData('activo', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                  />
                  <label htmlFor="activo" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                    Inventario activo
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Los inventarios inactivos no aparecerán en la lista principal
                </p>
              </div>

              {/* Mensaje de error general */}
              {errors.error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.error}
                  </p>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex items-center justify-end space-x-3">
              <Link
                href="/inventarios"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={processing}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Inventario
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
