import { Home, Car, MapPin } from 'lucide-react';
import { useLang } from '@/LanguageContext';
import { SERVICE_DOMICILIO } from '@/lib/supabase';

type Props = { onBook: (service?: string) => void };

export default function AtHome({ onBook }: Props) {
  const { t } = useLang();

  return (
    <section id="athome" className="py-20 md:py-28 bg-ink-900 relative overflow-hidden">
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="industrial-card rounded-2xl p-8 md:p-12 border-glow">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-lg bg-brick-500/15 border border-brick-500/30 flex items-center justify-center">
              <Home className="w-7 h-7 text-brick-400" />
            </div>
            <div>
              <p className="text-brick-500 font-display font-600 uppercase tracking-widest text-xs">
                {t('athome.subtitle')}
              </p>
              <h2 className="font-display font-700 uppercase text-2xl md:text-4xl tracking-tight">
                {t('athome.title')}
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div className="space-y-4 text-white/75 leading-relaxed">
              <p>{t('athome.p1')}</p>
              <p>{t('athome.p2')}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-ink-700/50 rounded-lg border border-ink-400/40">
                <Car className="w-5 h-5 text-brick-500 shrink-0" />
                <span className="text-sm text-white/80">Blanes y alrededores</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-ink-700/50 rounded-lg border border-ink-400/40">
                <MapPin className="w-5 h-5 text-brick-500 shrink-0" />
                <span className="text-sm text-white/80">Mas Montells · Blanes</span>
              </div>
              <button
                onClick={() => onBook(SERVICE_DOMICILIO)}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brick-500 hover:bg-brick-400 text-white font-display font-600 uppercase tracking-wider text-sm rounded-md transition-all hover:shadow-[0_0_24px_rgba(138,90,59,0.4)]"
              >
                {t('athome.book')} · 11€
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
