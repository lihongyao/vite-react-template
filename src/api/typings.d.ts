declare namespace API {
  interface ListParams {
    page?: number;
    size?: number;
    [__prop__: string]: unknown;
  }
  interface ListResponse<T> {
    items: T[];
    current: number;
    size: number;
    total_items: number;
    total_pages: number;
  }
}
