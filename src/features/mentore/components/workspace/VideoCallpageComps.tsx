"use client";

import { Button } from "@/components/ui/button";
import { useMentorshipCall } from "@/hooks/use-video-call";
import { Mic, MicOff, PhoneOff, User, Video, VideoOff } from "lucide-react";
import { useRouter } from "next/navigation";

export function VideoCallPageComps({
  userId,
  sessionId,
}: {
  userId: string;
  sessionId: string;
}) {
  const {
    localVideo,
    remoteVideo,
    cameraOn,
    micOn,
    setCameraOn,
    setMicOn,
    endCall,
  } = useMentorshipCall(userId, sessionId as string);
  const router = useRouter();
  // useCallCleanup(endCall);
  return (
    <div className="flex flex-col w-full h-full justify-between items-center rounded-lg border border-white/5 ">
      <div className="flex flex-col md:flex-row gap-2 w-full h-full p-2">
        <div className="flex-1 relative rounded-lg overflow-hidden ">
          {localVideo ? (
            <video
              ref={localVideo}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col h-full w-full items-center justify-center text-gray-400">
              <VideoOff size={48} />
              <p>No camera</p>
            </div>
          )}
          <div className="absolute bottom-2 left-2 text-xs bg-black/50 px-2 py-1 rounded">
            You
          </div>
        </div>

        <div className="flex-1 relative rounded-lg overflow-hidden bg-foreground/50">
          {remoteVideo ? (
            <video
              ref={remoteVideo}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col h-full w-full items-center justify-center ">
              <User size={48} />
              <p>Waiting for peer to join...</p>
            </div>
          )}
          <div className="absolute bottom-2 left-2 text-xs bg-black/50 px-2 py-1 rounded">
            Peer
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4 py-4  w-full">
        <Button variant="ghost" size="icon" onClick={() => setMicOn(!micOn)}>
          {micOn ? <Mic /> : <MicOff className="text-red-500" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCameraOn(!cameraOn)}>
          {cameraOn ? <Video /> : <VideoOff className="text-red-500" />}
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="rounded-full"
          onClick={() => {
            endCall();
            router.back();
          }}>
          <PhoneOff />
        </Button>
      </div>
    </div>
  );
}
