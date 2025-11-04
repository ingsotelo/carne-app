import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

const features = [
  {
    title: 'Registro sencillo de ventas',
    description: 'Captura cajas por codigo de barras o de forma manual para generar notas claras y completas.',
  },
  {
    title: 'Control de productos',
    description: 'Administra precios, pesos y configuraciones para cada corte sin perder la trazabilidad.',
  },
  {
    title: 'Reportes al instante',
    description: 'Consulta historicos, totales vendidos y descarga recibos PDF para tus clientes.',
  },
];

export default function Welcome() {
  const { auth } = usePage<SharedData>().props;

  return (
    <>
      <Head title="Bienvenido">
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-[#faf8f5] text-[#171412] dark:bg-[#0b0a09] dark:text-[#f1efe9]">
        <header className="flex items-center justify-between px-6 py-4 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-[#c1272d] text-white dark:bg-[#e34e57]">
              <span className="text-lg font-semibold">CC</span>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide">Carne Control</p>
              <p className="text-xs text-[#615b54] dark:text-[#b7b2aa]">Gestion integral de productos carnicos</p>
            </div>
          </div>

          <nav className="flex items-center gap-3 text-sm">
            {auth.user ? (
              <Link
                href={route('dashboard')}
                className="rounded border border-[#b8afa6] px-4 py-2 font-medium text-[#171412] transition hover:bg-[#ebe3db] dark:border-[#5d574f] dark:text-[#f1efe9] dark:hover:bg-[#1c1b19]"
              >
                Ir al panel
              </Link>
            ) : (
              <Link
                href={route('login')}
                className="rounded px-4 py-2 font-medium text-[#171412] transition hover:text-[#c1272d] dark:text-[#f1efe9] dark:hover:text-[#e34e57]"
              >
                Ingresar
              </Link>
            )}
          </nav>
        </header>

        <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-16 pt-10 lg:flex-row lg:items-center lg:px-12">
          <section className="flex-1 space-y-6">
            <p className="inline-flex items-center rounded-full bg-[#f2e9e3] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#c1272d] dark:bg-[#2a1f1d] dark:text-[#ff6f7a]">
              Plataforma para rastreo y ventas de carne
            </p>
            <h1 className="text-4xl font-semibold leading-tight lg:text-5xl">
              Lleva un control preciso de cada caja, cada kilo y cada venta.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-[#615b54] dark:text-[#b7b2aa]">
              Carne Control centraliza la informacion de tus productos carnicos, automatiza la lectura de codigos de barras
              y genera recibos profesionales. Todo enfocado en operaciones de carne y sus necesidades reales.
            </p>

            <div className="flex flex-col gap-3 text-sm leading-relaxed lg:flex-row lg:gap-6">
              <div>
                <p className="text-xl font-semibold text-[#c1272d] dark:text-[#ff6f7a]">+10K</p>
                <p className="text-[#615b54] dark:text-[#b7b2aa]">Cajas registradas con lectura automatica</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-[#c1272d] dark:text-[#ff6f7a]">100%</p>
                <p className="text-[#615b54] dark:text-[#b7b2aa]">Visibilidad de productos y notas de venta</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-[#c1272d] dark:text-[#ff6f7a]">24/7</p>
                <p className="text-[#615b54] dark:text-[#b7b2aa]">Acceso seguro desde cualquier dispositivo</p>
              </div>
            </div>

            {!auth.user && (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={route('login')}
                  className="inline-flex items-center justify-center rounded-md bg-[#c1272d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a51f25] dark:bg-[#ff6f7a] dark:text-[#2b2723] dark:hover:bg-[#ff8791]"
                >
                  Ingresar
                </Link>
                <p className="text-sm text-[#615b54] dark:text-[#b7b2aa]">
                  ¿Necesitas acceso? Solicítalo con el administrador del sistema.
                </p>
              </div>
            )}
          </section>

          <section className="flex-1 space-y-5 rounded-lg border border-[#e0d7cf] bg-white p-6 shadow-lg dark:border-[#2a231d] dark:bg-[#161312]">
            <h2 className="text-lg font-semibold">Por que elegir Carne Control</h2>
            <ul className="space-y-4 text-sm leading-relaxed text-[#4a4440] dark:text-[#c5c0b9]">
              {features.map((feature) => (
                <li key={feature.title} className="flex gap-3">
                  <span className="mt-1 inline-flex size-5 items-center justify-center rounded-full bg-[#c1272d] text-[10px] font-semibold text-white dark:bg-[#ff6f7a] dark:text-[#2b2723]">
                    CC
                  </span>
                  <div>
                    <p className="font-semibold text-[#171412] dark:text-[#f1efe9]">{feature.title}</p>
                    <p>{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="rounded-md border border-dashed border-[#c8bfb6] bg-[#f8f3ee] p-4 text-sm text-[#4a4440] dark:border-[#403830] dark:bg-[#1c1917] dark:text-[#cbc6bd]">
              Conoce mas en el panel de control: registra productos, configura lecturas de codigos y genera reportes PDF en
              cuestion de segundos.
            </div>
          </section>
        </main>

        <footer className="border-t border-[#e0d7cf] px-6 py-6 text-center text-xs text-[#7c756c] dark:border-[#1d1b18] dark:text-[#9b958c]">
          Carne Control &mdash; Gestion de inventario y ventas para la industria carnica.
        </footer>
      </div>
    </>
  );
}
