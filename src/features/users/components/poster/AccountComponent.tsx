"use client";

import { CardWrapper } from "@/components/card-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import useCurrentUser from "@/hooks/useCurrentUser";
import { Bell, CreditCard, Loader2, Mail } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useTransition } from "react";
import AccountSubscption from "../Account-subscption";

import UserPreferencesLoading from "@/app/dashboard/poster/account/loading";
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
import { Badge } from "@/components/ui/badge";
import { DeleteUserAccount } from "@/features/auth/server/actions";
import {
  cardsType,
  ManageUserCreditCardPortal,
} from "@/features/payments/server/action";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
export default function AccountComponent({
  isOauthUser,
  cards,
}: {
  isOauthUser: boolean;
  cards: cardsType;
}) {
  const { user, state: isLoading } = useCurrentUser();
  const [emailNotification, SetEmailNotification] = useState<boolean>(false);
  const [pushNotification, setPushNotification] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const [open, setOpen] = useState(false);
  const { mutateAsync: DeleteAccountMutation, isPending: isDeleting } =
    useMutation({
      mutationFn: DeleteUserAccount,
      // onError: () =>
      //   toast.error("something went wrong try again", {
      //     action: {
      //       label: <RotateCcw size={"10"} />,
      //       onClick: async () => {
      //         await DeleteAccountMutation();
      //       },
      //     },
      //   }),
    });
  if (isLoading) return <UserPreferencesLoading />;
  return (
    <div className="w-full  mt-5" suppressHydrationWarning>
      <div className="flex flex-col items-center gap-5 px-6 ">
        <CardWrapper
          title="User Preferences"
          description="Manage your profiles, account settings, and preferences for your
              experience."
          footer={
            <>
              <Button
                variant={"secondary"}
                onClick={() => toast.error("cancled")}
              >
                cancel
              </Button>
              <Button
                variant={"success"}
                onClick={() => toast.success("saved")}
              >
                save
              </Button>
            </>
          }
          sections={[
            {
              title: "Profile Information",
              children: (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" defaultValue={user?.name ?? ""} />
                    <Label htmlFor="email">Email</Label>
                    <Input
                      disabled={isOauthUser}
                      id="email"
                      type="email"
                      defaultValue={user?.email ?? ""}
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
              <Button
                variant={"secondary"}
                onClick={() => toast.error("cancled")}
              >
                cancel
              </Button>
              <Button
                variant={"success"}
                onClick={() => toast.success("saved")}
              >
                save
              </Button>
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
                    className="grid grid-cols-3 gap-4"
                  >
                    <div>
                      <RadioGroupItem
                        value="dark"
                        id="dark"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="dark"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
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
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
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
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <span>System</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              ),
            },
          ]}
        />

        {!isOauthUser && (
          <CardWrapper
            title="Security"
            sections={[
              {
                children: (
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      disabled={isOauthUser}
                      id="current-password"
                      type="password"
                      autoComplete="new-password"
                    />
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      disabled={isOauthUser}
                      id="new-password"
                      type="password"
                    />

                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      disabled={isOauthUser}
                      id="confirm-password"
                      type="password"
                    />
                  </div>
                ),
              },
            ]}
            footer={
              <>
                <Button
                  variant={"secondary"}
                  onClick={() => toast.error("cancled")}
                >
                  cancel
                </Button>
                <Button
                  variant={"success"}
                  onClick={() => toast.success("saved")}
                >
                  save
                </Button>
              </>
            }
          />
        )}
        <CardWrapper
          title="Payment Methods"
          sections={[
            {
              children:
                cards.length > 0 &&
                cards.map((card) => (
                  <div
                    className="flex items-center justify-between"
                    key={card.id}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-16 rounded bg-muted flex items-center justify-center">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          •••• •••• •••• {card.last4}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expires {card.exp_month}/{card.exp_year}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{card.brand}</Badge>
                  </div>
                )),
            },
          ]}
          footer={
            <Button
              variant="outline"
              className="w-full"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const url = (await ManageUserCreditCardPortal())!;
                  router.push(url);
                })
              }
            >
              {isPending && <Loader2 className="animate-spin" />}
              Add Payment Method
            </Button>
          }
          footerClassName="flex flex-col"
        />

        <AccountSubscption />

        <AlertDialog open={open || isDeleting} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="cursor-pointer  w-full max-w-4xl "
            >
              Delete account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="w-full ">
              <AlertDialogCancel className="cursor-pointer w-1/2">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  await DeleteAccountMutation();
                }}
                disabled={isDeleting}
                className="cursor-pointer bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 w-1/2"
              >
                {isDeleting && <Loader2 className="animate-spin" />}
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
