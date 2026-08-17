import type { ZodString } from 'zod';

import {
  z_phone_ar,
  z_phone_br,
  z_phone_cl,
  z_phone_co,
  z_phone_ec,
  z_phone_mx,
  z_phone_ng,
  z_phone_pe,
} from '@/schemas/general.schema';

// 手机号配置
export const PhoneConfigs: Record<string, { maxLength: number; schema: ZodString }> = {
  51: { maxLength: 9, schema: z_phone_pe },
  52: { maxLength: 10, schema: z_phone_mx },
  54: { maxLength: 10, schema: z_phone_ar },
  55: { maxLength: 11, schema: z_phone_br },
  56: { maxLength: 9, schema: z_phone_cl },
  57: { maxLength: 10, schema: z_phone_co },
  593: { maxLength: 9, schema: z_phone_ec },
  234: { maxLength: 10, schema: z_phone_ng },
};
