export const PLATFORM_CONFIG = {
  instagram: { name: "Instagram", color: "#E4405F", icon: "Instagram" },
  twitter: { name: "X (Twitter)", color: "#1DA1F2", icon: "Twitter" },
  tiktok: { name: "TikTok", color: "#00F2EA", icon: "Music2" },
  youtube: { name: "YouTube", color: "#FF0000", icon: "Youtube" },
  linkedin: { name: "LinkedIn", color: "#0A66C2", icon: "Linkedin" },
  facebook: { name: "Facebook", color: "#1877F2", icon: "Facebook" },
} as const;

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Analytics", href: "/analytics", icon: "BarChart3" },
  { label: "Content", href: "/content", icon: "FileText" },
  { label: "Audience", href: "/audience", icon: "Users" },
  { label: "Schedule", href: "/schedule", icon: "CalendarDays" },
  { label: "Settings", href: "/settings", icon: "Settings" },
] as const;

export type PlatformConfigKey = keyof typeof PLATFORM_CONFIG;
export type NavItem = (typeof NAV_ITEMS)[number];
