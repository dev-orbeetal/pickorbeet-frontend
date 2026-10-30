import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, ShieldCheck } from 'lucide-react';
import { productEase } from '@/components/product/motion';

const CUT = 280;

function plainText(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cut(text) {
  if (text.length <= CUT) return text;
  const slice = text.slice(0, CUT);
  const space = slice.lastIndexOf(' ');
  return `${(space > 180 ? slice.slice(0, space) : slice).trim()}…`;
}

function SectionTitle({ children }) {
  return (
    <h2 className="flex items-center gap-2 text-[14.3px] font-bold text-[#172033]">
      <span className="h-4 w-[3px] shrink-0 rounded-sm bg-[#FE7818]" aria-hidden="true" />
      {children}
    </h2>
  );
}

export default function ProductDetailsSheet({ product, rows = [] }) {
  const reduce = useReducedMotion();
  const [expanded, setExpanded] = useState(false);

  const blurb = useMemo(() => {
    const short = plainText(product.short_description);
    const body = plainText(product.description);
    if (short && short.length <= 80 && short !== body) return short;
    return '';
  }, [product.description, product.short_description]);

  const copy = useMemo(() => {
    const body = plainText(product.description);
    if (body) return body;
    return plainText(product.short_description);
  }, [product.description, product.short_description]);

  const warranty = String(product.warranty_period || '').trim();
  const long = copy.length > CUT;
  const shown = long && !expanded ? cut(copy) : copy;

  return (
    <section className="rounded-2xl bg-white p-3.5 shadow-[0_8px_24px_rgba(23,32,51,0.05)]">
      <SectionTitle>Product details</SectionTitle>

      {blurb && (
        <p className="mt-2 text-sm font-semibold leading-[1.4] text-[#172033]">{blurb}</p>
      )}

      {copy ? (
        <div className="mt-2">
          <AnimatePresence initial={false} mode="wait">
            <motion.p
              key={expanded ? 'full' : 'cut'}
              initial={reduce ? false : { opacity: 0.65 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0.65 }}
              transition={{ duration: reduce ? 0 : 0.22, ease: productEase }}
              className="whitespace-pre-line text-[13px] leading-[1.5] text-[#1C2448]"
            >
              {shown}
            </motion.p>
          </AnimatePresence>
          {long && (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="mt-1.5 inline-flex items-center gap-0.5 text-xs font-medium text-[#0233E6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8]"
            >
              {expanded ? 'Show less' : 'Read more'}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      ) : (
        <p className="mt-2 text-[13px] text-[#8B95A7]">The seller has not added a description yet.</p>
      )}

      {warranty && (
        <div className="mt-3.5 rounded-xl border border-[#D6E4FF] bg-[#F4F8FF] p-3">
          <p className="flex items-center gap-1.5 text-[13px] font-bold text-[#172033]">
            <ShieldCheck className="h-4 w-4 text-[#2864E8]" aria-hidden="true" />
            Warranty
          </p>
          <p className="mt-1.5 text-base font-bold text-[#172033]">{warranty}</p>
          <p className="mt-1 text-[13px] leading-[1.45] text-[#525E70]">
            Covered for {warranty} from the day the order is delivered, for manufacturing defects. Keep the invoice if you need to make a claim.
          </p>
        </div>
      )}

      {rows.length > 0 && (
        <div className="mt-4">
          <SectionTitle>Specifications</SectionTitle>
          <dl className="mt-1">
            {rows.map((row, index) => (
              <div key={`${row.name}-${index}`} className="flex items-baseline gap-3 py-[5px] text-xs">
                <dt className="w-24 shrink-0 text-[#8B95A7]">{row.name}</dt>
                <dd className="min-w-0 font-semibold text-[#172033]">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}
