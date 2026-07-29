export type BrandConfig = {
  label: string;
  appId: string;
  apiBaseUrl: string;
};

export const brands: Record<string, BrandConfig> = {
  afun: {
    label: 'Afun',
    appId: '12001',
    apiBaseUrl: 'https://api-afun.example.com',
  },
  bfun: {
    label: 'Bfun',
    appId: '12002',
    apiBaseUrl: 'https://api-bfun.example.com',
  },
};
