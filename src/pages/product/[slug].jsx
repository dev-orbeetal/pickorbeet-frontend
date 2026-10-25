import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Minus, Plus, Check, Truck, RotateCcw, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import ProductGrid from '@/components/products/ProductGrid';
import ProductDetailSkeleton from '@/components/loading/ProductDetailSkeleton';
import { useBootGate } from '@/components/loading/LoadingProvider';
import { fetchProduct, fetchProducts, clearProduct } from '@/store/slices/productsSlice';
import { addToCart } from '@/store/slices/cartSlice';
import { readList, subscribeLists, toggleList, WISHLIST_KEY } from '@/lib/productLists';
import siteConfig, { buildOgImageUrl, getAbsoluteImageUrl, getMediaUrl } from '@/lib/siteConfig';

export default function ProductDetailPage({ initialProduct }) {
  const router = useRouter();
  const { slug } = router.query;
  const dispatch = useDispatch();

  const { product: storeProduct, products } = useSelector((state) => state.products);
  const product = storeProduct || initialProduct;

  const [phase, setPhase] = useState(initialProduct ? 'ready' : 'loading');
  useBootGate(phase === 'loading' && !product);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(false);

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
      dispatch(fetchProducts({ category: product.category.id, page_size: 4 }));
    }
  }, [dispatch, product]);

  const variants = product?.variants || [];
  const sizes = [...new Set(variants.map((variant) => variant.size))].filter(Boolean);
  const colors = [...new Set(
    variants
      .filter((variant) => !selectedSize || variant.size === selectedSize)
      .map((variant) => variant.color),
  )].filter(Boolean);
  const matchedVariant = variants.find((variant) => (
    (!sizes.length || variant.size === selectedSize)
    && (!colors.length || variant.color === selectedColor)
  ));
  const stockLimit = matchedVariant
    ? Number(matchedVariant.stock_quantity)
    : Number(product?.stock_quantity || 0);
  const displayPrice = matchedVariant?.effective_price || matchedVariant?.price || product?.price;
  const outOfStock = variants.length > 0
    ? (sizes.length && !selectedSize) || (colors.length && !selectedColor)
      ? product?.is_out_of_stock
      : !stockLimit
    : product?.is_out_of_stock;

  useEffect(() => {
    const sync = () => setSaved(product?.id ? readList(WISHLIST_KEY).includes(product.id) : false);
    sync();
    return subscribeLists(sync);
  }, [product?.id]);

  useEffect(() => {
    if (stockLimit > 0 && quantity > stockLimit) setQuantity(stockLimit);
  }, [stockLimit, quantity]);

  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }
    if (!stockLimit) {
      toast.error('This option is out of stock');
      return;
    }

    dispatch(addToCart({
      product_id: product.id,
      variant_id: matchedVariant?.id || null,
      quantity: Math.min(quantity, stockLimit),
    }))
      .unwrap()
      .then(() => {
        toast.success('Added to cart!');
      })
      .catch((error) => {
        toast.error(error?.error || 'Failed to add to cart');
      });
  };

  // SEO data derived from server-side fetched product
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
        <div className="container-custom py-16 text-center">
          <h1 className="text-xl font-bold text-charcoal-900">Product not found</h1>
          <p className="mt-2 text-charcoal-600">This product is unavailable or the link is incorrect.</p>
          <Link href="/products" className="mt-4 inline-flex h-10 items-center rounded-lg bg-action px-4 text-sm font-semibold text-white">
            Browse products
          </Link>
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
    : [{ image: product.primary_image || '/images/placeholder.jpg' }];

  const relatedProducts = products.filter(p => p.id !== product.id).slice(0, 4);

  return (
    <Layout
      title={seoTitle}
      description={seoDescription}
      image={seoImage}
      type="product"
      product={seoProduct}
    >
      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-secondary-500 mb-8">
          <span className="hover:text-primary-600 cursor-pointer" onClick={() => router.push('/')}>
            Home
          </span>
          <span className="mx-2">/</span>
          <span
            className="hover:text-primary-600 cursor-pointer"
            onClick={() => router.push(`/category/${product.category?.slug}`)}
          >
            {product.category?.name}
          </span>
          <span className="mx-2">/</span>
          <span className="text-secondary-900">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square rounded-2xl overflow-hidden bg-gray-100"
            >
              <img
                src={getMediaUrl(images[selectedImage]?.image)}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === index ? 'border-primary-600' : 'border-transparent'
                      }`}
                  >
                    <img
                      src={getMediaUrl(img.image)}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <p className="text-sm text-primary-600 font-medium uppercase tracking-wider mb-2">
                {product.category?.name}
              </p>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-secondary-900 mb-4">
                {product.name}
              </h1>

              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-primary-600">
                  ৳{parseFloat(displayPrice).toLocaleString()}
                </span>
                {product.compare_price && product.compare_price > product.price && (
                  <>
                    <span className="text-xl text-secondary-400 line-through">
                      ৳{parseFloat(product.compare_price).toLocaleString()}
                    </span>
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded">
                      -{product.discount_percentage}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.is_out_of_stock ? (
                  <span className="inline-flex items-center text-red-600 font-medium">
                    <span className="w-2 h-2 bg-red-600 rounded-full mr-2" />
                    Out of Stock
                  </span>
                ) : product.is_low_stock ? (
                  <span className="inline-flex items-center text-orange-600 font-medium">
                    <span className="w-2 h-2 bg-orange-600 rounded-full mr-2" />
                    Only {product.stock_quantity} left
                  </span>
                ) : (
                  <span className="inline-flex items-center text-green-600 font-medium">
                    <Check className="w-4 h-4 mr-1" />
                    In Stock
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {product.short_description && (
              <p className="text-secondary-600 mb-6 leading-relaxed">
                {product.short_description}
              </p>
            )}

            {sizes.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-secondary-900 mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSize(size);
                        setSelectedColor('');
                        setQuantity(1);
                      }}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${selectedSize === size
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-secondary-700 border-gray-300 hover:border-primary-600'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {colors.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-secondary-900 mb-3">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        setSelectedColor(color);
                        setQuantity(1);
                      }}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${selectedColor === color
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-secondary-700 border-gray-300 hover:border-primary-600'
                        }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-medium text-secondary-900 mb-3">Quantity</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(stockLimit > 0 ? Math.min(stockLimit, quantity + 1) : quantity)}
                    disabled={!stockLimit || quantity >= stockLimit}
                    className="p-3 hover:bg-gray-100 transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {stockLimit > 0 && <span className="text-sm text-secondary-500">{stockLimit} available</span>}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={outOfStock || !stockLimit}
                className="flex-1 btn btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const result = toggleList(WISHLIST_KEY, product.id, 50);
                  if (!result.ok) {
                    toast.error('Your wishlist is full');
                    return;
                  }
                  toast.success(result.added ? 'Saved to wishlist' : 'Removed from wishlist');
                }}
                className={`btn btn-outline flex items-center justify-center space-x-2 ${saved ? 'border-primary-600 text-primary-700' : ''}`}
              >
                <Heart className={`w-5 h-5 ${saved ? 'fill-current text-primary-600' : ''}`} />
                <span>{saved ? 'Saved' : 'Wishlist'}</span>
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-b">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto text-primary-600 mb-2" />
                <p className="text-xs text-secondary-600">Fast Delivery</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 mx-auto text-primary-600 mb-2" />
                <p className="text-xs text-secondary-600">Easy Returns</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto text-primary-600 mb-2" />
                <p className="text-xs text-secondary-600">Secure Payment</p>
              </div>
            </div>

            {/* Full Description */}
            {product.description && (
              <div className="mt-8">
                <h3 className="font-semibold text-secondary-900 mb-4">Product Details</h3>
                <div
                  className="text-secondary-600 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-display font-semibold text-secondary-900 mb-8">
              Related Products
            </h2>
            <ProductGrid>
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </ProductGrid>
          </section>
        )}
      </div>
    </Layout>
  );
}

/**
 * Server-side fetch product data so that OG meta tags are present
 * in the initial HTML response — required for social media crawlers
 * (WhatsApp, Facebook, Twitter, LinkedIn, Telegram).
 */
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
