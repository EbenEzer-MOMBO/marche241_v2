'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ShopCtaButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'card' | 'md' | 'lg';
  fullWidth?: boolean;
}

const sizeClasses = {
  card: 'h-11 sm:h-[38px] text-[13.5px]',
  md: 'h-12 text-[14px]',
  lg: 'h-[50px] text-[15px]',
};

export const ShopCtaButton = ({
  children,
  variant = 'primary',
  size = 'card',
  fullWidth = true,
  className = '',
  disabled,
  style,
  ...props
}: ShopCtaButtonProps) => {
  const base =
    `inline-flex items-center justify-center rounded-[9px] font-semibold transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#17181a]/40 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

  if (variant === 'secondary') {
    return (
      <button
        type="button"
        disabled={disabled}
        className={`${base} border-[1.5px] border-[#17181a] text-[#17181a] bg-white hover:opacity-80`}
        style={style}
        {...props}
      >
        {children}
      </button>
    );
  }

  if (variant === 'ghost') {
    return (
      <button
        type="button"
        disabled={disabled}
        className={`${base} border border-[#e6e4df] text-[#3c4045] bg-white hover:opacity-80`}
        style={style}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      className={`${base} hover:opacity-90`}
      style={{
        backgroundColor: 'var(--color-shop-primary, var(--primary-color))',
        color: 'var(--shop-cta-fg, #fff)',
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
};
