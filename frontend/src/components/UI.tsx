import React, { type ButtonHTMLAttributes, type InputHTMLAttributes } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Moon, Sun, Sparkles } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

// Утилита для слияния классов
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Theme Toggle ---
export const ThemeToggle = ({ className }: { className?: string }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative p-2.5 rounded-xl transition-all duration-300 overflow-hidden group",
        "bg-slate-100/80 hover:bg-slate-200/80 text-slate-600",
        "dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:text-slate-300",
        "hover:scale-105 active:scale-95",
        className
      )}
      title={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 dark:from-indigo-500/20 dark:to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      {theme === "dark" ? <Sun className="w-5 h-5 relative z-10" /> : <Moon className="w-5 h-5 relative z-10" />}
    </button>
  );
};

// --- Card ---
export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden",
      "dark:bg-slate-800/80 dark:border-slate-700/60 dark:shadow-slate-900/40",
      "transition-all duration-300",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// --- GlassCard - новый стеклянный компонент ---
export const GlassCard = ({ className, children, glow, ...props }: React.HTMLAttributes<HTMLDivElement> & { glow?: boolean }) => (
  <div
    className={cn(
      "relative backdrop-blur-xl rounded-2xl overflow-hidden transition-all duration-300",
      "bg-white/60 border border-white/40 shadow-lg shadow-slate-200/30",
      "dark:bg-slate-900/60 dark:border-slate-700/40 dark:shadow-slate-900/30",
      glow && "glow-brand",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// --- Button ---
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "gradient";
  size?: "sm" | "md" | "lg";
}

export const Button = ({ className, variant = "primary", size = "md", children, ...props }: ButtonProps) => {
  const variants = {
    primary: "bg-gradient-to-r from-[#5c6cf2] to-[#7a8ff8] text-white hover:from-[#4f4de6] hover:to-[#6b7ef5] shadow-lg shadow-[#5c6cf2]/25 border border-[#5c6cf2]/20 dark:shadow-[#5c6cf2]/20",
    secondary: "bg-white/80 backdrop-blur-sm text-slate-700 border border-slate-200/80 hover:bg-white hover:border-slate-300 shadow-sm dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-600/80 dark:hover:bg-slate-700/80",
    danger: "bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 shadow-lg shadow-rose-500/25 border border-rose-500/20",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200",
    gradient: "bg-gradient-to-r from-[#5c6cf2] via-[#f43f5e] to-[#06b6d4] text-white shadow-lg shadow-[#5c6cf2]/30 border border-white/20 hover:shadow-xl hover:shadow-[#5c6cf2]/40 bg-[length:200%_auto] hover:bg-right transition-[background-position]",
  };

  const sizes = {
    sm: "px-3.5 py-2 text-xs font-medium",
    md: "px-5 py-2.5 text-sm font-semibold",
    lg: "px-7 py-3.5 text-base font-semibold",
  };

  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl transition-all duration-300",
        "active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none gap-2",
        "hover:transform hover:-translate-y-0.5",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

// --- Input ---
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({ className, label, error, ...props }: InputProps) => (
  <div className="w-full space-y-2">
    {label && (
      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
        {label}
      </label>
    )}
    <div className="relative group">
      <input
        className={cn(
          "w-full px-4 py-3.5 bg-slate-50/80 backdrop-blur-sm border border-slate-200/80 rounded-xl",
          "text-slate-900 placeholder:text-slate-400",
          "focus:outline-none focus:ring-2 focus:ring-[#5c6cf2]/20 focus:border-[#5c6cf2]/60 focus:bg-white",
          "transition-all duration-300",
          "dark:bg-slate-900/80 dark:border-slate-600/80 dark:text-slate-100 dark:placeholder:text-slate-500",
          "dark:focus:ring-[#5c6cf2]/30 dark:focus:border-[#5c6cf2]/60 dark:focus:bg-slate-900",
          error && "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500 dark:border-rose-500",
          className
        )}
        {...props}
      />
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#5c6cf2]/10 via-[#f43f5e]/10 to-[#06b6d4]/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
    </div>
    {error && <p className="text-xs text-rose-500 dark:text-rose-400 font-medium ml-1 flex items-center gap-1">⚠️ {error}</p>}
  </div>
);

// --- Badge - новый компонент ---
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

export const Badge = ({ className, variant = "default", children, ...props }: BadgeProps) => {
  const variants = {
    default: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    danger: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
    info: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

// --- Logo ---
export const Logo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14"
  };
  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7"
  };

  return (
    <div className={cn(
      "relative rounded-xl bg-gradient-to-br from-[#5c6cf2] to-[#7a8ff8] flex items-center justify-center",
      "shadow-lg shadow-[#5c6cf2]/30",
      sizes[size]
    )}>
      <Sparkles className={cn("text-white", iconSizes[size])} />
      <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 hover:opacity-100 transition-opacity" />
    </div>
  );
};