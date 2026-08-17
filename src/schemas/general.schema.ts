/**
 *
 * pnpm add zod react-hook-form @hookform/resolvers
 */
import { z } from 'zod';

/** 手机号（巴西地区）- 11位数字，格式：AA9XXXXXXXX */
export const z_phone_br = z
  .string()
  .trim()
  .min(1, {
    message: 'common.whtsapp_number_paceholder',
  })
  .regex(/^(?!([0-9])\1{10}$)[1-9]{2}9\d{8}$/, {
    message: 'common.whtsapp_number_error',
  });

/** 手机号（墨西哥地区）- 10位数字，不能为重复数字 */
export const z_phone_mx = z
  .string()
  .trim()
  .min(1, {
    message: 'common.whtsapp_number_paceholder',
  })
  .regex(/^(?!([0-9])\1{9}$)\d{10}$/, {
    message: 'Please enter a valid Mexico phone number',
  });

/** 手机号（秘鲁地区）- 9位数字 + 9开头 */
export const z_phone_pe = z
  .string()
  .trim()
  .min(1, {
    message: 'common.whtsapp_number_paceholder',
  })
  .regex(/^9\d{8}$/, {
    message: 'common.whtsapp_number_error',
  });

/** 手机号（智利地区）- 9位数字，以 9 开头 */
export const z_phone_cl = z
  .string()
  .trim()
  .min(1, {
    message: 'common.whtsapp_number_paceholder',
  })
  .regex(/^9\d{8}$/, {
    message: 'common.whtsapp_number_error',
  });

/** 手机号（尼日利亚地区）- 10位数字，以 7/8/9 开头 */
export const z_phone_ng = z
  .string()
  .trim()
  .min(1, {
    message: 'common.whtsapp_number_paceholder',
  })
  .regex(/^[789]\d{9}$/, {
    message: 'common.whtsapp_number_error',
  });

/** 手机号（阿根廷地区）- 10位数字 */
export const z_phone_ar = z
  .string()
  .trim()
  .min(1, {
    message: 'common.whtsapp_number_paceholder',
  })
  .regex(/^\d{10}$/, {
    message: 'common.whtsapp_number_error',
  });

/** 手机号（哥伦比亚地区）- 10位数字，以 3 开头 */
export const z_phone_co = z
  .string()
  .trim()
  .min(1, {
    message: 'common.whtsapp_number_paceholder',
  })
  .regex(/^3\d{9}$/, {
    message: 'common.whtsapp_number_error',
  });

/** 手机号（厄瓜多尔地区）- 9位数字，以 9 开头 */
export const z_phone_ec = z
  .string()
  .trim()
  .min(1, {
    message: 'common.whtsapp_number_paceholder',
  })
  .regex(/^9\d{8}$/, {
    message: 'common.whtsapp_number_error',
  });
