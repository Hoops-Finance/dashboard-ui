"use client";

import React, { FC, ButtonHTMLAttributes, InputHTMLAttributes, HTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const Button: FC<ButtonProps> = ({ children, className = "", ...props }) => (
  <button className={`px-4 py-2 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`} {...props}>
    {children}
  </button>
);

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input: FC<InputProps> = ({ className = "", ...props }) => (
  <input className={`px-3 py-2 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#e2be08] ${className}`} {...props} />
);

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Card: FC<CardProps> = ({ children, className = "" }) => <div className={`bg-white rounded-2xl shadow-lg ${className}`}>{children}</div>;

// Add any other UI component exports here
// New MetricCard component for hover explanation text
interface MetricCardProps extends CardProps {
  title: string; // Explanation for the metric
}

export const MetricCard: FC<MetricCardProps> = ({ children, className = "", title }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 transition-all duration-300 hover:shadow-xl ${className}`}
    title={title} // Tooltip on hover
  >
    {children}
  </div>
);
