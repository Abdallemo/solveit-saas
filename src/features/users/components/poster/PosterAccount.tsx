"use client";

import { useState } from "react";
import { Mail, Bell, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "next-themes";
import useCurrentUser from "@/hooks/useCurrentUser";
import { AppUser } from "../../../../../types/next-auth";
import AccountSubscption from "../Account-subscption";
import { CardWrapper } from "@/components/card-wrapper";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DeleteUserAccount } from "@/features/auth/server/actions";

export default function AccountComponent() {
  const { user, state } = useCurrentUser();
  const [CurrentUser, setUser] = useState<AppUser | undefined>(user);
  const [emailNotification, SetEmailNotification] = useState<boolean>(false);
  const [pushNotification, setPushNotification] = useState<boolean>(false);

  const { setTheme, theme } = useTheme();

  return (
    <main
      className="p-4 lg:p-8 flex justify-center items-center"
      suppressHydrationWarning>
      <div className="max-w-3xl w-full p-4 sm:p-6 md:p-8 lg:p-10">
        <div className="space-y-6 md:space-y-8">
          <CardWrapper
            title="User Preferences"
            description="Manage your profiles, account settings, and preferences for your
              experience."
            footer={
              <>
                <Button variant={"secondary"}>cancel</Button>
                <Button variant={"success"}>save</Button>
              </>
            }
            sections={[
              {
                title: "Profile Information",
                children: (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        defaultValue={CurrentUser?.name ?? ""}
                      />
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue={CurrentUser?.email ?? ""}
                      />
                    </div>
                  </>
                ),
              },
            ]}
          />
          <CardWrapper
            title="Notification Settings"
            sections={[
              {
                children: (
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
                        checked={emailNotification}
                        onCheckedChange={() =>
                          SetEmailNotification((prev) => !prev)
                        }
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          <Label htmlFor="push-notifications">
                            Push Notifications
                          </Label>
                        </div>
                        <Switch
                          id="push-notifications"
                          checked={pushNotification}
                          onCheckedChange={() =>
                            setPushNotification((prev) => !prev)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ),
              },
            ]}
            footer={
              <>
                <Button variant={"secondary"}>cancel</Button>
                <Button variant={"success"}>save</Button>
              </>
            }
          />
          <CardWrapper
            title="Appearance"
            description="Choose from themes that look best to you. Select a single theme,
              or sync with your system."
            footer={"Your selected theme will be used across the application."}
            sections={[
              {
                children: (
                  <div className="space-y-4">
                    <RadioGroup
                      value={theme}
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
                  </div>
                ),
              },
            ]}
          />

          <CardWrapper
            title="Security"
            sections={[
              {
                children: (
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      defaultValue={"********"}
                    />
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />

                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                ),
              },
            ]}
            footer={
              <>
                <Button variant={"secondary"}>cancel</Button>
                <Button variant={"success"}>save</Button>
              </>
            }
          />
          <CardWrapper
            title="Payment Methods"
            sections={[
              {
                children: (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-16 rounded bg-muted flex items-center justify-center">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          •••• •••• •••• 4242
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expires 12/24
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                ),
              },
            ]}
            footer={
              <Button variant="outline" className="w-full">
                Add Payment Method
              </Button>
            }
            footerClassName="flex flex-col"
          />


          <AccountSubscption />

          <div className="flex justify-end gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <form action={DeleteUserAccount} className="">
                    <AlertDialogAction
                      className="bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 w-full"
                      type="submit">
                      Continue
                    </AlertDialogAction>
                  </form>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </main>
  );
}
