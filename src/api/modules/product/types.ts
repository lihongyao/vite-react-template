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

export interface ProductListReq {
  limit?: number;
  select?: string;
  skip?: number;
}

export interface ProductListRes {
  limit: number;
  products: Product[];
  skip: number;
  total: number;
}

export interface ProductDetailReq {
  id: Product['id'];
}

export type ProductDetailRes = Product;
