import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { defaultAvatars } from "@/lib/utils/utils";
import { Camera, X } from "lucide-react";
import { useState } from "react";

interface ProfileSelectionProps {
  currentAvatar: string;
  displayName: string;
  onAvatarChange: (avatarUrl: string) => Promise<void>;
}

export function ProfileSelection({
  onAvatarChange,
  currentAvatar,
  displayName,
}: ProfileSelectionProps) {
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const handleAvatarSelect = async (avatarUrl: string) => {
    await onAvatarChange(avatarUrl);
    setShowAvatarSelector(false);
  };

  return (
    <div className="space-y-3">
      <Label>Profile Avatar</Label>
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={currentAvatar || "/placeholder.svg"}
              alt={displayName}
            />
            <AvatarFallback className="text-lg">
              {displayName.split("")[0]}
            </AvatarFallback>
          </Avatar>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full p-0"
            onClick={() => setShowAvatarSelector(!showAvatarSelector)}>
            <Camera className="h-3 w-3" />
          </Button>
        </div>

        {showAvatarSelector && (
          <div className="w-full p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Choose Avatar</span>
              <Button
                size="sm"
                type="button"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => setShowAvatarSelector(false)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {defaultAvatars.map((currentAvatar, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAvatarSelect(currentAvatar)}
                  className="relative group">
                  <Avatar className="h-12 w-12 transition-all group-hover:ring-2 group-hover:ring-primary">
                    <AvatarImage
                      src={currentAvatar || "/placeholder.svg"}
                      alt={`Avatar ${index + 1}`}
                    />
                    <AvatarFallback>A{index + 1}</AvatarFallback>
                  </Avatar>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
