import React from "react";

export type IconName =
  | "menu"
  | "close"
  | "dashboard"
  | "children"
  | "users"
  | "warning"
  | "review"
  | "bell"
  | "health"
  | "education"
  | "social"
  | "user"
  | "logout";

export function Icon({ name, className = "h-4 w-4" }: { name: IconName; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className
  };

  if (name === "menu") {
    return (
      <svg {...common}>
        <path d="M3 6h18" />
        <path d="M3 12h18" />
        <path d="M3 18h18" />
      </svg>
    );
  }

  if (name === "close") {
    return (
      <svg {...common}>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    );
  }

  if (name === "dashboard") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="4" />
        <rect x="14" y="10" width="7" height="11" />
        <rect x="3" y="13" width="7" height="8" />
      </svg>
    );
  }

  if (name === "children") {
    return (
      <svg {...common}>
        <circle cx="9" cy="7" r="3" />
        <circle cx="17" cy="8" r="2" />
        <path d="M3 20a6 6 0 0 1 12 0" />
        <path d="M14 20a4 4 0 0 1 8 0" />
      </svg>
    );
  }

  if (name === "users") {
    return (
      <svg {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <path d="M20 8v6" />
        <path d="M23 11h-6" />
      </svg>
    );
  }

  if (name === "warning") {
    return (
      <svg {...common}>
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    );
  }

  if (name === "review") {
    return (
      <svg {...common}>
        <path d="m9 11 3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    );
  }

  if (name === "bell") {
    return (
      <svg {...common}>
        <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
        <path d="M10 17a2 2 0 0 0 4 0" />
      </svg>
    );
  }

  if (name === "health") {
    return (
      <svg {...common}>
        <path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10Z" />
      </svg>
    );
  }

  if (name === "education") {
    return (
      <svg {...common}>
        <path d="m2 8 10-5 10 5-10 5-10-5Z" />
        <path d="M6 10.5v5.5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.5" />
      </svg>
    );
  }

  if (name === "social") {
    return (
      <svg {...common}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21l8.84-8.61a5.5 5.5 0 0 0 0-7.78Z" />
      </svg>
    );
  }

  if (name === "logout") {
    return (
      <svg {...common}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
      </svg>
    );
  }

  if (name === "user") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20a8 8 0 0 1 16 0" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}
