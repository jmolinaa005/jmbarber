import { MapPin, Navigation, Car, Footprints } from 'lucide-react';
import { useLang } from '@/LanguageContext';

export default function Location() {
  const { t, lang } = useLang();
  const blanesUrl = 'https://www.google.com/maps/search/?api=1&query=Mas+Montells+Blanes+Girona';
  const bcnUrl = 'https://www.google.com/maps/search/?api=1&query=Carrer+Amposta+23+Sants-Montjuic+Barcelona';

  const vehicleLabel =
    lang === 'ca' ? 'Accés amb vehicle' : lang === 'es' ? 'Acceso con vehículo' : 'Vehicle access';
  const walkLabel =
    lang === 'ca' ? 'Accés a peu' : lang === 'es' ? 'Acceso a pie' : 'Walking access';

  const locations = [
    {
      name: t('location.blanesName'),
      area: t('location.blanesArea'),
      desc: t('location.desc'),
      mapsUrl: blanesUrl,
      embedUrl: 'https://www.google.com/maps?q=Mas%20Montells%2C%20Blanes%2C%20Girona&output=embed',
      title: 'Map Mas Montells Blanes',
    },
    {
      name: t('location.bcnName'),
      area: t('location.bcnArea'),
      desc: t('location.bcnDesc'),
      mapsUrl: bcnUrl,
      embedUrl: 'https://www.google.com/maps?q=Carrer%20Amposta%2023%20Sants-Montjuic%20Barcelona&output=embed',
      title: "Map C/d'Amposta Barcelona",
    },
  ];

  return (
    <section id="location" className="py-20 md:py-28 bg-ink-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-brick-500 font-display font-600 uppercase tracking-widest text-xs mb-3">
            {t('location.subtitle')}
          </p>
          <h2 className="font-display font-700 uppercase text-3xl md:text-5xl tracking-tight">
            {t('location.title')}
          </h2>
          <div className="mt-4 w-16 h-0.5 bg-brick-500 mx-auto" />
        </div>

        <div className="space-y-8">
          {locations.map((loc) => (
            <div key={loc.name} className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
              <div className="industrial-card rounded-xl p-7 md:p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-5">
                  <MapPin className="w-6 h-6 text-brick-500" />
                  <div>
                    <p className="font-display font-600 uppercase text-lg">{loc.name}</p>
                    <p className="text-white/50 text-sm">{loc.area}</p>
                  </div>
                </div>

                <p className="text-white/75 leading-relaxed mb-6">{loc.desc}</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 p-3.5 bg-ink-700/50 rounded-lg border border-ink-400/40">
                    <Car className="w-5 h-5 text-brick-500 shrink-0" />
                    <span className="text-sm text-white/80">{vehicleLabel}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3.5 bg-ink-700/50 rounded-lg border border-ink-400/40">
                    <Footprints className="w-5 h-5 text-brick-500 shrink-0" />
                    <span className="text-sm text-white/80">{walkLabel}</span>
                  </div>
                </div>

                <a
                  href={loc.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brick-500 hover:bg-brick-400 text-white font-display font-600 uppercase tracking-wider text-sm rounded-md transition-all hover:shadow-[0_0_24px_rgba(138,90,59,0.4)]"
                >
                  <Navigation className="w-4 h-4" />
                  {t('location.directions')}
                </a>
              </div>

              <div className="rounded-xl overflow-hidden border border-ink-400/60 min-h-[320px] relative industrial-card">
                <iframe
                  title={loc.title}
                  src={loc.embedUrl}
                  className="w-full h-full min-h-[320px] grayscale invert-[0.92] hue-rotate-180 contrast-[0.9]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
