"use client";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { icon: 32, text: "text-xl" },
  md: { icon: 48, text: "text-2xl" },
  lg: { icon: 64, text: "text-4xl" },
  xl: { icon: 96, text: "text-5xl" },
};

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const { icon, text } = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon - Flowing checkmark */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="checkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
        </defs>

        {/* Background circle with gradient */}
        <circle
          cx="32"
          cy="32"
          r="30"
          fill="url(#flowGradient)"
          opacity="0.1"
        />

        {/* Outer ring */}
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="url(#flowGradient)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="140 40"
          className="origin-center"
          style={{ transform: "rotate(-45deg)", transformOrigin: "center" }}
        />

        {/* Flowing checkmark */}
        <path
          d="M20 34 L28 42 L44 22"
          stroke="url(#checkGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Flow accent dots */}
        <circle cx="16" cy="28" r="2" fill="#3B82F6" opacity="0.6" />
        <circle cx="48" cy="36" r="2" fill="#8B5CF6" opacity="0.6" />
      </svg>

      {/* Logo Text */}
      {showText && (
        <span className={`font-bold ${text} tracking-tight`}>
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Flow
          </span>
          <span className="text-zinc-800 dark:text-zinc-100">do</span>
        </span>
      )}
    </div>
  );
}

export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="flowGradientMark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="checkGradientMark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
      </defs>

      <circle
        cx="32"
        cy="32"
        r="30"
        fill="url(#flowGradientMark)"
        opacity="0.1"
      />

      <circle
        cx="32"
        cy="32"
        r="28"
        stroke="url(#flowGradientMark)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="140 40"
        style={{ transform: "rotate(-45deg)", transformOrigin: "center" }}
      />

      <path
        d="M20 34 L28 42 L44 22"
        stroke="url(#checkGradientMark)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      <circle cx="16" cy="28" r="2" fill="#3B82F6" opacity="0.6" />
      <circle cx="48" cy="36" r="2" fill="#8B5CF6" opacity="0.6" />
    </svg>
  );
}
