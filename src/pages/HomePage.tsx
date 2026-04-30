import { Users, Share2, Smartphone } from 'lucide-react';
import { navigate } from '../app/router';
import { BrandLogo } from '../components/BrandLogo';

export const HomePage = () => {
  return (
    <section className="grid min-h-[72vh] items-center gap-8 lg:grid-cols-[1fr_0.85fr]">
      <div>
        <div className="flex items-center gap-4">
          <BrandLogo size="lg" />
        </div>
        <p className="mt-5 text-sm font-black uppercase tracking-[0.28em] text-[#2f7fb3]">Modo host</p>
        <h2 className="brand-title mt-3 max-w-3xl text-5xl font-black leading-tight sm:text-7xl">
          La Rosca
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#17354d]">
          El host crea la partida y comparte desde el lobby un link directo para los dos jugadores. Puede moderar desde
          compu o celular; cada jugador entra desde su propio telefono.
        </p>
      </div>
      <div className="rounded-2xl border border-line bg-panel p-5 shadow-2xl sm:p-6">
        <div className="grid gap-4">
          <button
            type="button"
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-4 text-lg font-black text-blue-950"
            onClick={() => navigate('/create')}
          >
            <Users size={22} /> Crear partida como host
          </button>
          <div className="grid gap-3 rounded-xl bg-white/70 p-4">
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
