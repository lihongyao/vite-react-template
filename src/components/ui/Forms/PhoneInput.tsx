import { forwardRef, useEffect, useId, useState } from 'react';
import type { ChangeEvent, FocusEvent } from 'react';

import Input from '@/components/ui/Forms/Input';
import type { InputProps } from '@/components/ui/Forms/Input';

export type PhoneValidator = (value: string, countryCode: string) => string | undefined;

export interface PhoneInputProps extends Omit<InputProps, 'inputMode' | 'prefix' | 'type'> {
  countryCode: string | number;
  iconSrc?: string;
  validate?: PhoneValidator;
  validateOn?: 'blur' | 'change';
}

const getInputValue = (value: InputProps['value']) =>
  value === undefined || value === null ? '' : String(value);

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  {
    countryCode,
    iconSrc = '/phone.png',
    validate,
    validateOn = 'blur',
    value,
    defaultValue,
    error,
    autoComplete = 'tel-national',
    onChange,
    onBlur,
    ...inputProps
  },
  ref,
) {
  const generatedId = useId();
  const normalizedCountryCode = String(countryCode).trim().replace(/^\+/, '');
  const [innerValue, setInnerValue] = useState(() => getInputValue(value ?? defaultValue));
  const [hasValidated, setHasValidated] = useState(false);
  const [validationError, setValidationError] = useState<string>();
  const currentValue = value === undefined ? innerValue : getInputValue(value);

  useEffect(() => {
    if (!hasValidated) return;
    setValidationError(validate?.(currentValue, normalizedCountryCode));
  }, [currentValue, hasValidated, normalizedCountryCode, validate]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (value === undefined) setInnerValue(event.currentTarget.value);
    if (validateOn === 'change') setHasValidated(true);
    onChange?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    setHasValidated(true);
    onBlur?.(event);
  };

  return (
    <Input
      ref={ref}
      {...inputProps}
      aria-describedby={[inputProps['aria-describedby'], `${generatedId}-country-code`]
        .filter(Boolean)
        .join(' ')}
      autoComplete={autoComplete}
      defaultValue={defaultValue}
      error={error !== undefined ? error : validationError}
      inputMode="tel"
      prefix={
        <span className="flex items-center gap-2">
          <img alt="" className="size-6" src={iconSrc} />
          <span
            id={`${generatedId}-country-code`}
            className="text-base leading-none font-medium text-[#374151]"
          >
            +{normalizedCountryCode}
          </span>
          <span aria-hidden className="ml-1 h-5 w-px bg-[#d1d5db]" />
        </span>
      }
      type="tel"
      value={value}
      onBlur={handleBlur}
      onChange={handleChange}
    />
  );
});

export default PhoneInput;
