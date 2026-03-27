"use client";

import { useState } from "react";
import {
  Mail,
  User,
  Bell,
  Shield,
  Download,
  Trash2,
  Check,
  Camera,
  Play,
  Globe,
} from "lucide-react";
import { connectedAccounts, userProfile, notificationSettings } from "@/lib/mock-data";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const platformIcons: Record<string, React.ElementType> = {
  Instagram: Camera,
  Youtube: Play,
  Facebook: Globe,
  Mail,
};

const planFeatures = [
  "Unlimited connected accounts",
  "AI-powered daily briefings",
  "Advanced analytics dashboard",
  "Priority brand deal matching",
  "Custom reporting & exports",
];

export default function SettingsPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(notificationSettings.map((s) => [s.id, s.enabled]))
  );

  const handleToggle = (id: string) => {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-10">
      {/* Section 1: Connected Accounts */}
      <Card padding="lg">
        <h2 className="font-display text-xl text-text-primary mb-6">
          Connected Accounts
        </h2>
        <div className="space-y-4">
          {connectedAccounts.map((account) => {
            const Icon = platformIcons[account.icon] ?? Mail;
            return (
              <div
                key={account.platform}
                className="flex items-center justify-between py-3 border-b border-card-border last:border-b-0"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#f0ede8] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">
                      {account.platform}
                    </p>
                    {account.connected && account.handle && (
                      <p className="text-sm text-text-secondary">
                        {account.handle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {account.connected ? (
                    <>
                      <span className="text-sm text-text-secondary hidden sm:inline">
                        Last synced: {account.lastSync}
                      </span>
                      <Badge variant="positive">Connected</Badge>
                      <Button variant="ghost" size="sm" className="text-danger">
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <>
                      <Badge variant="neutral">Not connected</Badge>
                      <Button variant="primary" size="sm">
                        Connect
                      </Button>
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
            <div className="w-20 h-20 rounded-full bg-accent-primary flex items-center justify-center">
              <span className="font-display text-2xl text-white">IB</span>
            </div>
            <div>
              <p className="font-semibold text-text-primary">{userProfile.name}</p>
              <p className="text-sm text-text-secondary">{userProfile.email}</p>
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
                defaultValue={userProfile.name}
                className="w-full border border-card-border rounded-lg px-4 py-2.5 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Email
              </label>
              <input
                type="email"
                defaultValue={userProfile.email}
                className="w-full border border-card-border rounded-lg px-4 py-2.5 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Business Name
              </label>
              <input
                type="text"
                defaultValue={userProfile.businessName}
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
      <Card padding="lg">
        <h2 className="font-display text-xl text-text-primary mb-6">
          Subscription
        </h2>

        <div className="rounded-lg border border-card-border p-5 mb-6 max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="info" size="md">
              Pro Plan
            </Badge>
            <span className="font-display text-xl text-text-primary">
              $29<span className="text-sm font-body text-text-secondary">/month</span>
            </span>
          </div>

          <ul className="space-y-2.5">
            {planFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-sm text-text-secondary">
                <Check className="w-4 h-4 text-success flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <Button variant="secondary" size="md">
          Upgrade to Enterprise
        </Button>
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
    </div>
  );
}
