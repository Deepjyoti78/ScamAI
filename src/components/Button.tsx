import React from 'react';
import { cn } from '../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-400 cursor-pointer select-none whitespace-nowrap';

    const variants = {
      primary:
        'bg-[#111110] text-white hover:bg-[#282826] active:bg-[#000000] border border-[#111110] shadow-[0_1px_2px_rgba(0,0,0,0.06)]',
      secondary:
        'bg-white text-[#111110] border border-[#d0d0cc] hover:bg-[#f7f7f6] active:bg-[#ededeb]',
      ghost:
        'bg-transparent text-[#555552] hover:text-[#111110] hover:bg-[#f7f7f6] border border-transparent',
    };

    const sizes = {
      sm: 'text-[13px] px-3.5 py-1.5 gap-1.5 rounded-[4px] h-[34px]',
      md: 'text-[14px] px-4 py-2 gap-2 rounded-[4px] h-[40px]',
      lg: 'text-[14px] font-medium px-5 py-2.5 gap-2 rounded-[4px] h-[44px]',
    };

    return (
      <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
