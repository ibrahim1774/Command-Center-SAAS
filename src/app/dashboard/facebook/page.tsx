"use client";

import {
  facebookMetrics,
  facebookPostReach,
  facebookPosts,
  facebookComments,
  facebookInsights,
} from "@/lib/mock-data";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  ThumbsUp,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";

export default function FacebookPage() {
  return (
    <div className="space-y-8">
      {/* Row 1: Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {facebookMetrics.map((metric) => (
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

      {/* Row 2: Post Reach Chart */}
      <Card padding="lg">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-xl font-semibold font-[family-name:var(--font-display)] text-text-primary">
            Post Reach
          </h2>
          <span className="text-xs text-text-muted">Last 30 days</span>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={facebookPostReach}>
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
                formatter={(value) => [Number(value).toLocaleString(), "Reach"]}
                labelFormatter={(label) => {
                  const d = new Date(label);
                  return d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <Bar
                dataKey="reach"
                fill="#7ca5c4"
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Row 3: Recent Posts */}
      <Card padding="lg">
        <h2 className="text-xl font-semibold font-[family-name:var(--font-display)] text-text-primary mb-6">
          Recent Posts
        </h2>
        <div className="divide-y divide-card-border">
          {facebookPosts.map((post) => (
            <div key={post.id} className="py-5 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3 mb-3">
                <Badge variant="platform" size="sm" className="shrink-0 capitalize">
                  {post.type}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text-primary line-clamp-2 text-sm">
                    {post.content}
                  </p>
                  <p className="text-xs text-text-muted mt-1">{post.publishedAt}</p>
                </div>
              </div>

              {/* Reactions */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary ml-0 mb-2">
                <span className="inline-flex items-center gap-1">
                  <span>👍</span> {post.reactions.like.toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-1">
                  <span>❤️</span> {post.reactions.love.toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-1">
                  <span>😮</span> {post.reactions.wow.toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-1">
                  <span>😂</span> {post.reactions.haha.toLocaleString()}
                </span>
              </div>

              {/* Engagement metrics */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {post.comments.toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Share2 className="w-3.5 h-3.5" />
                  {post.shares.toLocaleString()}
                </span>
                <Badge variant="neutral" size="sm">
                  Reach: {post.reach.toLocaleString()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Row 4: Recent Comments */}
      <Card padding="lg">
        <h2 className="text-xl font-semibold font-[family-name:var(--font-display)] text-text-primary mb-6">
          Comments
        </h2>
        <div className="divide-y divide-card-border">
          {facebookComments.map((comment) => (
            <div key={comment.id} className="py-4 first:pt-0 last:pb-0">
              <p className="text-sm font-bold text-text-primary">{comment.author}</p>
              <p className="text-sm text-text-secondary mt-1">{comment.text}</p>
              <p className="text-xs text-text-muted mt-1.5">{comment.timestamp}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Row 5: AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="success" padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-success" />
            <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-text-primary">
              What&apos;s Working
            </h3>
          </div>
          <ul className="space-y-3">
            {facebookInsights.working.map((item, i) => (
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
            <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] text-text-primary">
              What&apos;s Flopping
            </h3>
          </div>
          <ul className="space-y-3">
            {facebookInsights.flopping.map((item, i) => (
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
      </div>
    </div>
  );
}
