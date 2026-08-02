import { useEffect, useState } from 'react';

import { useParams } from 'react-router';

import { ApiError, productApi } from '@/api';
import type { Product } from '@/api/modules/product/types';
import SecondaryHeader from '@/components/features/SecondaryHeader';
import Skeleton from '@/components/ui/Skeleton';

export default function Page() {
  const { id } = useParams();
  const productId = Number(id);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!Number.isInteger(productId) || productId <= 0) {
      setError(true);
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    let active = true;

    const loadProduct = async () => {
      try {
        const data = await productApi.details(productId, controller.signal);
        if (active) setProduct(data);
      } catch (requestError) {
        if (requestError instanceof ApiError && requestError.kind === 'canceled') return;
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadProduct();

    return () => {
      active = false;
      controller.abort();
    };
  }, [productId]);

  return (
    <div className="flex flex-col bg-[#F4F5F7] text-[#202124]">
      <SecondaryHeader title="商品详情" />
      {loading ? <GoodsDetailSkeleton /> : null}
      {!loading && error ? (
        <main className="flex flex-1 items-center justify-center px-6 text-center">
          <div>
            <h2 className="text-lg font-bold">无法加载商品</h2>
            <p className="mt-2 text-sm leading-5 text-[#737780]">商品不存在或网络连接异常。</p>
          </div>
        </main>
      ) : null}
      {!loading && product ? <GoodsDetails product={product} /> : null}
    </div>
  );
}

function GoodsDetails({ product }: { product: Product }) {
  const galleryImage = product.images[0] ?? product.thumbnail;
  const specs = [
    { label: 'SKU', value: product.sku },
    { label: '库存', value: `${product.stock}` },
    { label: '发货', value: product.shippingInformation },
    { label: '售后', value: product.returnPolicy },
    { label: '质保', value: product.warrantyInformation },
    { label: '起订量', value: `${product.minimumOrderQuantity}` },
  ];

  return (
    <main className="pb-8">
      <section className="bg-white p-3" aria-label="商品图片">
        <div className="aspect-square overflow-hidden rounded-lg bg-[#F7F8F9] p-4">
          <img className="size-full object-contain" src={galleryImage} alt={product.title} />
        </div>
      </section>

      <section className="mt-3 bg-white px-4 py-5" aria-labelledby="product-title">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-[#EAF8F0] px-2 py-1 text-xs font-bold text-[#168653]">
            {formatCategory(product.category)}
          </span>
          {product.brand ? <span className="text-xs text-[#9297A1]">{product.brand}</span> : null}
        </div>
        <h1 id="product-title" className="mt-3 text-xl leading-7 font-black text-[#202124]">
          {product.title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#646A73]">{product.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <strong className="text-3xl leading-9 font-black text-[#168653]">
            ${product.price.toFixed(2)}
          </strong>
          <span className="rounded-md bg-[#FFF1F0] px-2 py-1 text-xs font-bold text-[#C6534C]">
            {product.discountPercentage.toFixed(0)}% OFF
          </span>
          <span className="text-xs text-[#737780]">评分 {product.rating.toFixed(1)}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-[#E1E4E8] bg-[#F7F8F9] px-2 py-1 text-xs text-[#646A73]"
            >
              #{tag}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-3 bg-white px-4 py-5" aria-labelledby="product-info-title">
        <h2 id="product-info-title" className="text-base leading-6 font-bold">
          商品信息
        </h2>
        <dl className="mt-3">
          {specs.map((item) => (
            <div
              key={item.label}
              className="flex min-h-12 items-center justify-between gap-5 border-b border-[#ECEEF1] last:border-b-0"
            >
              <dt className="shrink-0 text-sm text-[#737780]">{item.label}</dt>
              <dd className="text-right text-sm font-medium break-words text-[#30343B]">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {product.reviews.length > 0 ? (
        <section className="mt-3 bg-white px-4 py-5" aria-labelledby="reviews-title">
          <div className="flex items-center justify-between">
            <h2 id="reviews-title" className="text-base leading-6 font-bold">
              用户评价
            </h2>
            <span className="text-xs text-[#9297A1]">{product.reviews.length} 条</span>
          </div>
          <div className="mt-2 divide-y divide-[#ECEEF1]">
            {product.reviews.slice(0, 2).map((review) => (
              <article key={`${review.reviewerEmail}-${review.date}`} className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="truncate text-sm font-bold">{review.reviewerName}</span>
                  <span className="shrink-0 rounded-md bg-[#FFF7E8] px-2 py-1 text-xs font-bold text-[#A86A12]">
                    {review.rating}.0
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#646A73]">{review.comment}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function GoodsDetailSkeleton() {
  return (
    <main className="pb-8" aria-label="商品详情加载中">
      <section className="bg-white p-3">
        <Skeleton className="aspect-square rounded-lg" />
      </section>
      <section className="mt-3 space-y-3 bg-white px-4 py-5">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-9 w-32" />
      </section>
      <section className="mt-3 space-y-3 bg-white px-4 py-5">
        <Skeleton className="h-5 w-24" />
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </section>
    </main>
  );
}

function formatCategory(category: string) {
  return category
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
