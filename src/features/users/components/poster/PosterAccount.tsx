"use client";

import { useState } from "react";
import { LogOut, Mail, Bell, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "next-themes";
import useCurrentUser from "@/hooks/useCurrentUser";
import { AppUser } from "../../../../../types/next-auth";

export default function PosterAccount() {
  const Currentuser = useCurrentUser();
  const [user, setUser] = useState<AppUser | undefined>(Currentuser );

  const { setTheme, theme } = useTheme();

  return (
    <main className="flex-1 p-4 lg:p-8 flex justify-center items-center" suppressHydrationWarning >
      <div className="max-w-3xl w-full p-4 sm:p-6 md:p-8 lg:p-10">
        <div className="space-y-6 md:space-y-8">
          
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">User Preferences</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your profiles, account settings, and preferences for your
              experience.
            </p>
          </div>

          <div className="space-y-3 md:space-y-4">
            <h2 className="text-base md:text-lg font-semibold">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  defaultValue={user?.name ?? ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  defaultValue={user?.name?.split(" ")}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user?.email ?? ""}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              {/* <Textarea
                id="bio"
                className="min-h-[100px]"
                placeholder="Tell us about yourself"
                value={user.bio}
                onChange={(e) => setUser({ ...user, bio: e.target.value })}
              /> */}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Account Identities</h2>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground">
                <span>{user?.name?.split("")[0]}</span>
              </div>
              <div>
                <p className="font-medium">{user?.name?.split(' ')[0]}</p>
                <p className="text-sm text-muted-foreground">
                  {user?.name} • {user?.email}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Notification Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <Label htmlFor="email-notifications">
                    Email Notifications
                  </Label>
                </div>
                <Switch
                  id="email-notifications"
                  checked={true}
                  
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                </div>
                <Switch
                  id="push-notifications"
                  checked={true}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Appearance</h2>
            <p className="text-muted-foreground">
              Choose from themes that look best to you. Select a single theme,
              or sync with your system.
            </p>

            <RadioGroup
              value={theme }
              onValueChange={(value) => setTheme(value)}
              className="grid grid-cols-3 gap-4">
              <div>
                <RadioGroupItem
                  value="dark"
                  id="dark"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="dark"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                  <span>Dark</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="light"
                  id="light"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="light"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                  <span>Light</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="system"
                  id="system"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="system"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                  <span>System</span>
                </Label>
              </div>
            </RadioGroup>

            <div className="pt-4">
              <p className="text-sm text-muted-foreground">
                Your selected theme will be used across the application.
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Security</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  defaultValue={'********'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Payment Methods</h2>
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-16 rounded bg-muted flex items-center justify-center">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                    <p className="text-xs text-muted-foreground">
                      Expires 12/24
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Add Payment Method
            </Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Account Management</h2>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Download account data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Request data deletion
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end gap-2">
            <Button variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
            <Button variant="destructive">Delete account</Button>
            <Button>Save all changes</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
