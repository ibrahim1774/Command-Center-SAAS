import type { InsightItem } from "@/types";

export interface AIInsightsResponse {
  daily_briefing: {
    summary: string;
    highlights: string[];
  };
  whats_working: InsightItem[];
  whats_flopping: InsightItem[];
  instagram: {
    whats_working: InsightItem[];
    whats_flopping: InsightItem[];
  };
  youtube: {
    whats_working: InsightItem[];
    whats_flopping: InsightItem[];
    content_ideas: string[];
  };
  facebook: {
    whats_working: InsightItem[];
    whats_flopping: InsightItem[];
  };
  top_comments: {
    platform: string;
    username: string;
    text: string;
    post_reference: string;
  }[];
}

export interface DeepAnalysisResponse {
  executive_summary: string;
  growth_trajectory: string;
  content_strategy: string;
  best_posting_times: string[];
  audience_insights: string;
  competitor_gaps: string;
  revenue_opportunities: string;
}

