export const TAB_ITEMS = [
  { id: "overview", label: "Overview", href: "/dashboard" },
  { id: "hq", label: "HQ", href: "/dashboard/facebook" },
  { id: "youtube", label: "YouTube", href: "/dashboard/youtube" },
  { id: "deals", label: "Deals", href: "/dashboard/deals" },
  { id: "instagram", label: "Instagram", href: "/dashboard/instagram" },
] as const;

export const SECONDARY_NAV = [
  { label: "Email", href: "/dashboard/email", icon: "Mail" },
  { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
] as const;

export const PLATFORM_CONFIG = {
  instagram: { name: "Instagram", color: "#E4405F" },
  youtube: { name: "YouTube", color: "#FF0000" },
  facebook: { name: "Facebook", color: "#1877F2" },
  twitter: { name: "Twitter", color: "#1DA1F2" },
  tiktok: { name: "TikTok", color: "#00F2EA" },
  linkedin: { name: "LinkedIn", color: "#0A66C2" },
} as const;

export const CHART_THEME = {
  grid: "#e8e6e1",
  axis: "#6b6b6b",
  tooltip: {
    bg: "#ffffff",
    border: "#e8e6e1",
    shadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  colors: {
    primary: "#c4947a",
    secondary: "#8b7355",
    success: "#6b8f71",
    danger: "#c4626a",
    blue: "#7ca5c4",
    coral: "#d4897a",
  },
} as const;

export const POST_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Reel: { bg: "#fce4ec", text: "#c62828" },
  Carousel: { bg: "#e3f2fd", text: "#1565c0" },
  Static: { bg: "#f3e5f5", text: "#6a1b9a" },
};

export const DEAL_STAGE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  inquiry: { label: "Inquiry", color: "#3b82f6", bg: "#eff6ff" },
  negotiating: { label: "Negotiating", color: "#f59e0b", bg: "#fffbeb" },
  "in-progress": { label: "In Progress", color: "#06b6d4", bg: "#ecfeff" },
  completed: { label: "Completed", color: "#6b8f71", bg: "#f0fdf4" },
};
