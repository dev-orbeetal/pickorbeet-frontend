'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getMediaUrl } from '@/lib/siteConfig';

/**
 * Shared listing hero for Home > page directories.
 * Prefer a page-specific image, then the store default directory banner,
 * then the blue–orange gradient used in the app.
 */
export default function DirectoryHero({
  title,
  subtitle = '',
  crumbs = [],
  image = '',
  defaultBanner = '',
}) {
  const artwork = (image || defaultBanner || '').trim();
  const hasImage = Boolean(artwork);
  const src = hasImage ? getMediaUrl(artwork, artwork) : '';

  return (
    <section className="relative h-48 overflow-hidden md:h-64">
      {hasImage ? (
        <>
          <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#051340]/92 via-[#051340]/55 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-[#F3F7FE]" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#2F6BFF] via-[#5B8CFF] to-[#FF8A3D]" />
      )}

      <div className="container-custom relative z-10 flex h-full items-center">
        <div className="max-w-3xl text-white">
          <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-sm text-white/85" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            {crumbs.map((crumb) => (
              <span key={`${crumb.href || ''}-${crumb.label}`} className="contents">
                <ChevronRight className="h-4 w-4 opacity-80" aria-hidden="true" />
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-white">{crumb.label}</Link>
                ) : (
                  <span className="font-medium text-white">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
          <h1 className="text-2xl font-bold leading-tight md:text-4xl">{title}</h1>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-sm text-white/90 md:text-base">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
