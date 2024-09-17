// ./components/Button.tsx

import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

const Button = ({ children, className = "", ...props }: ButtonProps) => (
  <button className={`px-4 py-2 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`} {...props}>
    {children}
  </button>
);

export default Button;
