import { Users, Share2, Smartphone } from 'lucide-react';
import { navigate } from '../app/router';
import { BrandLogo } from '../components/BrandLogo';

export const HomePage = () => {
  return (
    <section className="grid min-h-[70vh] items-center gap-4 sm:gap-8 lg:grid-cols-[1fr_0.85fr]">
      <div>
        <div className="flex items-center gap-3 sm:gap-4">
          <BrandLogo size="lg" />
        </div>
        <p className="mt-4 text-xs font-black uppercase tracking-[0.24em] text-[#7dd3fc] sm:mt-5 sm:text-sm sm:tracking-[0.28em]">Modo host</p>
        <h2 className="brand-title mt-2 max-w-3xl text-4xl font-black leading-tight text-white sm:mt-3 sm:text-7xl">
          La Rosca
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200 sm:mt-5 sm:text-lg">
          El host crea la partida y comparte desde el lobby un link directo para los dos jugadores. Puede moderar desde
          compu o celular; cada jugador entra desde su propio telefono.
        </p>
      </div>
      <div className="rounded-xl border border-line bg-panel p-3 shadow-2xl sm:rounded-2xl sm:p-6">
        <div className="grid gap-3 sm:gap-4">
          <button
            type="button"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-3 text-base font-black text-blue-950 sm:min-h-14 sm:rounded-xl sm:px-5 sm:py-4 sm:text-lg"
            onClick={() => navigate('/create')}
          >
            <Users size={22} /> Crear partida como host
          </button>
          <div className="grid gap-2 rounded-lg bg-white/70 p-3 sm:gap-3 sm:rounded-xl sm:p-4">
            <div className="flex gap-3">
              <Share2 className="mt-1 text-[#2f7fb3]" size={22} />
              <p className="text-sm leading-relaxed">
                Al crear la partida vas a ver un link para copiar y mandar a los jugadores.
              </p>
            </div>
            <div className="flex gap-3">
              <Smartphone className="mt-1 text-[#2f7fb3]" size={22} />
              <p className="text-sm leading-relaxed">
                La pantalla del jugador solo se abre desde ese link; no hace falta que ingresen codigos a mano.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
