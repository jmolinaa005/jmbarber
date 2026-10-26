import { useState } from 'react';
import { Images, X, Plus, Trash2, ImagePlus } from 'lucide-react';
import { useLang } from '@/LanguageContext';
import { useData } from '@/DataContext';

export default function Gallery() {
  const { t } = useLang();
  const { photos, isAdmin, addPhotos, deletePhoto } = useData();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleAdd = async () => {
    if (files.length === 0) return;
    setUploading(true);
    try {
      await addPhotos(files, caption.trim());
      setFiles([]);
      setCaption('');
      setAdding(false);
    } finally {
      setUploading(false);
    }
  };

  return (
    <section id="gallery" className="py-20 md:py-28 bg-ink-800 relative">
      <div className="absolute inset-0 bg-brick-texture opacity-15 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-brick-500 font-display font-600 uppercase tracking-widest text-xs mb-3">
              {t('gallery.subtitle')}
            </p>
            <h2 className="font-display font-700 uppercase text-3xl md:text-5xl tracking-tight">
              {t('gallery.title')}
            </h2>
            <div className="mt-4 w-16 h-0.5 bg-brick-500" />
          </div>
          {isAdmin && (
            <button
              onClick={() => setAdding((a) => !a)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-ink-700 hover:bg-brick-500 border border-ink-400/60 hover:border-brick-500 text-white font-display font-600 uppercase tracking-wider text-xs rounded-md transition-all"
            >
              <Plus className="w-4 h-4" /> {t('gallery.add')}
            </button>
          )}
        </div>

        {adding && isAdmin && (
          <div className="industrial-card rounded-xl p-5 mb-8 space-y-3">
            <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-brick-500/50 bg-ink-700/40 px-4 py-6 text-center hover:border-brick-400 hover:bg-ink-700">
              <ImagePlus className="h-8 w-8 text-brick-400" />
              <span className="text-sm font-semibold text-white">{t('admin.choosePhotos')}</span>
              <span className="text-xs text-white/45">{t('admin.choosePhotosHint')}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                className="sr-only"
              />
            </label>
            {files.length > 0 && <p className="text-xs text-brick-300">{files.length} {t('admin.photosSelected')}</p>}
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={t('admin.photoCaption')}
              className="w-full bg-ink-700/60 border border-ink-400/60 rounded-md px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-brick-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={files.length === 0 || uploading}
                className="px-4 py-2 bg-brick-500 disabled:bg-ink-600 disabled:text-white/40 hover:bg-brick-400 text-white text-sm font-semibold rounded-md transition-colors"
              >
                {uploading ? t('admin.uploadingPhotos') : t('admin.addPhotoBtn')}
              </button>
              <button
                onClick={() => setAdding(false)}
                className="px-4 py-2 bg-ink-700 hover:bg-ink-600 text-white text-sm rounded-md transition-colors"
              >
                {t('booking.cancel')}
              </button>
            </div>
          </div>
        )}

        {photos.length === 0 ? (
          <div className="industrial-card rounded-xl p-12 text-center">
            <Images className="w-10 h-10 text-white/30 mx-auto mb-3" />
            <p className="text-white/50">{t('gallery.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {photos.map((p, i) => (
              <div
                key={p.id}
                className="group relative aspect-square rounded-lg overflow-hidden border border-ink-400/40 cursor-pointer"
                onClick={() => setLightbox(i)}
              >
                <img
                  src={p.image_url}
                  alt={p.caption ?? ''}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {p.caption && (
                  <p className="absolute bottom-0 left-0 right-0 p-3 text-xs text-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                    {p.caption}
                  </p>
                )}
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(t('admin.confirmDelete'))) deletePhoto(p);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-ink-900/80 hover:bg-red-600/80 border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={t('gallery.delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {lightbox !== null && photos[lightbox] && (
        <div
          className="fixed inset-0 z-50 bg-ink-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-up"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-ink-700/80 hover:bg-brick-500 flex items-center justify-center text-white transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={photos[lightbox].image_url}
            alt={photos[lightbox].caption ?? ''}
            className="max-w-full max-h-[85vh] rounded-lg border border-ink-400/60 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          {photos[lightbox].caption && (
            <p className="absolute bottom-6 left-0 right-0 text-center text-white/80 px-6">
              {photos[lightbox].caption}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
