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
      'inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98] active:translate-y-[0.5px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-400 cursor-pointer select-none whitespace-nowrap';

    const variants = {
      primary:
        'bg-[#141413] text-[#FAF9F5] hover:bg-[#30302D] active:bg-[#141413] border border-[#141413] shadow-[0_1px_2px_rgba(20,20,19,0.06)]',
      secondary:
        'bg-[#FAF9F5] text-[#141413] border border-[#D7D4C9] hover:bg-[#F0EEE6] active:bg-[#E8E6DC]',
      ghost:
        'bg-transparent text-[#625F58] hover:text-[#141413] hover:bg-[#F0EEE6] border border-transparent',
    };

    const sizes = {
      sm: 'text-[13px] px-3.5 py-1.5 gap-1.5 rounded-none h-[34px]',
      md: 'text-[14px] px-4 py-2 gap-2 rounded-none h-[40px]',
      lg: 'text-[14px] font-medium px-5 py-2.5 gap-2 rounded-none h-[44px]',
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
