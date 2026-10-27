import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { motion, useReducedMotion } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductDetailSkeleton from '@/components/loading/ProductDetailSkeleton';
import ProductGallery from '@/components/product/ProductGallery';
import ProductInfoTabs from '@/components/product/ProductInfoTabs';
import ProductPurchase from '@/components/product/ProductPurchase';
import ProductRelated from '@/components/product/ProductRelated';
import { riseProps } from '@/components/product/motion';
import { useBootGate } from '@/components/loading/LoadingProvider';
import { fetchProduct, fetchProducts, clearProduct } from '@/store/slices/productsSlice';
import { addToCart } from '@/store/slices/cartSlice';
import { readList, subscribeLists, toggleList, WISHLIST_KEY } from '@/lib/productLists';
import { productsAPI } from '@/lib/api';
import siteConfig, { buildOgImageUrl, getAbsoluteImageUrl, getMediaUrl } from '@/lib/siteConfig';

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
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(null);
  const [justAdded, setJustAdded] = useState(false);
  const [tab, setTab] = useState('description');
  const [reviewPayload, setReviewPayload] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewTick, setReviewTick] = useState(0);

  useEffect(() => {
    setSelectedImage(0);
    setSelectedSize('');
    setSelectedColor('');
    setQuantity(1);
    setTab('description');
    setReviewPayload(null);
    setJustAdded(false);
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
    if (product?.category?.id) {
      dispatch(fetchProducts({ category: product.category.id, page_size: 8 }));
    }
  }, [dispatch, product?.category?.id]);

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

  const variantList = product?.variants || [];
  const sizes = useMemo(
    () => [...new Set(variantList.map((variant) => variant.size))].filter(Boolean),
    [variantList],
  );
  const colors = useMemo(
    () => [...new Set(
      variantList
        .filter((variant) => !selectedSize || variant.size === selectedSize)
        .map((variant) => variant.color),
    )].filter(Boolean),
    [variantList, selectedSize],
  );
  const colorChoices = useMemo(
    () => (colors.length ? colors : (product?.color ? [product.color] : [])),
    [colors, product?.color],
  );

  useEffect(() => {
    if (selectedColor && colorChoices.includes(selectedColor)) return;
    if (colorChoices.length) setSelectedColor(colorChoices[0]);
  }, [colorChoices, selectedColor]);

  const selectionReady = (!sizes.length || Boolean(selectedSize)) && (!colorChoices.length || Boolean(selectedColor));
  const matchedVariant = selectionReady
    ? variantList.find((variant) => (
      (!sizes.length || variant.size === selectedSize)
      && (!colorChoices.length || variant.color === selectedColor)
    ))
    : null;
  const stockLimit = matchedVariant
    ? Number(matchedVariant.stock_quantity)
    : selectionReady
      ? Number(product?.stock_quantity || 0)
      : variantList.reduce((max, variant) => Math.max(max, Number(variant.stock_quantity) || 0), 0);
  const displayPrice = matchedVariant?.effective_price || matchedVariant?.price || product?.price;
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
  const lowStock = matchedVariant
    ? stockLimit > 0 && stockLimit <= Number(matchedVariant.low_stock_threshold || 0)
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

  const submitCart = (checkout) => {
    if (sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (colorChoices.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }
    if (!stockLimit) {
      toast.error('This option is out of stock');
      return;
    }
    setPending(checkout ? 'buy' : 'cart');
    dispatch(addToCart({
      product_id: product.id,
      variant_id: matchedVariant?.id || null,
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

  const openReviews = () => {
    setTab('reviews');
    window.setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }, 40);
  };

  const seoTitle = product ? `${product.name} - PickOrbeet` : 'Product - PickOrbeet';
  const seoDescription = product
    ? (product.short_description || product.description?.replace(/<[^>]*>/g, '')?.slice(0, 160) || `Buy ${product.name} at PickOrbeet.`)
    : siteConfig.description;
  const productImage = product?.primary_image || product?.images?.[0]?.image || null;
  const absoluteProductImage = productImage ? getAbsoluteImageUrl(productImage) : '';
  const seoImage = product
    ? buildOgImageUrl({
      title: product.name,
      eyebrow: product.category?.name,
      price: product.price,
      image: absoluteProductImage,
    })
    : undefined;
  const seoProduct = product
    ? {
      name: product.name,
      description: seoDescription,
      price: product.price,
      sku: product.sku,
      in_stock: !product.is_out_of_stock,
      images: product.images?.map((img) => getAbsoluteImageUrl(img.image)) || [seoImage],
    }
    : null;

  if (!product && phase === 'error') {
    return (
      <Layout title="Product - Pickorbeet">
        <div className="min-h-full bg-[#F4F7FC]">
          <div className="container-custom py-16 text-center">
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
      <Layout title="Product - Pickorbeet">
        <ProductDetailSkeleton />
      </Layout>
    );
  }

  const images = product.images?.length > 0
    ? product.images
    : [{ image: product.primary_image || '/images/placeholder.svg' }];
  const relatedProducts = products.filter((item) => item.id !== product.id).slice(0, 3);
  const rows = specificationRows(product);
  const reviewCount = Number(reviewPayload?.count ?? product.review_count) || 0;
  const average = reviewPayload?.average ?? product.rating_average ?? null;
  const crumbs = [
    { label: 'Home', href: '/' },
    product.category?.name ? { label: product.category.name, href: `/category/${product.category.slug}` } : null,
    product.subcategory?.name ? { label: product.subcategory.name, href: `/category/${product.category.slug}/${product.subcategory.slug}` } : null,
  ].filter(Boolean);

  return (
    <Layout
      title={seoTitle}
      description={seoDescription}
      image={seoImage}
      type="product"
      product={seoProduct}
    >
      <div className="min-h-full bg-[#F4F7FC]">
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
              <ProductGallery
                images={images}
                name={product.name}
                selected={Math.min(selectedImage, images.length - 1)}
                onSelect={setSelectedImage}
                discount={discount}
                saved={saved}
                onToggleSaved={toggleSaved}
              />
            </motion.div>
            <motion.div {...riseProps(reduce, 0.06)} className="min-w-0">
              <ProductPurchase
                product={product}
                displayPrice={displayPrice}
                hasDiscount={hasDiscount}
                comparePrice={comparePrice}
                savedAmount={savedAmount}
                discount={discount}
                colors={colorChoices}
                sizes={sizes}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
                onColor={(color) => {
                  setSelectedColor(color);
                  setQuantity(1);
                }}
                onSize={(size) => {
                  setSelectedSize(size);
                  setSelectedColor('');
                  setQuantity(1);
                }}
                quantity={quantity}
                onQuantity={setQuantity}
                stockLimit={stockLimit}
                stockState={stockState}
                average={average}
                reviewCount={reviewCount}
                onWriteReview={openReviews}
                onAdd={() => submitCart(false)}
                onBuy={() => submitCart(true)}
                pending={pending}
                justAdded={justAdded}
                purchaseDisabled={Boolean(outOfStock) || !stockLimit}
              />
            </motion.div>
          </div>
        </div>

        <motion.section
          ref={detailsRef}
          {...riseProps(reduce, 0.12)}
          className="scroll-mt-24 border-t border-[#E6ECF5] bg-white"
        >
          <div className={`container-custom grid items-start gap-x-8 gap-y-5 py-5 ${relatedProducts.length ? 'lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)_minmax(240px,0.95fr)]' : 'lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)]'}`}>
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
            {relatedProducts.length > 0 && (
              <div className="min-w-0 lg:col-start-3 lg:row-span-2 lg:row-start-1">
                <ProductRelated products={relatedProducts} categorySlug={product.category?.slug} />
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://server.pickorbeet.com/api/v1';

  try {
    const res = await fetch(`${API_BASE_URL}/products/${slug}/`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      return { props: { initialProduct: null } };
    }

    const product = await res.json();
    return { props: { initialProduct: product } };
  } catch (error) {
    return { props: { initialProduct: null } };
  }
}
