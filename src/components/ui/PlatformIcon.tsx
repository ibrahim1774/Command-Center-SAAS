import { PLATFORM_CONFIG } from "@/lib/constants";
import type { Platform } from "@/types";
import { cn } from "@/lib/utils";

interface IconProps {
  size: number;
  color: string;
}

function InstagramIcon({ size, color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill={color} stroke="none" />
    </svg>
  );
}

function TwitterIcon({ size, color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l7.07 9.34L4 20h1.6l6.18-5.83L17 20h4l-7.45-9.86L20 4h-1.6l-5.8 5.47L7.96 4H4z" />
    </svg>
  );
}

function TikTokIcon({ size, color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

function YoutubeIcon({ size, color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

function LinkedinIcon({ size, color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function FacebookIcon({ size, color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const ICON_MAP: Record<Platform, React.ComponentType<IconProps>> = {
  instagram: InstagramIcon,
  twitter: TwitterIcon,
  tiktok: TikTokIcon,
  youtube: YoutubeIcon,
  linkedin: LinkedinIcon,
  facebook: FacebookIcon,
};

interface PlatformIconProps {
  platform: Platform;
  size?: number;
  showBackground?: boolean;
  className?: string;
}

export function PlatformIcon({
  platform,
  size = 18,
  showBackground = true,
  className,
}: PlatformIconProps) {
  const Icon = ICON_MAP[platform];
  const color = PLATFORM_CONFIG[platform].color;

  if (!showBackground) {
    return (
      <span className={cn("inline-flex", className)}>
        <Icon size={size} color={color} />
      </span>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full shrink-0",
        className
      )}
      style={{
        backgroundColor: `${color}26`,
        width: size * 2,
        height: size * 2,
      }}
    >
      <Icon size={size} color={color} />
    </div>
  );
}
