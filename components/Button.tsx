import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  className?: string;
  [key: string]: any;
}

const Button = ({ children, className = '', ...props }: ButtonProps) => (
    <button
      className={`px-4 py-2 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  )

export default Button;