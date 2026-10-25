import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { productsAPI } from '@/lib/api';
import InlineDots from '@/components/loading/InlineDots';
import { getMediaUrl } from '@/lib/siteConfig';

function ordered(items) {
  return [...(items || [])].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0) || (a.name || '').localeCompare(b.name || ''),
  );
}

function useProductCache() {
  const cache = useRef({});
  const [flyout, setFlyout] = useState({ slug: '', products: [], loading: false });

  const load = async (slug) => {
    if (!slug) return;
    if (cache.current[slug]) {
      setFlyout({ slug, products: cache.current[slug], loading: false });
      return;
    }
    setFlyout({ slug, products: [], loading: true });
    try {
      const response = await productsAPI.getProducts({ subcategory_slug: slug, page_size: 6 });
      const products = response.data?.results || response.data || [];
      const list = Array.isArray(products) ? products : [];
      cache.current[slug] = list;
      setFlyout({ slug, products: list, loading: false });
    } catch {
      cache.current[slug] = [];
      setFlyout({ slug, products: [], loading: false });
    }
  };

  return { flyout, load };
}

const categoryLabelClass = 'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-t-md px-3 py-2 text-sm font-medium';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function fitCount(widths, moreWidth, available, gap) {
  let used = 0;
  for (let i = 0; i < widths.length; i += 1) {
    const next = used + (i > 0 ? gap : 0) + widths[i];
    const reserve = i < widths.length - 1 ? gap + moreWidth : 0;
    if (next + reserve > available) return i;
    used = next;
  }
  return widths.length;
}

function ProductFlyout({ flyout, onNavigate, align }) {
  const side = align === 'left'
    ? 'right-full -mr-px rounded-l-lg'
    : 'left-full -ml-px rounded-r-lg';
  return (
    <div className={`absolute top-0 z-50 w-64 border border-white/10 bg-navy-950 py-2 shadow-elegant-lg ${side}`}>
      {flyout.loading && (
        <p className="flex items-center gap-2 px-3 py-2 text-sm text-white/60">
          <InlineDots />
          Loading products...
        </p>
      )}
      {!flyout.loading && flyout.products.length === 0 && (
        <p className="px-3 py-2 text-sm text-white/60">No products in this subcategory</p>
      )}
      {!flyout.loading && flyout.products.map((product) => (
        <Link
          key={product.id}
          href={`/product/${product.slug}`}
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2 text-white/90 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:outline-none"
        >
          <img
            src={getMediaUrl(product.primary_image)}
            alt=""
            className="h-10 w-10 shrink-0 rounded-md bg-white object-contain"
          />
          <span className="line-clamp-2 text-sm leading-snug">{product.name}</span>
        </Link>
      ))}
    </div>
  );
}

function CategoryLabel({ category, open }) {
  const hasSubs = ordered(category.subcategories).length > 0;
  return (
    <>
      {category.name}
      {hasSubs && (
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      )}
    </>
  );
}

function SubcategoryMenu({ category, subId, flyout, flyoutAlign, onOpenSub, onNavigate, className }) {
  const subcategories = ordered(category.subcategories);
  return (
    <div className={className}>
      {subcategories.map((sub) => {
        const subOpen = subId === sub.id;
        return (
          <div
            key={sub.id}
            className="relative"
            onMouseEnter={(event) => onOpenSub(event, sub)}
          >
            <Link
              href={`/category/${category.slug}/${sub.slug}`}
              onFocus={() => onOpenSub(null, sub)}
              className={`flex items-center justify-between gap-4 px-4 py-2 text-sm focus:bg-white/10 focus:outline-none ${
                subOpen ? 'bg-white/10 text-white' : 'text-white/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              {sub.name}
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/50" />
            </Link>
            {subOpen && flyout.slug === sub.slug && (
              <ProductFlyout flyout={flyout} align={flyoutAlign} onNavigate={onNavigate} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function DesktopCategoryNav({ categories }) {
  const router = useRouter();
  const navRef = useRef(null);
  const measureRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(categories.length);
  const [openId, setOpenId] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [menuAlign, setMenuAlign] = useState('left');
  const [subId, setSubId] = useState(null);
  const [flyoutAlign, setFlyoutAlign] = useState('right');
  const closeTimer = useRef(null);
  const { flyout, load } = useProductCache();

  const clearClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const closeMenus = () => {
    setOpenId(null);
    setSubId(null);
    setMoreOpen(false);
  };

  const scheduleClose = () => {
    clearClose();
    closeTimer.current = setTimeout(closeMenus, 140);
  };

  useEffect(() => () => clearClose(), []);

  useEffect(() => {
    closeMenus();
  }, [router.asPath]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') closeMenus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useIsoLayoutEffect(() => {
    const nav = navRef.current;
    const probe = measureRef.current;
    if (!nav || !probe) return undefined;

    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      const available = nav.clientWidth;
      if (!available) return;
      const widths = [...probe.querySelectorAll('[data-cat-measure]')].map((node) => node.offsetWidth);
      const moreWidth = probe.querySelector('[data-more-measure]')?.offsetWidth || 0;
      if (!widths.length || widths.some((width) => !width) || !moreWidth) return;
      const gap = Number.parseFloat(getComputedStyle(nav).columnGap) || 0;
      const count = fitCount(widths, moreWidth, available - 1, gap);
      setVisibleCount((prev) => (prev === count ? prev : count));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    document.fonts?.ready?.then(measure);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [categories]);

  const visible = categories.slice(0, visibleCount);
  const hidden = categories.slice(visibleCount);
  const moreActive = hidden.some((category) => router.asPath.startsWith(`/category/${category.slug}`));

  const openSub = (event, sub) => {
    clearClose();
    if (event?.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      setFlyoutAlign(rect.right + 272 > window.innerWidth ? 'left' : 'right');
    }
    setSubId(sub.id);
    load(sub.slug);
  };

  const closeFlyout = () => {
    setOpenId(null);
    setMoreOpen(false);
  };

  const itemHandlers = (category) => ({
    onMouseEnter: () => {
      clearClose();
      setMoreOpen(false);
      setOpenId(category.id);
    },
    onMouseLeave: scheduleClose,
    onFocus: () => {
      setMoreOpen(false);
      setOpenId(category.id);
    },
    onBlur: (event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) scheduleClose();
    },
  });

  return (
    <nav ref={navRef} className="relative flex min-w-0 flex-1 items-center gap-1" aria-label="Categories">
      <div
        ref={measureRef}
        className="pointer-events-none absolute inset-x-0 top-0 flex h-0 items-center gap-1 overflow-hidden opacity-0"
        aria-hidden="true"
      >
        {categories.map((category) => (
          <span key={category.id} data-cat-measure className={categoryLabelClass}>
            <CategoryLabel category={category} open={false} />
          </span>
        ))}
        <button type="button" tabIndex={-1} data-more-measure className={categoryLabelClass}>
          More
          <ChevronDown className="h-3.5 w-3.5 shrink-0" />
        </button>
      </div>

      {visible.map((category) => {
        const subcategories = ordered(category.subcategories);
        const open = openId === category.id && !moreOpen;
        const active = router.asPath.startsWith(`/category/${category.slug}`);
        return (
          <div key={category.id} className="relative shrink-0" {...itemHandlers(category)}>
            <Link
              href={`/category/${category.slug}`}
              aria-expanded={subcategories.length > 0 ? open : undefined}
              aria-haspopup={subcategories.length > 0 ? 'true' : undefined}
              className={`${categoryLabelClass} focus:outline-none focus:ring-2 focus:ring-gold-400 ${
                open || active ? 'bg-navy-950 text-white' : 'text-white/90 hover:text-white'
              }`}
            >
              <CategoryLabel category={category} open={open} />
            </Link>
            {open && subcategories.length > 0 && (
              <SubcategoryMenu
                category={category}
                subId={subId}
                flyout={flyout}
                flyoutAlign={flyoutAlign}
                onOpenSub={openSub}
                onNavigate={closeFlyout}
                className="absolute left-0 top-full z-50 min-w-[220px] rounded-b-lg rounded-tr-lg border border-white/10 bg-navy-950 py-1 shadow-elegant-lg"
              />
            )}
          </div>
        );
      })}

      {hidden.length > 0 && (
        <div
          className="relative shrink-0"
          onMouseEnter={() => {
            clearClose();
            setMoreOpen(true);
            setOpenId(null);
            setSubId(null);
          }}
          onMouseLeave={scheduleClose}
          onFocus={() => {
            setMoreOpen(true);
            setOpenId(null);
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) scheduleClose();
          }}
        >
          <button
            type="button"
            aria-expanded={moreOpen}
            aria-haspopup="true"
            className={`${categoryLabelClass} focus:outline-none focus:ring-2 focus:ring-gold-400 ${
              moreOpen || moreActive ? 'bg-navy-950 text-white' : 'text-white/90 hover:text-white'
            }`}
          >
            More
            <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
          </button>
          {moreOpen && (
            <div className="absolute right-0 top-full z-50 min-w-[220px] rounded-b-lg rounded-tl-lg border border-white/10 bg-navy-950 py-1 shadow-elegant-lg">
              {hidden.map((category) => {
                const subcategories = ordered(category.subcategories);
                const open = openId === category.id;
                const active = router.asPath.startsWith(`/category/${category.slug}`);
                return (
                  <div
                    key={category.id}
                    className="relative"
                    onMouseEnter={(event) => {
                      clearClose();
                      setMoreOpen(true);
                      const rect = event.currentTarget.getBoundingClientRect();
                      setMenuAlign(rect.left >= 248 ? 'left' : 'right');
                      setOpenId(category.id);
                      setSubId(null);
                    }}
                  >
                    <Link
                      href={`/category/${category.slug}`}
                      onFocus={() => setOpenId(category.id)}
                      className={`flex items-center justify-between gap-4 px-4 py-2 text-sm focus:bg-white/10 focus:outline-none ${
                        open || active ? 'bg-white/10 text-white' : 'text-white/85 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {category.name}
                      {subcategories.length > 0 && (
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/50" />
                      )}
                    </Link>
                    {open && subcategories.length > 0 && (
                      <SubcategoryMenu
                        category={category}
                        subId={subId}
                        flyout={flyout}
                        flyoutAlign={flyoutAlign}
                        onOpenSub={openSub}
                        onNavigate={closeFlyout}
                        className={`absolute top-0 z-50 min-w-[220px] border border-white/10 bg-navy-950 py-1 shadow-elegant-lg ${
                          menuAlign === 'left' ? 'right-full -mr-px rounded-l-lg' : 'left-full -ml-px rounded-r-lg'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export function MobileCategoryNav({ categories, onNavigate }) {
  const [openId, setOpenId] = useState(null);
  const [subId, setSubId] = useState(null);
  const { flyout, load } = useProductCache();

  return (
    <div className="flex flex-col">
      {categories.map((category) => {
        const subcategories = ordered(category.subcategories);
        const open = openId === category.id;
        return (
          <div key={category.id} className="border-b border-white/10">
            <div className="flex items-center">
              <Link
                href={`/category/${category.slug}`}
                onClick={onNavigate}
                className="flex-1 py-2.5 text-sm text-white/90"
              >
                {category.name}
              </Link>
              {subcategories.length > 0 && (
                <button
                  type="button"
                  aria-expanded={open}
                  aria-label={`${open ? 'Hide' : 'Show'} ${category.name} subcategories`}
                  onClick={() => {
                    setOpenId(open ? null : category.id);
                    setSubId(null);
                  }}
                  className="p-2 text-white/80 focus:outline-none focus:ring-2 focus:ring-gold-400"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
            {open && (
              <div className="mb-2 ml-3 border-l border-white/15 pl-3">
                {subcategories.map((sub) => {
                  const subOpen = subId === sub.id;
                  return (
                    <div key={sub.id}>
                      <div className="flex items-center">
                        <Link
                          href={`/category/${category.slug}/${sub.slug}`}
                          onClick={onNavigate}
                          className="flex-1 py-2 text-sm text-white/75"
                        >
                          {sub.name}
                        </Link>
                        <button
                          type="button"
                          aria-expanded={subOpen}
                          aria-label={`${subOpen ? 'Hide' : 'Show'} ${sub.name} products`}
                          onClick={() => {
                            const next = subOpen ? null : sub.id;
                            setSubId(next);
                            if (next) load(sub.slug);
                          }}
                          className="p-2 text-white/70 focus:outline-none focus:ring-2 focus:ring-gold-400"
                        >
                          <ChevronRight className={`h-4 w-4 transition-transform ${subOpen ? 'rotate-90' : ''}`} />
                        </button>
                      </div>
                      {subOpen && flyout.slug === sub.slug && (
                        <div className="mb-2 rounded-md bg-navy-950 p-1">
                          {flyout.loading && (
                            <p className="flex items-center gap-2 px-2 py-1.5 text-xs text-white/60">
                              <InlineDots />
                              Loading products...
                            </p>
                          )}
                          {!flyout.loading && flyout.products.length === 0 && (
                            <p className="px-2 py-1.5 text-xs text-white/60">No products in this subcategory</p>
                          )}
                          {flyout.products.map((product) => (
                            <Link
                              key={product.id}
                              href={`/product/${product.slug}`}
                              onClick={onNavigate}
                              className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-white/90 hover:bg-white/10"
                            >
                              <img src={getMediaUrl(product.primary_image)} alt="" className="h-8 w-8 rounded bg-white object-contain" />
                              <span className="line-clamp-2">{product.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
