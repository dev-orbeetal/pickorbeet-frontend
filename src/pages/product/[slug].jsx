import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { motion, useReducedMotion } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductDetailSkeleton from '@/components/loading/ProductDetailSkeleton';
import ProductDetailsSheet from '@/components/product/ProductDetailsSheet';
import ProductGallery from '@/components/product/ProductGallery';
import ProductInfoTabs from '@/components/product/ProductInfoTabs';
import ProductMobileBar from '@/components/product/ProductMobileBar';
import ProductPurchase from '@/components/product/ProductPurchase';
import ProductRelated from '@/components/product/ProductRelated';
import ProductReviewSheet from '@/components/product/ProductReviewSheet';
import { riseProps } from '@/components/product/motion';
import { useBootGate } from '@/components/loading/LoadingProvider';
import { fetchProduct, fetchProducts, clearProduct } from '@/store/slices/productsSlice';
import { addToCart } from '@/store/slices/cartSlice';
import { readList, subscribeLists, toggleList, WISHLIST_KEY } from '@/lib/productLists';
import { productsAPI } from '@/lib/api';
import { availableLabels, matchedVariant, selectionGroups } from '@/lib/productOptions';
import siteConfig, { buildOgImageUrl, getAbsoluteImageUrl } from '@/lib/siteConfig';
import { offerPrices, productBrand, productPriceDescription, productPriceTitle } from '@/lib/seo';
import { fetchApi, serializable } from '@/lib/serverApi';

function specificationRows(product) {
  const custom = Array.isArray(product.specifications)
    ? product.specifications.filter((row) => row?.name && row?.value)
    : [];
  if (custom.length) return custom.map((row) => ({ name: row.name, value: row.value }));
  const rows = [];
  if (product.sku) rows.push({ name: 'Product code', value: product.sku });
  if (product.color) rows.push({ name: 'Color', value: product.color });
  if (product.size) rows.push({ name: 'Size', value: product.size });
  if (product.material) rows.push({ name: 'Material', value: product.material });
  return rows;
}

export default function ProductDetailPage({ initialProduct }) {
  const router = useRouter();
  const { slug } = router.query;
  const dispatch = useDispatch();
  const reduce = useReducedMotion();
  const detailsRef = useRef(null);

  const { product: storeProduct, products } = useSelector((state) => state.products);
  const product = storeProduct || initialProduct;

  const [phase, setPhase] = useState(initialProduct ? 'ready' : 'loading');
  useBootGate(phase === 'loading' && !product);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selected, setSelected] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(null);
  const [justAdded, setJustAdded] = useState(false);
  const [tab, setTab] = useState('description');
  const [reviewPayload, setReviewPayload] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewTick, setReviewTick] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);

  useEffect(() => {
    setSelectedImage(0);
    setSelected({});
    setQuantity(1);
    setTab('description');
    setReviewPayload(null);
    setJustAdded(false);
    setReviewOpen(false);
  }, [slug]);

  useEffect(() => {
    if (!slug) return undefined;
    let active = true;
    const hasInitial = initialProduct && initialProduct.slug === slug;
    if (!hasInitial) setPhase('loading');
    dispatch(fetchProduct(slug))
      .unwrap()
      .then(() => { if (active) setPhase('ready'); })
      .catch(() => { if (active) setPhase(hasInitial ? 'ready' : 'error'); });
    return () => {
      active = false;
      dispatch(clearProduct());
    };
  }, [dispatch, slug, initialProduct]);

  useEffect(() => {
    if (!product) return undefined;
    let active = true;
    const loadRelated = async () => {
      if (product.subcategory?.id) {
        const sub = await dispatch(fetchProducts({
          subcategory: product.subcategory.id,
          page_size: 12,
        })).unwrap().catch(() => null);
        const rows = Array.isArray(sub) ? sub : (sub?.results || []);
        const siblings = rows.filter((item) => item.id !== product.id);
        if (!active) return;
        if (siblings.length >= 2) return;
      }
      if (product.category?.id) {
        await dispatch(fetchProducts({ category: product.category.id, page_size: 12 }));
      }
    };
    loadRelated();
    return () => { active = false; };
  }, [dispatch, product?.id, product?.category?.id, product?.subcategory?.id]);

  useEffect(() => {
    if (!product?.slug) return undefined;
    let active = true;
    setReviewsLoading(true);
    productsAPI.getReviews(product.slug)
      .then((response) => { if (active) setReviewPayload(response.data); })
      .catch(() => { if (active) setReviewPayload(null); })
      .finally(() => { if (active) setReviewsLoading(false); });
    return () => { active = false; };
  }, [product?.slug, reviewTick]);

  const variantList = useMemo(() => product?.variants || [], [product]);
  const groups = useMemo(() => selectionGroups(product), [product]);
  const shownGroups = useMemo(() => groups.map((group) => {
    const labels = availableLabels(group, groups, variantList, selected);
    return {
      ...group,
      values: group.values.filter((value) => labels.includes(value.label)),
    };
  }), [groups, variantList, selected]);

  useEffect(() => {
    setSelected((current) => {
      const next = {};
      groups.forEach((group) => {
        const labels = availableLabels(group, groups, variantList, current);
        const previous = current[group.name];
        if (previous && labels.includes(previous)) next[group.name] = previous;
        else if (labels.length === 1) next[group.name] = labels[0];
        else if (group.kind === 'swatch' && group.name.toLowerCase() === 'color' && labels[0]) next[group.name] = labels[0];
      });
      const unchanged = Object.keys(current).length === Object.keys(next).length
        && Object.keys(next).every((name) => current[name] === next[name]);
      return unchanged ? current : next;
    });
  }, [groups, variantList]);

  const chosen = useMemo(
    () => matchedVariant(groups, variantList, selected),
    [groups, variantList, selected],
  );
  const selectionReady = groups.filter((group) => group.required).every((group) => selected[group.name]);
  const stockLimit = chosen
    ? Number(chosen.stock_quantity)
    : selectionReady
      ? Number(product?.stock_quantity || 0)
      : variantList.reduce((max, variant) => Math.max(max, Number(variant.stock_quantity) || 0), 0);
  const displayPrice = chosen?.effective_price || chosen?.price || product?.price;
  const comparePrice = product?.compare_price === null || product?.compare_price === undefined || product?.compare_price === ''
    ? null
    : Number(product.compare_price);
  const priceNumber = Number(displayPrice);
  const hasDiscount = Number.isFinite(comparePrice) && Number.isFinite(priceNumber) && comparePrice > priceNumber;
  const savedAmount = hasDiscount ? Math.round(comparePrice - priceNumber) : 0;
  const discount = hasDiscount
    ? (Number(product?.discount_percentage) || Math.round(((comparePrice - priceNumber) / comparePrice) * 100))
    : 0;
  const outOfStock = variantList.length > 0
    ? (selectionReady ? !stockLimit : product?.is_out_of_stock)
    : product?.is_out_of_stock;
  const lowStock = chosen
    ? stockLimit > 0 && stockLimit <= Number(chosen.low_stock_threshold || 0)
    : Boolean(product?.is_low_stock) && !outOfStock;
  const stockState = outOfStock ? 'out' : lowStock ? 'low' : 'in';

  useEffect(() => {
    const sync = () => setSaved(product?.id ? readList(WISHLIST_KEY).includes(product.id) : false);
    sync();
    return subscribeLists(sync);
  }, [product?.id]);

  useEffect(() => {
    if (stockLimit > 0 && quantity > stockLimit) setQuantity(stockLimit);
  }, [stockLimit, quantity]);

  const chooseOption = (name, label) => {
    setSelected((current) => {
      const next = { ...current, [name]: label };
      groups.forEach((group) => {
        if (group.name === name) return;
        const labels = availableLabels(group, groups, variantList, next);
        if (next[group.name] && !labels.includes(next[group.name])) {
          next[group.name] = labels.length === 1 ? labels[0] : '';
        }
      });
      return next;
    });
    setQuantity(1);
  };

  const submitCart = (checkout) => {
    const missing = groups.find((group) => group.required && !selected[group.name]);
    if (missing) {
      toast.error(`Choose a ${missing.name.toLowerCase()}`);
      return;
    }
    if (!stockLimit) {
      toast.error('This option is out of stock');
      return;
    }
    setPending(checkout ? 'buy' : 'cart');
    dispatch(addToCart({
      product_id: product.id,
      variant_id: chosen?.id || null,
      quantity: Math.min(quantity, stockLimit),
    }))
      .unwrap()
      .then(() => {
        if (checkout) {
          router.push('/checkout');
          return;
        }
        setJustAdded(true);
        toast.success('Added to cart!');
        window.setTimeout(() => setJustAdded(false), 1400);
      })
      .catch((error) => {
        toast.error(error?.error || 'Failed to add to cart');
      })
      .finally(() => setPending(null));
  };

  const toggleSaved = () => {
    const result = toggleList(WISHLIST_KEY, product.id, 50);
    if (!result.ok) {
      toast.error('Your wishlist is full');
      return;
    }
    toast.success(result.added ? 'Saved to wishlist' : 'Removed from wishlist');
  };

  const openReviewsDesktop = () => {
    setTab('reviews');
    window.setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }, 40);
  };

  const pricePoints = product ? offerPrices(product) : [];
  const seoTitle = product ? productPriceTitle(product.name) : 'Product - PickOrbeet';
  const seoDescription = product
    ? productPriceDescription({
      name: product.name,
      price: displayPrice,
      inStock: !product.is_out_of_stock,
      summary: product.short_description || product.description,
    })
    : siteConfig.description;
  const productImage = product?.primary_image || product?.images?.[0]?.image || null;
  const absoluteProductImage = productImage ? getAbsoluteImageUrl(productImage) : '';
  const seoImage = product
    ? buildOgImageUrl({
      title: product.name,
      eyebrow: product.category?.name,
      price: displayPrice,
      image: absoluteProductImage,
    })
    : undefined;
  const seoProduct = product
    ? {
      name: product.name,
      description: seoDescription,
      price: displayPrice,
      prices: pricePoints.length ? pricePoints : [displayPrice],
      sku: product.sku,
      brand: productBrand(product),
      rating_average: product.rating_average,
      review_count: product.review_count,
      in_stock: !product.is_out_of_stock,
      images: product.images?.map((img) => getAbsoluteImageUrl(img.image)).filter(Boolean) || [],
      breadcrumbs: [
        { name: 'Home', path: '/' },
        product.category?.name ? { name: product.category.name, path: `/category/${product.category.slug}` } : null,
        product.subcategory?.name && product.category?.slug
          ? { name: product.subcategory.name, path: `/category/${product.category.slug}/${product.subcategory.slug}` }
          : null,
        { name: product.name, path: `/product/${product.slug}` },
      ].filter(Boolean),
    }
    : null;

  if (!product && phase === 'error') {
    return (
      <Layout title="Product - PickOrbeet" noindex frame="product">
        <ProductMobileBar />
        <div className="min-h-full bg-[#F4F7FC]">
          <div className="px-4 py-16 text-center lg:container-custom">
            <h1 className="text-xl font-bold text-charcoal-900">Product not found</h1>
            <p className="mt-2 text-charcoal-600">This product is unavailable or the link is incorrect.</p>
            <Link href="/products" className="mt-4 inline-flex h-10 items-center rounded-lg bg-action px-4 text-sm font-semibold text-white">
              Browse products
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout title="Product - PickOrbeet" noindex frame="product">
        <ProductMobileBar />
        <ProductDetailSkeleton />
      </Layout>
    );
  }

  const images = product.images?.length > 0
    ? product.images
    : [{ image: product.primary_image || '/images/placeholder.svg' }];
  const relatedProducts = products.filter((item) => item.id !== product.id).slice(0, 10);
  const relatedDesktop = relatedProducts.slice(0, 3);
  const rows = specificationRows(product);
  const reviewCount = Number(reviewPayload?.count ?? product.review_count) || 0;
  const average = reviewPayload?.average ?? product.rating_average ?? null;
  const crumbs = [
    { label: 'Home', href: '/' },
    product.category?.name ? { label: product.category.name, href: `/category/${product.category.slug}` } : null,
    product.subcategory?.name ? { label: product.subcategory.name, href: `/category/${product.category.slug}/${product.subcategory.slug}` } : null,
  ].filter(Boolean);

  const purchaseProps = {
    product,
    displayPrice,
    hasDiscount,
    comparePrice,
    savedAmount,
    discount,
    groups: shownGroups,
    selected,
    onSelect: chooseOption,
    quantity,
    onQuantity: setQuantity,
    stockLimit,
    stockState,
    average,
    reviewCount,
    onAdd: () => submitCart(false),
    onBuy: () => submitCart(true),
    pending,
    justAdded,
    purchaseDisabled: Boolean(outOfStock) || !stockLimit,
  };

  const galleryProps = {
    images,
    name: product.name,
    selected: Math.min(selectedImage, images.length - 1),
    onSelect: setSelectedImage,
    discount,
    official: Boolean(product.is_official),
    saved,
    onToggleSaved: toggleSaved,
  };

  return (
    <Layout
      title={seoTitle}
      description={seoDescription}
      image={seoImage}
      type="product"
      product={seoProduct}
      frame="product"
    >
      <ProductMobileBar />
      <div className="min-h-full bg-[#F4F7FC]">
        {/* Mobile Flutter stack */}
        <div className="px-4 pb-7 pt-2 lg:hidden">
          <motion.div {...riseProps(reduce, 0)}>
            <ProductGallery {...galleryProps} flat />
          </motion.div>
          <motion.div {...riseProps(reduce, 0.06)} className="mt-3.5">
            <ProductPurchase
              {...purchaseProps}
              flat
              onWriteReview={() => setReviewOpen(true)}
            />
          </motion.div>
          <motion.div {...riseProps(reduce, 0.1)} className="mt-4">
            <ProductDetailsSheet product={product} rows={rows} />
          </motion.div>
          {relatedProducts.length > 0 && (
            <motion.div {...riseProps(reduce, 0.14)} className="mt-4">
              <ProductRelated products={relatedProducts} categorySlug={product.category?.slug} rail />
            </motion.div>
          )}
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:block">
          <div className="container-custom py-4">
            <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-[13px] text-[#8B95A7]" aria-label="Breadcrumb">
              {crumbs.map((crumb) => (
                <span key={crumb.href} className="inline-flex items-center gap-1.5">
                  <Link href={crumb.href} className="hover:text-[#172033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2864E8]">
                    {crumb.label}
                  </Link>
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              ))}
              <span className="text-[#172033]">{product.name}</span>
            </nav>

            <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1.17fr)_minmax(0,1fr)]">
              <motion.div {...riseProps(reduce, 0)} className="min-w-0">
                <ProductGallery {...galleryProps} />
              </motion.div>
              <motion.div {...riseProps(reduce, 0.06)} className="min-w-0">
                <ProductPurchase
                  {...purchaseProps}
                  onWriteReview={openReviewsDesktop}
                />
              </motion.div>
            </div>
          </div>

          <motion.section
            ref={detailsRef}
            {...riseProps(reduce, 0.12)}
            className="scroll-mt-24 border-t border-[#E6ECF5] bg-white"
          >
            <div className={`container-custom grid items-start gap-x-8 gap-y-5 py-5 ${relatedDesktop.length ? 'lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)_minmax(240px,0.95fr)]' : 'lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)]'}`}>
              <div className="min-w-0 lg:col-span-2 lg:col-start-1 lg:row-start-1">
                <ProductInfoTabs
                  product={product}
                  rows={rows}
                  tab={tab}
                  onTab={setTab}
                  reviews={reviewPayload}
                  reviewsLoading={reviewsLoading}
                  onReviewsChanged={() => setReviewTick((value) => value + 1)}
                  reviewCount={reviewCount}
                />
              </div>
              {relatedDesktop.length > 0 && (
                <div className="min-w-0 lg:col-start-3 lg:row-span-2 lg:row-start-1">
                  <ProductRelated products={relatedDesktop} categorySlug={product.category?.slug} />
                </div>
              )}
            </div>
          </motion.section>
        </div>
      </div>

      <ProductReviewSheet
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        product={product}
        mine={reviewPayload?.mine || null}
        onSaved={() => setReviewTick((value) => value + 1)}
      />
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { slug } = context.params;

  try {
    const result = await fetchApi(`/products/${encodeURIComponent(slug)}/`);
    if (result.status === 404) return { notFound: true };
    if (!result.ok) return { props: { initialProduct: null } };
    return { props: { initialProduct: serializable(result.data) } };
  } catch (error) {
    return { props: { initialProduct: null } };
  }
}
