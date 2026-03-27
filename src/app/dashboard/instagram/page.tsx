"use client";

import {
  instagramAccounts,
  instagramProgressGoals,
  instagramDailyReach,
  instagramPosts,
  instagramComments,
  instagramAnalysisWorking,
  instagramAnalysisFlopping,
} from "@/lib/mock-data";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { POST_TYPE_COLORS } from "@/lib/constants";
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
  Target,
  Eye,
  Users,
  MessageCircle,
} from "lucide-react";

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}

function fmtWhole(n: number): string {
  return n.toLocaleString();
}

export default function InstagramPage() {
  const acct1 = instagramAccounts[0];
  const acct2 = instagramAccounts[1];
  const combinedFollowers = acct1.followers + acct2.followers;
  const combinedReach = acct1.reach28d + acct2.reach28d;
  const combinedProfileViews = acct1.profileViews28d + acct2.profileViews28d;
  const combinedEngaged = acct1.accountsEngaged28d + acct2.accountsEngaged28d;
  const combinedInteractions = acct1.interactions28d + acct2.interactions28d;

  const acct1Posts = instagramPosts.filter((p) => p.account === acct1.handle);
  const acct2Posts = instagramPosts.filter((p) => p.account === acct2.handle);
  const acct1Comments = instagramComments.filter((c) => c.account === acct1.handle);
  const acct2Comments = instagramComments.filter((c) => c.account === acct2.handle);

  return (
    <div className="space-y-8">
      {/* Row 1: 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label={acct1.handle}
          value={fmtWhole(acct1.followers)}
          sub="followers"
          change={`+${acct1.engagementRate}% eng`}
          changeType="positive"
        />
        <MetricCard
          label={acct2.handle}
          value={fmtWhole(acct2.followers)}
          sub="followers"
          change={`+${acct2.engagementRate}% eng`}
          changeType="positive"
        />
        <MetricCard
          label="Combined Followers"
          value={fmtWhole(combinedFollowers)}
          change="+4.2% this month"
          changeType="positive"
          icon={<Users className="h-4 w-4 text-[#c4947a]" />}
        />
        <MetricCard
          label="28D Reach"
          value={fmt(combinedReach)}
          change="+12.8%"
          changeType="positive"
          icon={<Eye className="h-4 w-4 text-[#c4947a]" />}
        />
      </div>

      {/* Row 2: 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          label="28D Profile Views"
          value={fmtWhole(combinedProfileViews)}
          change="+18.3%"
          changeType="positive"
          icon={<Eye className="h-4 w-4 text-text-secondary" />}
        />
        <MetricCard
          label="28D Accounts Engaged"
          value={fmtWhole(combinedEngaged)}
          change="+9.1%"
          changeType="positive"
          icon={<Users className="h-4 w-4 text-text-secondary" />}
        />
        <MetricCard
          label="28D Interactions"
          value={fmtWhole(combinedInteractions)}
          change="+14.6%"
          changeType="positive"
          icon={<MessageCircle className="h-4 w-4 text-[#c4947a]" />}
          accent
        />
      </div>

      {/* Row 3: Road to 100K */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {instagramProgressGoals.map((goal) => {
          const pct = Math.min((goal.current / goal.target) * 100, 100);
          const remaining = goal.target - goal.current;
          return (
            <Card key={goal.handle}>
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-[#c4947a]" />
                <h3 className="font-display text-lg font-semibold text-text-primary">
                  Road to 100K
                </h3>
                <span className="text-sm text-text-secondary font-body">
                  {goal.handle}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 rounded-full bg-[#f0ede8] mb-3">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: "linear-gradient(90deg, #c4947a, #d4a989)",
                  }}
                />
              </div>

              <p className="text-2xl font-display font-bold text-text-primary mb-4">
                {fmtWhole(remaining)}{" "}
                <span className="text-sm font-body font-normal text-text-secondary">
                  followers to go
                </span>
              </p>

              <div className="flex items-center gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-secondary font-body">
                    YTD Growth
                  </p>
                  <p className="text-sm font-semibold text-text-primary font-body">
                    +{fmtWhole(goal.ytdGrowth)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-secondary font-body">
                    Monthly Pace
                  </p>
                  <p className="text-sm font-semibold text-text-primary font-body">
                    +{fmtWhole(goal.monthlyPace)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-secondary font-body">
                    ETA
                  </p>
                  <p className="text-sm font-semibold text-text-primary font-body">
                    {goal.eta}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Row 4: Daily Reach Chart */}
      <Card>
        <h3 className="font-display text-lg font-semibold text-text-primary mb-4">
          Daily Reach
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={instagramDailyReach}>
              <defs>
                <linearGradient id="reachGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c4947a" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#c4947a" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e6e1" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#6b6b6b" }}
                tickLine={false}
                axisLine={{ stroke: "#e8e6e1" }}
                tickFormatter={(v: string) => {
                  const d = new Date(v);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6b6b6b" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => fmt(v)}
                width={48}
              />
              <Tooltip
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid #e8e6e1",
                  borderRadius: 8,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: 12,
                }}
                formatter={(value) => [fmtWhole(Number(value)), "Reach"]}
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
                dataKey="reach"
                stroke="#c4947a"
                strokeWidth={2}
                fill="url(#reachGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Row 5: Latest Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PostsColumn title={`Latest Posts — ${acct1.handle}`} posts={acct1Posts} />
        <PostsColumn title={`Latest Posts — ${acct2.handle}`} posts={acct2Posts} />
      </div>

      {/* Row 6: Recent Comments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CommentsColumn title={`Recent Comments — ${acct1.handle}`} comments={acct1Comments} />
        <CommentsColumn title={`Recent Comments — ${acct2.handle}`} comments={acct2Comments} />
      </div>

      {/* Row 7: Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="success">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-[#6b8f71]" />
            <h3 className="font-display text-lg font-semibold text-text-primary">
              What&apos;s Working
            </h3>
          </div>
          <ul className="space-y-3">
            {instagramAnalysisWorking.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#6b8f71] flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-text-primary font-body">{item.text}</p>
                  {item.metric && (
                    <Badge variant="positive" size="sm" className="mt-1">
                      {item.metric}
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card variant="danger">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-[#c4626a]" />
            <h3 className="font-display text-lg font-semibold text-text-primary">
              What&apos;s Flopping
            </h3>
          </div>
          <ul className="space-y-3">
            {instagramAnalysisFlopping.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#c4626a] flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-text-primary font-body">{item.text}</p>
                  {item.metric && (
                    <Badge variant="negative" size="sm" className="mt-1">
                      {item.metric}
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function MetricCard({
  label,
  value,
  sub,
  change,
  changeType,
  icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  change: string;
  changeType: "positive" | "negative";
  icon?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] uppercase tracking-wider text-text-secondary font-body">
          {label}
        </p>
        {icon && icon}
      </div>
      <p
        className={`text-2xl font-display font-bold ${
          accent ? "text-[#c4947a]" : "text-text-primary"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs text-text-secondary font-body">{sub}</p>
      )}
      <div className="mt-1 flex items-center gap-1">
        {changeType === "positive" ? (
          <TrendingUp className="h-3 w-3 text-[#6b8f71]" />
        ) : (
          <TrendingDown className="h-3 w-3 text-[#c4626a]" />
        )}
        <span
          className={`text-xs font-body ${
            changeType === "positive" ? "text-[#6b8f71]" : "text-[#c4626a]"
          }`}
        >
          {change}
        </span>
      </div>
    </Card>
  );
}

function PostsColumn({
  title,
  posts,
}: {
  title: string;
  posts: typeof instagramPosts;
}) {
  return (
    <Card>
      <h3 className="font-display text-lg font-semibold text-text-primary mb-4">
        {title}
      </h3>
      <div className="space-y-3">
        {posts.map((post) => {
          const typeColor = POST_TYPE_COLORS[post.type] ?? {
            bg: "#f0ede8",
            text: "#6b6b6b",
          };
          return (
            <div key={post.id} className="flex items-start gap-3">
              <div
                className="h-10 w-10 rounded flex-shrink-0"
                style={{ backgroundColor: post.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary font-body line-clamp-2">
                  {post.caption}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-text-secondary font-body">
                    {fmtWhole(post.likes)} likes
                  </span>
                  <span className="text-xs text-text-secondary font-body">
                    {fmtWhole(post.comments)} comments
                  </span>
                  <Badge
                    size="sm"
                    className="ml-auto"
                    style={{
                      backgroundColor: typeColor.bg,
                      color: typeColor.text,
                    }}
                  >
                    {post.type}
                  </Badge>
                  <span className="text-[10px] text-text-secondary font-body">
                    {post.timestamp}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function CommentsColumn({
  title,
  comments,
}: {
  title: string;
  comments: typeof instagramComments;
}) {
  return (
    <Card>
      <h3 className="font-display text-lg font-semibold text-text-primary mb-4">
        {title}
      </h3>
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id}>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-text-primary font-body">
                {comment.author}
              </p>
              <span className="text-[10px] text-text-secondary font-body">
                {comment.timestamp}
              </span>
            </div>
            <p className="text-sm text-text-secondary font-body mt-0.5">
              {comment.text}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
