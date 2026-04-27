"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  User,
  Bell,
  Shield,
  Download,
  Trash2,
  Check,
  Camera,
  Play,
  Globe,
  Music,
  Loader2,
  TrendingUp,
  Mail,
} from "lucide-react";
import { notificationSettings } from "@/lib/mock-data";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ConnectedAccountData {
  platform: string;
  platform_username: string | null;
  status: string;
  last_synced: string | null;
  connected_at: string;
}

const PLATFORMS = [
  { key: "instagram", label: "Instagram", icon: Camera },
  { key: "youtube", label: "YouTube", icon: Play },
  { key: "facebook", label: "Facebook", icon: Globe },
  { key: "tiktok", label: "TikTok", icon: Music },
] as const;

const PLAN_INFO: Record<string, { name: string; price: string; features: string[] }> = {
  hobby: {
    name: "Hobby",
    price: "$9/mo",
    features: [
      "Access to 1 channel (Instagram)",
      "Full analytics dashboard",
      "Trending headlines",
      "Email support",
    ],
  },
  pro: {
    name: "Pro",
    price: "$29/mo",
    features: [
      "Access to all channels",
      "Instagram, X, YouTube, Facebook, TikTok",
      "Full analytics dashboard",
      "Trending headlines",
      "Brand deal CRM",
      "Goals & task management",
      "Priority support",
    ],
  },
};

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<ConnectedAccountData[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [igPickerAccounts, setIgPickerAccounts] = useState<
    { id: string; username: string; profilePicture: string | null }[]
  >([]);
  const [igPickerOpen, setIgPickerOpen] = useState(false);
  const [igPickerLoading, setIgPickerLoading] = useState(false);
  const [handleInputs, setHandleInputs] = useState<Record<string, string>>({});
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [trendKeywords, setTrendKeywords] = useState("");
  const [trendKeywordsLoading, setTrendKeywordsLoading] = useState(true);
  const [trendKeywordsSaving, setTrendKeywordsSaving] = useState(false);
  const [trendKeywordsSaved, setTrendKeywordsSaved] = useState(false);
  const handleSync = async (platform: string) => {
    // Use input value, or fall back to stored username for re-sync
    const inputHandle = handleInputs[platform]?.trim();
    const storedHandle = accounts.find((a) => a.platform === platform)?.platform_username;
    const handle = inputHandle || storedHandle;
    if (!handle) return;

    setSyncing(platform);
    setSyncError(null);

    try {
      // If already connected with same handle, use sync/manual for re-scrape
      const isResync = storedHandle && (!inputHandle || inputHandle === storedHandle);

      if (isResync) {
        const res = await fetch("/api/sync/manual", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platform }),
        });
        const data = await res.json();
        if (!res.ok) {
          setSyncError(data.error || "Failed to sync");
        } else {
          fetchAccounts();
          setSuccessMessage(`${platform} synced successfully!`);
          setTimeout(() => setSuccessMessage(""), 3000);
        }
      } else {
        // New connection
        const body: Record<string, string> = {};
        if (platform === "instagram") body.handle = handle;
        else if (platform === "youtube") body.channelUrl = handle;
        else if (platform === "tiktok") body.username = handle;
        else if (platform === "facebook") body.pageUrl = handle;

        const res = await fetch(`/api/connect/${platform}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          setSyncError(data.error || "Failed to sync");
        } else {
          fetchAccounts();
          setSuccessMessage(`${platform} connected successfully!`);
          setTimeout(() => setSuccessMessage(""), 3000);
        }
      }
    } catch {
      setSyncError("Something went wrong. Please try again.");
    } finally {
      setSyncing(null);
    }
  };

  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(notificationSettings.map((s) => [s.id, s.enabled]))
  );

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/user/connected-accounts");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
      }
    } catch {
      // Silently fail — will show "not connected" state
    } finally {
      setLoadingAccounts(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Pre-populate handle inputs from connected accounts
  useEffect(() => {
    if (accounts.length > 0) {
      const inputs: Record<string, string> = {};
      accounts.forEach((a) => {
        if (a.platform_username) {
          inputs[a.platform] = a.platform_username;
        }
      });
      setHandleInputs((prev) => ({ ...inputs, ...prev }));
    }
  }, [accounts]);

  // Show success message when redirected back from OAuth
  useEffect(() => {
    const connected = searchParams.get("connected");
    if (connected) {
      setSuccessMessage(`${connected.charAt(0).toUpperCase() + connected.slice(1)} connected successfully!`);
      fetchAccounts();
      const timer = setTimeout(() => setSuccessMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, fetchAccounts]);

  // Fetch trend keywords
  useEffect(() => {
    fetch("/api/user/trend-keywords")
      .then((r) => r.json())
      .then((d) => {
        if (d.keywords?.length > 0) setTrendKeywords(d.keywords.join(", "));
      })
      .catch(() => {})
      .finally(() => setTrendKeywordsLoading(false));
  }, []);

  const saveTrendKeywords = async () => {
    setTrendKeywordsSaving(true);
    setTrendKeywordsSaved(false);
    const keywords = trendKeywords.split(",").map((k) => k.trim()).filter(Boolean);
    await fetch("/api/user/trend-keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords }),
    });
    setTrendKeywordsSaving(false);
    setTrendKeywordsSaved(true);
    setTimeout(() => setTrendKeywordsSaved(false), 3000);
  };

  // Instagram multi-account picker
  useEffect(() => {
    if (searchParams.get("ig_pick") === "true") {
      setIgPickerOpen(true);
      fetch("/api/connect/instagram/select")
        .then((r) => r.json())
        .then((data) => {
          if (data.accounts?.length > 0) {
            setIgPickerAccounts(data.accounts);
          } else {
            setIgPickerOpen(false);
            setSuccessMessage(data.expired ? "Session expired. Please try connecting Instagram again." : "No Instagram accounts found.");
          }
        })
        .catch(() => setIgPickerOpen(false));
    }
  }, [searchParams]);

  const handleIgSelect = async (igUserId: string) => {
    setIgPickerLoading(true);
    try {
      const res = await fetch("/api/connect/instagram/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ igUserId }),
      });
      const data = await res.json();
      if (data.success) {
        setIgPickerOpen(false);
        setSuccessMessage(`Instagram (@${data.username}) connected successfully!`);
        fetchAccounts();
      }
    } catch {
      // Silently fail
    } finally {
      setIgPickerLoading(false);
    }
  };

  const handleToggle = (id: string) => {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDisconnect = async (platform: string) => {
    setDisconnecting(platform);
    try {
      const res = await fetch("/api/user/connected-accounts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
      if (res.ok) {
        setAccounts((prev) => prev.filter((a) => a.platform !== platform));
      }
    } catch {
      // Silently fail
    } finally {
      setDisconnecting(null);
    }
  };

  const getAccount = (platform: string) =>
    accounts.find((a) => a.platform === platform);

  return (
    <div className="space-y-10">
      {/* Success Message */}
      {successMessage && (
        <div
          className="rounded-lg px-4 py-3 text-sm flex items-center gap-2"
          style={{
            backgroundColor: "#6b8f7110",
            color: "#6b8f71",
            border: "1px solid #6b8f7120",
            fontFamily: "var(--font-body)",
          }}
        >
          <Check className="h-4 w-4" />
          {successMessage}
        </div>
      )}

      {syncError && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{
            backgroundColor: "#c4626a10",
            color: "#c4626a",
            border: "1px solid #c4626a20",
            fontFamily: "var(--font-body)",
          }}
        >
          {syncError}
        </div>
      )}

      {/* Instagram Account Picker Modal */}
      {igPickerOpen && igPickerAccounts.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 rounded-2xl border border-card-border bg-card-bg p-6 shadow-xl">
            <h3 className="font-display text-lg font-bold text-text-primary mb-1">
              Choose Instagram Account
            </h3>
            <p className="text-sm text-text-secondary mb-5">
              Multiple Instagram accounts found. Select the one you want to connect.
            </p>
            <div className="space-y-3">
              {igPickerAccounts.map((acc) => (
                <button
                  key={acc.id}
                  disabled={igPickerLoading}
                  onClick={() => handleIgSelect(acc.id)}
                  className="w-full flex items-center gap-4 rounded-xl border border-card-border p-4 text-left transition-all hover:border-accent-primary hover:shadow-md disabled:opacity-50"
                >
                  <div className="h-12 w-12 rounded-full bg-[#f0ede8] overflow-hidden flex items-center justify-center flex-shrink-0">
                    {acc.profilePicture ? (
                      <img src={acc.profilePicture} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Camera className="h-5 w-5 text-text-secondary" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">@{acc.username}</p>
                    <p className="text-xs text-text-secondary">Instagram Business Account</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setIgPickerOpen(false)}
              className="mt-4 w-full text-center text-sm text-text-muted hover:text-text-secondary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Section 1: Connected Accounts */}
      <Card padding="lg">
        <h2 className="font-display text-xl text-text-primary mb-6">
          Connected Accounts
        </h2>
        <div className="space-y-4">
          {PLATFORMS.map(({ key, label, icon: Icon }) => {
            const account = getAccount(key);
            const isConnected = !!account && account.status === "active";

            return (
              <div
                key={key}
                className="flex items-center justify-between py-3 border-b border-card-border last:border-b-0"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#f0ede8] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{label}</p>
                    {isConnected && account.platform_username && (
                      <p className="text-sm text-text-secondary">
                        {account.platform_username}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {loadingAccounts ? (
                    <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
                  ) : isConnected ? (
                    <>
                      {account.last_synced && (
                        <span className="text-sm text-text-secondary hidden sm:inline">
                          Last synced: {formatTimeAgo(account.last_synced)}
                        </span>
                      )}
                      <Badge variant="positive">Connected</Badge>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={syncing === key}
                        onClick={() => handleSync(key)}
                      >
                        {syncing === key ? "Syncing..." : "Re-sync"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger"
                        disabled={disconnecting === key}
                        onClick={() => handleDisconnect(key)}
                      >
                        {disconnecting === key ? "Disconnecting..." : "Disconnect"}
                      </Button>
                    </>
                  ) : (
                    <>
                      {key !== "instagram" && ((session?.user?.plan as string) || "free") !== "pro" ? (
                        <a href="/#pricing">
                          <Button variant="secondary" size="sm">
                            Upgrade to Pro
                          </Button>
                        </a>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder={
                              key === "youtube"
                                ? "youtube.com/c/YourChannel"
                                : `@${key === "facebook" ? "pagename" : "username"}`
                            }
                            value={handleInputs[key] || ""}
                            onChange={(e) =>
                              setHandleInputs((prev) => ({ ...prev, [key]: e.target.value }))
                            }
                            className="h-9 w-32 sm:w-44 ml-2 rounded-lg border border-card-border bg-page-bg px-3 text-sm outline-none focus:border-accent-primary transition-colors"
                          />
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={syncing === key || !handleInputs[key]?.trim()}
                            onClick={() => handleSync(key)}
                          >
                            {syncing === key ? "Syncing..." : "Sync"}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Section 2: Profile */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-text-secondary" />
          <h2 className="font-display text-xl text-text-primary">Profile</h2>
        </div>

        <div className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-accent-primary flex items-center justify-center overflow-hidden">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-display text-2xl text-white">
                  {session?.user?.name
                    ?.split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "?"}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold text-text-primary">
                {session?.user?.name || "—"}
              </p>
              <p className="text-sm text-text-secondary">
                {session?.user?.email || "—"}
              </p>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid gap-5 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Name
              </label>
              <input
                type="text"
                defaultValue={session?.user?.name || ""}
                className="w-full border border-card-border rounded-lg px-4 py-2.5 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Email
              </label>
              <input
                type="email"
                defaultValue={session?.user?.email || ""}
                className="w-full border border-card-border rounded-lg px-4 py-2.5 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40"
              />
            </div>
            <div>
              <Button variant="primary" size="md">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Section 3: Subscription */}
      <Card padding="lg" id="subscription">
        <h2 className="font-display text-xl text-text-primary mb-6">
          Subscription
        </h2>

        {(() => {
          const userPlan = (session?.user?.plan as string) || "hobby";
          const info = PLAN_INFO[userPlan] || PLAN_INFO.hobby;
          return (
            <>
              <div className="rounded-lg border border-card-border p-5 mb-6 max-w-lg">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="info" size="md">
                    {info.name} Plan
                  </Badge>
                  <span className="font-display text-lg text-text-primary">
                    {info.price}
                  </span>
                </div>

                <ul className="space-y-2.5">
                  {info.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm text-text-secondary">
                      <Check className="w-4 h-4 text-success flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-3">
                {userPlan === "hobby" && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={async () => {
                      const res = await fetch("/api/stripe/checkout", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ planId: "pro", interval: "monthly" }),
                      });
                      const data = await res.json();
                      if (data.url) window.location.href = data.url;
                    }}
                  >
                    Upgrade to Pro — $29/mo
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="md"
                  onClick={async () => {
                    const res = await fetch("/api/stripe/portal", { method: "POST" });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  }}
                >
                  Manage Subscription
                </Button>
              </div>
            </>
          );
        })()}
      </Card>

      {/* Section 4: Notifications */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-5 h-5 text-text-secondary" />
          <h2 className="font-display text-xl text-text-primary">
            Notifications
          </h2>
        </div>

        <div className="space-y-1">
          {notificationSettings.map((setting) => {
            const enabled = toggles[setting.id] ?? false;
            return (
              <div
                key={setting.id}
                className="flex items-center justify-between py-4 border-b border-card-border last:border-b-0"
              >
                <div>
                  <p className="font-medium text-text-primary">{setting.label}</p>
                  <p className="text-sm text-text-secondary">{setting.description}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  onClick={() => handleToggle(setting.id)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-primary/40 focus:ring-offset-2 ${
                    enabled ? "bg-accent-primary" : "bg-[#e8e6e1]"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out ${
                      enabled ? "translate-x-[22px]" : "translate-x-0.5"
                    } mt-0.5`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Section 5: Data & Privacy */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-text-secondary" />
          <h2 className="font-display text-xl text-text-primary">
            Data &amp; Privacy
          </h2>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <Button variant="secondary" size="md">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button variant="danger" size="md">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        </div>
        <p className="text-sm text-text-secondary">
          Deleting your account is permanent and cannot be undone. All data, connected accounts, and analytics history will be removed.
        </p>
      </Card>

      {/* Section 6: Support */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-6">
          <Mail className="w-5 h-5 text-text-secondary" />
          <h2 className="font-display text-xl text-text-primary">
            Support
          </h2>
        </div>
        <p className="text-sm text-text-secondary mb-4">
          Report any bugs, membership issues, or questions.
        </p>
        <a
          href="mailto:support@davoxa.com"
          className="inline-flex items-center gap-2 text-sm font-medium text-accent-primary hover:underline transition-colors"
        >
          <Mail className="w-4 h-4" />
          support@davoxa.com
        </a>
      </Card>

      {/* Section 7: Trend Intelligence */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-text-secondary" />
          <h2 className="font-display text-xl text-text-primary">
            Trend Intelligence
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Trend Keywords
            </label>
            <p className="text-xs text-text-muted mb-3">
              Enter comma-separated keywords or niches to customize your trend reports (e.g. &ldquo;fitness, wellness, gym&rdquo;). Leave empty for general trends. Max 10 keywords.
            </p>
            {trendKeywordsLoading ? (
              <div className="h-11 rounded-lg bg-page-bg animate-pulse" />
            ) : (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={trendKeywords}
                  onChange={(e) => setTrendKeywords(e.target.value)}
                  placeholder="e.g. fitness, fashion, tech, cooking"
                  className="flex-1 rounded-lg border border-card-border bg-page-bg px-4 h-11 text-sm outline-none focus:border-accent-primary transition-colors"
                />
                <Button
                  variant="primary"
                  size="md"
                  onClick={saveTrendKeywords}
                  disabled={trendKeywordsSaving}
                >
                  {trendKeywordsSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : trendKeywordsSaved ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Saved
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            )}
          </div>
          <p className="text-xs text-text-muted">
            After saving keywords, click &ldquo;Refresh Report&rdquo; on your dashboard to generate a customized trend report.
          </p>
        </div>
      </Card>

    </div>
  );
}
