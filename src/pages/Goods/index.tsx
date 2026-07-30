import { useEffect, useState } from 'react';

import { generatePath } from 'react-router';

import { ApiError, productApi } from '@/api';
import type { Product } from '@/api/modules/product/types';
import Skeleton from '@/components/ui/Skeleton';
import { LocalizedLink } from '@/i18n/links';
import { ROUTE_PATHS } from '@/routes/paths';

const PRODUCT_SELECT = [
  'id',
  'title',
  'price',
  'discountPercentage',
  'rating',
  'stock',
  'availabilityStatus',
  'brand',
  'category',
  'thumbnail',
].join(',');

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const loadProducts = async () => {
      try {
        const data = await productApi.list(
          { limit: 20, select: PRODUCT_SELECT },
          controller.signal,
        );
        if (active) {
          setProducts(data.products);
        }
      } catch (requestError) {
        if (requestError instanceof ApiError && requestError.kind === 'canceled') return;
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadProducts();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return (
    <main className="min-h-full bg-[#F4F5F7] px-3 pt-5 pb-6 text-[#202124]">
      <section aria-labelledby="goods-title">
        <div className="flex items-end justify-between gap-4 px-1">
          <div>
            <p className="text-xs leading-4 font-bold text-[#168653] uppercase">Goods</p>
            <h1 id="goods-title" className="mt-1 text-2xl leading-8 font-black">
              商品精选
            </h1>
            <p className="mt-1 text-sm leading-5 text-[#737780]">发现值得加入清单的日常好物。</p>
          </div>
          {!loading && !error ? (
            <span className="mb-0.5 shrink-0 text-xs text-[#9297A1]">{products.length} 件</span>
          ) : null}
        </div>

        {loading ? <GoodsSkeleton /> : null}

        {!loading && error ? (
          <div className="mt-5 flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed border-[#D8DBE0] bg-white px-6 text-center">
            <h2 className="text-base font-bold">商品加载失败</h2>
            <p className="mt-1 text-sm leading-5 text-[#737780]">请检查网络连接后重新进入页面。</p>
          </div>
        ) : null}

        {!loading && !error && products.length === 0 ? (
          <div className="mt-5 flex min-h-52 items-center justify-center rounded-lg bg-white text-sm text-[#737780]">
            暂无商品
          </div>
        ) : null}

        {!loading && !error && products.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-3">
            {products.map((product) => (
              <GoodsCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}

function GoodsCard({ product }: { product: Product }) {
  const discount = product.discountPercentage ?? 0;
  const originalPrice = discount > 0 ? product.price / (1 - discount / 100) : undefined;

  return (
    <LocalizedLink
      to={generatePath(ROUTE_PATHS.GoodsDetail, { id: String(product.id) })}
      className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-[#E7E9EC] bg-white transition outline-none focus-visible:border-[#168653] focus-visible:ring-2 focus-visible:ring-[#168653]/20 active:scale-[0.98]"
    >
      <div className="relative aspect-square overflow-hidden bg-[#F7F8F9] p-2">
        <img
          src={product.thumbnail}
          alt={product.title}
          loading="lazy"
          decoding="async"
          className="size-full object-contain"
        />
        {discount > 0 ? (
          <span className="absolute top-2 left-2 rounded-md bg-[#168653] px-1.5 py-1 text-[10px] leading-none font-extrabold text-white">
            -{Math.round(discount)}%
          </span>
        ) : null}
      </div>

      <div className="flex min-h-[126px] flex-1 flex-col p-3">
        <span className="truncate text-[11px] leading-4 font-semibold text-[#9297A1]">
          {product.brand ?? formatCategory(product.category)}
        </span>
        <h2 className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 font-bold text-[#30343B]">
          {product.title}
        </h2>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] leading-4 text-[#737780]">
          <span>评分 {product.rating.toFixed(1)}</span>
          <span aria-hidden className="size-0.5 rounded-full bg-[#B7BBC2]" />
          <span>{formatAvailability(product.availabilityStatus)}</span>
        </div>
        <div className="mt-auto flex min-w-0 items-end gap-1.5 pt-3">
          <strong className="text-lg leading-5 font-black text-[#168653]">
            {formatPrice(product.price)}
          </strong>
          {originalPrice ? (
            <span className="truncate text-[10px] leading-4 text-[#A4A8AF] line-through">
              {formatPrice(originalPrice)}
            </span>
          ) : null}
        </div>
      </div>
    </LocalizedLink>
  );
}

function GoodsSkeleton() {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3" aria-label="商品加载中">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-lg border border-[#E7E9EC] bg-white">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="space-y-2 p-3">
            <Skeleton className="h-3 w-2/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-5 w-3/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

function formatCategory(category: string) {
  return category
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatAvailability(status: string) {
  if (status.toLowerCase().includes('out')) return '缺货';
  if (status.toLowerCase().includes('low')) return '库存较少';
  return '有货';
}
