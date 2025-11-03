import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { toast } from 'sonner';

export default function Show() {
  return (
    <AppLayout>
      <Head title="Prueba" />

      <div className="p-4">
        <h1 className="text-xl font-bold">Vista de Prueba</h1>

        <button
          onClick={() => toast.success('Funciona Sonner 🎉')}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Probar Toast
        </button>
      </div>
    </AppLayout>
  );
}

