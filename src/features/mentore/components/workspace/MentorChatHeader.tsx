import { Button } from "@/components/ui/button";
import { sessionTimeUtils } from "@/lib/utils";
import {
  Video
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { MentorSession } from "../../server/types";

export default function MentorChatHeader({
  session,
  sideBar,
}: {
  session: Exclude<MentorSession, undefined|null>;
  sideBar: boolean;
}) {
  const { sessionDate, timeSlot, sessionStart, sessionEnd } = session;
  const path = usePathname();
  const isPreSession = sessionTimeUtils.isBeforeSession(
    { sessionStart: sessionStart! },
    new Date()
  );
  const isPostSession = sessionTimeUtils.isAfterSession(
    { sessionEnd },
    new Date()
  );

  return (
    <div className="border-b bg-card px-6 py-2 flex items-center justify-between">
      <div className={`flex flex-col md:flex gap-2`}>
        <p className="font-medium">{sessionDate}</p>
        <p className="text-muted-foreground">
          {timeSlot?.start} - {timeSlot?.end}
        </p>
      </div>

      {isPreSession && (
        <div className="flex justify-center ">
          <div className="bg-sidebar px-3 py-1.5 rounded-full text-xs font-medium shadow-inner">
            <p>This is a pre-session</p>
          </div>
        </div>
      )}
      {isPostSession && (
        <div className="flex justify-center ">
          <div className="bg-sidebar px-3 py-1.5 rounded-full text-xs font-medium shadow-inner">
            <p>This Session is Ended and its now ReadOnly</p>
          </div>
        </div>
      )}

      {sideBar && (
        <Button size="sm" className="gap-2" asChild>
          <Link href={`${path}/video-call`}>
            <Video className="h-4 w-4" />
            Video Call
          </Link>
        </Button>
      )}
    </div>
  );
}
