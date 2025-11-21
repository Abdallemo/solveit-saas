"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils/utils";
import { ChevronDown, Loader2 } from "lucide-react";
import { useState } from "react";

const Settings = () => {
  const [isCacheCollapsibleOpen, setIsCacheCollapsibleOpen] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);

  const handleClearCache = () => {
    setIsClearingCache(true);
    // Simulate an async operation
    setTimeout(() => {
      console.log("Cache cleared successfully!");
      setIsClearingCache(false);
    }, 2000);
  };
  // {
  //       id: "notifications",
  //       title: "Notifications",
  //       description: "Configure your notification preferences.",
  //       type: "placeholder",
  //       props: {
  //         message: "This section is currently under development.",
  //       },
  //     },
  // {
  //   id: "appearance",
  //   title: "Appearance",
  //   description: "Customize the appearance of the dashboard.",
  //   type: "placeholder",
  //   props: {
  //     message: "This section is currently under development.",
  //   },
  // },
  type settingsDataType = {
    id: string;
    title: string;
    description: string;
    type: "collapsible-action";
    props: {
      actionName: string;
      actionLabel: string;
      actionVariant:
        | "default"
        | "link"
        | "destructive"
        | "outline"
        | "secondary"
        | "ghost"
        | "success"
        | "ghostNhover"
        | null
        | undefined;
      actionWarning: string;
      actionFunction: () => void;
      isActionLoading: boolean;
      isCollapsibleOpen: boolean;
      setCollapsibleOpen: (b: boolean) => void;
    };
  };
  const settingsData: settingsDataType[] = [
    {
      id: "cache",
      title: "Cache Management",
      description: "Manage your application's cache settings.",
      type: "collapsible-action",
      props: {
        actionName: "Clear Application Cache",
        actionLabel: "Clear Cache",
        actionVariant: "destructive",
        actionWarning:
          "This action will clear all cached data, specifically database queried and cacehd data. this may lead to temporary performance hit",
        actionFunction: handleClearCache,
        isActionLoading: isClearingCache,
        isCollapsibleOpen: isCacheCollapsibleOpen,
        setCollapsibleOpen: setIsCacheCollapsibleOpen,
      },
    },
  ];

  const renderContent = (setting: (typeof settingsData)[number]) => {
    switch (setting.type) {
      case "collapsible-action":
        return (
          <Collapsible
            open={setting.props.isCollapsibleOpen}
            onOpenChange={setting.props.setCollapsibleOpen}
            className="space-y-4">
            <div className="flex items-center justify-between space-x-4">
              <h4 className="font-semibold text-lg">
                {setting.props.actionName}
              </h4>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="icon">
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      setting.props.isCollapsibleOpen && "rotate-180"
                    )}
                  />
                  <span className="sr-only">Toggle</span>
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-4">
              <div className="rounded-md border p-4 text-sm bg-accent/20">
                <p className="font-medium text-destructive">Warning:</p>
                <p className="mt-1 text-muted-foreground">
                  {setting.props.actionWarning}
                </p>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={setting.props.actionFunction}
                  disabled={setting.props.isActionLoading}
                  className="w-full sm:w-auto"
                  variant={setting.props.actionVariant}>
                  {setting.props.isActionLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {setting.props.actionLabel}
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
          <p className="text-muted-foreground">
            Manage site's settings and preferences.
          </p>
        </div>
      </div>

      <div className="space-y-8 max-w-7xl w-full mx-auto">
        {settingsData.map((setting) => (
          <Card key={setting.id}>
            <CardHeader>
              <CardTitle>{setting.title}</CardTitle>
              <CardDescription>{setting.description}</CardDescription>
            </CardHeader>
            <CardContent>{renderContent(setting)}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Settings;
