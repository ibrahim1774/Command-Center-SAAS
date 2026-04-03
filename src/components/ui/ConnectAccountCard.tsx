"use client";

import { Camera, Play, Globe, Music } from "lucide-react";
import { Card } from "./Card";
import { Button } from "./Button";

const PLATFORM_CONFIG = {
  instagram: { label: "Instagram", icon: Camera, color: "#E4405F" },
  youtube: { label: "YouTube", icon: Play, color: "#FF0000" },
  facebook: { label: "Facebook", icon: Globe, color: "#1877F2" },
  tiktok: { label: "TikTok", icon: Music, color: "#000000" },
} as const;

interface ConnectAccountCardProps {
  platform: "instagram" | "youtube" | "facebook" | "tiktok";
}

export function ConnectAccountCard({ platform }: ConnectAccountCardProps) {
  const config = PLATFORM_CONFIG[platform];
  const Icon = config.icon;

  return (
    <Card padding="lg" className="max-w-lg mx-auto text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{ backgroundColor: `${config.color}15` }}
      >
        <Icon className="w-8 h-8" style={{ color: config.color }} />
      </div>
      <h3 className="font-display text-xl text-text-primary mb-2">
        Connect your {config.label}
      </h3>
      <p className="text-sm text-text-secondary mb-6 max-w-sm mx-auto">
        Go to Settings to connect your {config.label} account and start seeing
        real analytics, posts, and engagement data.
      </p>
      <a href="/dashboard/settings">
        <Button variant="primary" size="md">
          Go to Settings
        </Button>
      </a>
    </Card>
  );
}
