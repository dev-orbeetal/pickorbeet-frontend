import { useEffect, useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { getMediaUrl } from '@/lib/siteConfig';

function initialsOf(name) {
  return (name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

export default function ProfilePhoto({
  name = '',
  imageUrl = '',
  editing = false,
  pendingFile = null,
  removed = false,
  onSelect,
  onRemove,
  variant = 'solid',
}) {
  const input = useRef(null);
  const [preview, setPreview] = useState('');
  const [broken, setBroken] = useState(false);
  const stored = !removed && imageUrl ? getMediaUrl(imageUrl) : '';
  const shown = preview || (!broken ? stored : '');

  useEffect(() => {
    if (!pendingFile) {
      setPreview('');
      return undefined;
    }
    const url = URL.createObjectURL(pendingFile);
    setPreview(url);
    setBroken(false);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  useEffect(() => {
    setBroken(false);
  }, [stored]);

  const light = variant === 'light';
  const circle = light
    ? 'bg-white/20 border-2 border-white/30 text-white'
    : 'bg-gradient-to-br from-primary-500 to-primary-700 text-white';

  return (
    <div className={light ? '' : 'text-center'}>
      <div className={`relative mx-auto h-20 w-20 ${light ? '' : 'mb-3'}`}>
        <button
          type="button"
          disabled={!editing}
          onClick={() => input.current?.click()}
          className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-full ${circle} ${editing ? 'cursor-pointer' : 'cursor-default'}`}
          aria-label={editing ? 'Change profile photo' : 'Profile photo'}
        >
          {shown ? (
            <img
              src={shown}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setBroken(true)}
            />
          ) : (
            <span className="text-2xl font-bold">{initialsOf(name)}</span>
          )}
        </button>
        {editing && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-white shadow ring-2 ring-white"
            aria-label="Upload profile photo"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        )}
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) onSelect?.(file);
          }}
        />
      </div>
      {editing && (
        <div className={`mt-3 ${light ? 'text-left' : ''}`}>
          <p className={`text-xs ${light ? 'text-primary-100' : 'text-charcoal-500'}`}>
            JPEG, PNG, or WebP. 2 MB max.
          </p>
          {(pendingFile || (imageUrl && !removed)) && (
            <button
              type="button"
              onClick={onRemove}
              className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${light ? 'text-white' : 'text-red-600'}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove photo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
