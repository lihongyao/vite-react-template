import { forwardRef, useCallback, useId, useRef, useState } from 'react';
import type { ChangeEvent, ComponentPropsWithoutRef, ReactNode } from 'react';

import { cn } from '@/libs/class-helpers';

type NativeInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'prefix'>;

export interface InputProps extends NativeInputProps {
  prefix?: ReactNode;
  suffix?: ReactNode;
  error?: ReactNode;
  allowClear?: boolean;
  rootClassName?: string;
  wrapperClassName?: string;
  errorClassName?: string;
  onClear?: () => void;
}

const hasInputValue = (value: NativeInputProps['value']) =>
  value !== undefined && value !== null && String(value).length > 0;

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    prefix,
    suffix,
    error,
    allowClear = false,
    rootClassName,
    wrapperClassName,
    errorClassName,
    className,
    defaultValue,
    value,
    disabled,
    readOnly,
    onChange,
    onClear,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...inputProps
  },
  forwardedRef,
) {
  const generatedId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const hasError = error !== undefined && error !== null && error !== false && error !== '';
  const hasValue = hasInputValue(value === undefined ? uncontrolledValue : value);
  const errorId = `${generatedId}-error`;
  const describedBy = [ariaDescribedBy, hasError ? errorId : undefined].filter(Boolean).join(' ');

  const setInputRef = useCallback(
    (input: HTMLInputElement | null) => {
      inputRef.current = input;
      if (typeof forwardedRef === 'function') forwardedRef(input);
      else if (forwardedRef) forwardedRef.current = input;
    },
    [forwardedRef],
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (value === undefined) setUncontrolledValue(event.currentTarget.value);
    onChange?.(event);
  };

  const handleClear = () => {
    const input = inputRef.current;
    if (!input || disabled || readOnly || input.value.length === 0) return;

    Reflect.set(HTMLInputElement.prototype, 'value', '', input);
    setUncontrolledValue('');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus({ preventScroll: true });
    onClear?.();
  };

  return (
    <div className={cn('w-full', rootClassName)}>
      <div
        className={cn(
          'flex h-11 w-full items-center gap-2 rounded-lg border border-[#d1d5db] bg-white px-3 text-[#1f2937] transition-colors focus-within:border-[#16a34a]',
          hasError && 'border-[#dc2626] focus-within:border-[#dc2626]',
          disabled && 'cursor-not-allowed bg-[#f3f4f6] text-[#9ca3af]',
          wrapperClassName,
        )}
      >
        {prefix !== undefined && prefix !== null ? (
          <span className="flex shrink-0 items-center text-[#6b7280]">{prefix}</span>
        ) : null}

        <input
          ref={setInputRef}
          {...inputProps}
          aria-describedby={describedBy || undefined}
          aria-invalid={hasError || ariaInvalid || undefined}
          className={cn(
            'h-full min-w-0 flex-1 bg-transparent text-base text-inherit outline-none placeholder:text-[#9ca3af] disabled:cursor-not-allowed',
            className,
          )}
          defaultValue={defaultValue}
          disabled={disabled}
          readOnly={readOnly}
          value={value}
          onChange={handleChange}
        />

        {allowClear && hasValue && !disabled && !readOnly ? (
          <button
            type="button"
            aria-label="Clear input"
            className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#d1d5db] text-white transition-colors outline-none hover:bg-[#9ca3af] focus-visible:ring-2 focus-visible:ring-[#16a34a] focus-visible:ring-offset-1"
            onClick={handleClear}
            onMouseDown={(event) => event.preventDefault()}
          >
            <span
              aria-hidden
              className="relative block size-2.5 before:absolute before:top-1/2 before:left-0 before:h-[1.5px] before:w-full before:-translate-y-1/2 before:rotate-45 before:rounded-full before:bg-current before:content-[''] after:absolute after:top-1/2 after:left-0 after:h-[1.5px] after:w-full after:-translate-y-1/2 after:-rotate-45 after:rounded-full after:bg-current after:content-['']"
            />
          </button>
        ) : null}

        {suffix !== undefined && suffix !== null ? (
          <span className="flex shrink-0 items-center text-[#6b7280]">{suffix}</span>
        ) : null}
      </div>

      {hasError ? (
        <div
          id={errorId}
          role="alert"
          className={cn('mt-1.5 text-sm leading-5 text-[#dc2626]', errorClassName)}
        >
          {error}
        </div>
      ) : null}
    </div>
  );
});

export default Input;
