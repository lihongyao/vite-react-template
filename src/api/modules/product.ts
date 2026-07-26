import { request } from '../client';

const PRODUCT_API_URL = 'https://dummyjson.com/products';

export interface ProductDimensions {
  depth: number;
  height: number;
  width: number;
}

export interface ProductMeta {
  barcode: string;
  createdAt: string;
  qrCode: string;
  updatedAt: string;
}

export interface ProductReview {
  comment: string;
  date: string;
  rating: number;
  reviewerEmail: string;
  reviewerName: string;
}

export interface Product {
  availabilityStatus: string;
  brand?: string;
  category: string;
  description: string;
  dimensions: ProductDimensions;
  discountPercentage: number;
  id: number;
  images: string[];
  meta: ProductMeta;
  minimumOrderQuantity: number;
  price: number;
  rating: number;
  returnPolicy: string;
  reviews: ProductReview[];
  shippingInformation: string;
  sku: string;
  stock: number;
  tags: string[];
  thumbnail: string;
  title: string;
  warrantyInformation: string;
  weight: number;
}

export interface ProductListParams {
  limit?: number;
  select?: string;
  skip?: number;
}

export interface ProductListResponse {
  limit: number;
  products: Product[];
  skip: number;
  total: number;
}

export function list(params?: ProductListParams, signal?: AbortSignal) {
  return request<ProductListResponse>({
    params,
    responseMode: 'json',
    signal,
    skipAuth: true,
    url: PRODUCT_API_URL,
  });
}

export function details(id: number, signal?: AbortSignal) {
  return request<Product>({
    responseMode: 'json',
    signal,
    skipAuth: true,
    url: `${PRODUCT_API_URL}/${id}`,
  });
}
