"use client";

import {
  youtubeMetrics,
  youtubeViewsData,
  youtubeVideos,
  youtubeComments,
  youtubeAnalysis,
} from "@/lib/mock-data";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Play,
  ThumbsUp,
  MessageCircle,
  Clock,
  Lightbulb,
} from "lucide-react";

export default function YouTubePage() {
  return (
    <div className="space-y-8">
      {/* Row 1: Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {youtubeMetrics.map((metric) => (
          <Card key={metric.label} padding="md">
            <p className="text-[10px] font-medium uppercase tracking-widest text-text-muted mb-1">
              {metric.label}
            </p>
            <p className="text-2xl font-bold font-[family-name:var(--font-display)] text-text-primary">
              {metric.value}
            </p>
            <Badge
              variant={metric.changeType === "positive" ? "positive" : "negative"}
              size="sm"
              className="mt-2"
            >
              {metric.changeType === "positive" ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {metric.change}
            </Badge>
          </Card>
        ))}
      </div>

      {/* Row 2: Views Chart */}
      <Card padding="lg">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-xl font-semibold font-[family-name:var(--font-display)] text-text-primary">
            Views
          </h2>
          <span className="text-xs text-text-muted">Last 30 days</span>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={youtubeViewsData}>
              <defs>
                <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4897a" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#d4897a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e6e1" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#a09a90" }}
                tickLine={false}
                axisLine={{ stroke: "#e8e6e1" }}
                tickFormatter={(value: string) => {
                  const d = new Date(value);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#a09a90" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) =>
                  value >= 1000 ? `${(value / 1000).toFixed(0)}K` : String(value)
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e8e6e1",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontFamily: "var(--font-body)",
                }}
                formatter={(value) => [Number(value).toLocaleString(), "Views"]}
                labelFormatter={(label) => {
                  const d = new Date(label);
                  return d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#d4897a"
                strokeWidth={2}
                fill="url(#viewsFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Row 3: Recent Uploads */}
      <Card padding="lg">
        <h2 className="text-xl font-semibold font-[family-name:var(--font-display)] text-text-primary mb-6">
          Recent Uploads
        </h2>
        <div className="divide-y divide-card-border">
          {youtubeVideos.map((video) => (
            <div key={video.id} className="py-5 first:pt-0 last:pb-0">
              <div className="flex items-start gap-4">
                {/* Thumbnail placeholder */}
                <div
                  className="w-[120px] h-[68px] rounded-lg shrink-0"
                  style={{ backgroundColor: video.thumbnailColor }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-text-primary text-sm line-clamp-2">
                      {video.title}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="neutral" size="sm">
                        <Clock className="w-3 h-3 mr-1" />
                        {video.duration}
                      </Badge>
                      <span className="text-xs text-text-muted">{video.publishedAt}</span>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary mt-2">
                    <span className="inline-flex items-center gap-1">
                      <Play className="w-3.5 h-3.5" />
                      {video.views.toLocaleString()}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {video.likes.toLocaleString()}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {video.comments.toLocaleString()}
                    </span>
                  </div>

                  {/* Audience retention bar */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex-1 h-2 rounded-full bg-[#f0ede8]">
                      <div
                        className="h-full rounded-full bg-accent-primary"
                        style={{ width: `${video.retention}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-text-secondary shrink-0">
                      {video.retention}% retention
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Row 4: Top Comments */}
      <Card padding="lg">
        <h2 className="text-xl font-semibold font-[family-name:var(--font-display)] text-text-primary mb-6">
          Top Comments
        </h2>
        <div className="divide-y divide-card-border">
          {youtubeComments.map((comment) => (
            <div key={comment.id} className="py-4 first:pt-0 last:pb-0">
              <p className="text-sm font-semibold text-text-primary">{comment.author}</p>
              <p className="text-sm text-text-secondary mt-1">{comment.text}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                  <ThumbsUp className="w-3 h-3" />
                  {comment.likes.toLocaleString()}
                </span>
                <span className="text-xs italic text-text-muted">
                  {comment.videoTitle}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Row 5: AI Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="success" padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-success" />
            <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-success">
              What&apos;s Working
            </h3>
          </div>
          <ul className="space-y-3">
            {youtubeAnalysis.working.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="text-success mt-0.5 shrink-0">&#8226;</span>
                <span>
                  {item.text}
                  {item.metric && (
                    <Badge variant="positive" size="sm" className="ml-2">
                      {item.metric}
                    </Badge>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card variant="danger" padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-danger" />
            <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-danger">
              What&apos;s Flopping
            </h3>
          </div>
          <ul className="space-y-3">
            {youtubeAnalysis.flopping.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="text-danger mt-0.5 shrink-0">&#8226;</span>
                <span>
                  {item.text}
                  {item.metric && (
                    <Badge variant="negative" size="sm" className="ml-2">
                      {item.metric}
                    </Badge>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-accent-primary" />
            <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-accent-primary">
              Content Ideas
            </h3>
          </div>
          <ol className="space-y-3">
            {youtubeAnalysis.contentIdeas.map((idea, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-text-secondary">
                <span className="text-accent-primary font-semibold shrink-0">{i + 1}.</span>
                <span>{idea}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}
