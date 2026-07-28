import { request } from '../../client';
import type { ProductDetailReq, ProductDetailRes, ProductListReq, ProductListRes } from './types';

export type * from './types';

const PRODUCT_API_URL = 'https://dummyjson.com/products';

export function list(params?: ProductListReq, signal?: AbortSignal) {
  return request<ProductListRes>({
    params,
    responseMode: 'json',
    signal,
    skipAuth: true,
    url: PRODUCT_API_URL,
  });
}

export function details(id: ProductDetailReq['id'], signal?: AbortSignal) {
  return request<ProductDetailRes>({
    responseMode: 'json',
    signal,
    skipAuth: true,
    url: `${PRODUCT_API_URL}/${id}`,
  });
}
