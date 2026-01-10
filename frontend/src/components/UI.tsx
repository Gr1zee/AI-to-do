import React, { type ButtonHTMLAttributes, type InputHTMLAttributes } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Утилита для слияния классов
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Card ---
export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn("bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/60 overflow-hidden", className)} 
    {...props}
  >
    {children}
  </div>
);

// --- Button ---
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = ({ className, variant = "primary", size = "md", ...props }: ButtonProps) => {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 border border-transparent",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs font-medium",
    md: "px-5 py-2.5 text-sm font-medium",
    lg: "px-6 py-3 text-base font-semibold",
  };

  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none gap-2",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
};

// --- Input ---
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({ className, label, error, ...props }: InputProps) => (
  <div className="w-full space-y-1.5">
    {label && <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">{label}</label>}
    <input 
      className={cn(
        "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all",
        error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
        className
      )} 
      {...props} 
    />
    {error && <p className="text-xs text-red-500 font-medium ml-1">{error}</p>}
  </div>
);