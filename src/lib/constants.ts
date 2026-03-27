export const TAB_ITEMS = [
  { id: "overview", label: "Overview", href: "/dashboard" },
  { id: "instagram", label: "Instagram", href: "/dashboard/instagram" },
  { id: "youtube", label: "YouTube", href: "/dashboard/youtube" },
  { id: "facebook", label: "Facebook", href: "/dashboard/facebook" },
  { id: "deals", label: "Deals", href: "/dashboard/deals" },
  { id: "goals", label: "Goals", href: "/dashboard/goals" },
  { id: "settings", label: "Settings", href: "/dashboard/settings" },
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
  confirmed: { label: "Confirmed", color: "#c4947a", bg: "#fdf4f0" },
  "in-progress": { label: "In Progress", color: "#06b6d4", bg: "#ecfeff" },
  completed: { label: "Completed", color: "#6b8f71", bg: "#f0fdf4" },
};

export const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  unpaid: { label: "Unpaid", color: "#6b6b6b", bg: "#f0ede8" },
  invoiced: { label: "Invoiced", color: "#f59e0b", bg: "#fffbeb" },
  paid: { label: "Paid", color: "#6b8f71", bg: "#f0fdf4" },
};

export const DEAL_TYPE_LABELS: Record<string, string> = {
  sponsored_post: "Sponsored Post",
  brand_ambassador: "Brand Ambassador",
  affiliate: "Affiliate",
  product_review: "Product Review",
  ugc: "UGC",
  other: "Other",
};

export const MOOD_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  amazing: { label: "Amazing", color: "#6b8f71", icon: "Smile" },
  good: { label: "Good", color: "#06b6d4", icon: "SmilePlus" },
  okay: { label: "Okay", color: "#f59e0b", icon: "Meh" },
  tough: { label: "Tough", color: "#f97316", icon: "Frown" },
  rough: { label: "Rough", color: "#c4626a", icon: "CloudRain" },
};

export const TASK_PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  urgent: { label: "Urgent", color: "#c4626a" },
  important: { label: "Important", color: "#f59e0b" },
  normal: { label: "Normal", color: "#a09a90" },
};

export const EVENT_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  content_deadline: { label: "Content Deadline", color: "#8b5cf6" },
  brand_deal: { label: "Brand Deal", color: "#c4947a" },
  meeting: { label: "Meeting", color: "#3b82f6" },
  personal: { label: "Personal", color: "#6b8f71" },
  other: { label: "Other", color: "#a09a90" },
};

export const GOAL_CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  growth: { label: "Growth", color: "#6b8f71", bg: "#f0fdf4" },
  revenue: { label: "Revenue", color: "#f59e0b", bg: "#fffbeb" },
  content: { label: "Content", color: "#8b5cf6", bg: "#f5f3ff" },
  personal: { label: "Personal", color: "#06b6d4", bg: "#ecfeff" },
  brand: { label: "Brand", color: "#c4947a", bg: "#fdf4f0" },
};
