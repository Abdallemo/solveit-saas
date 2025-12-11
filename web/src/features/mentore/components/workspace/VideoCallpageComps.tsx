"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMentorshipSession } from "@/contexts/MentorSessionContext";
import { useIsMobile } from "@/hooks/use-mobile";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useMentorshipCall } from "@/hooks/useVideoCall";
import { cn } from "@/lib/utils/utils";
import {
  ChevronDown,
  Maximize2,
  MessageSquareText,
  Mic,
  MicOff,
  Minimize2,
  Monitor,
  MonitorOff,
  PhoneOff,
  User,
  Video,
  VideoOff,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MentorshipWorkspace from "./MentorshipWorkspace";

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
    localScreenShare,
    remoteScreenShare,
    cameraOn,
    micOn,
    setCameraOn,
    setMicOn,
    isScreenSharing,
    endCall,
    devices,
    selectedCamera,
    selectedMic,
    switchCamera,
    switchMic,
    setToggleScreenShare,
    localStream,
    startCall,
    remoteStream,
    remoteScreenStream,
    clearState,
    localScreenStream,
  } = useMentorshipCall(userId, sessionId);

  const router = useRouter();
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);
  const { user } = useCurrentUser();
  const { mentorshipSession } = useMentorshipSession();
  const [messageSideOpen, setMessageSideOpen] = useState(false); // RESTORED
  const isMobile = useIsMobile();
  const path = usePathname().replace("video-call", "");

  useEffect(() => {
    if (expandedVideo) {
      const stillExists =
        (expandedVideo === "local" && localStream) ||
        (expandedVideo === "remote" && remoteStream) ||
        (expandedVideo === "localScreen" && localScreenStream) ||
        (expandedVideo === "remoteScreen" && remoteScreenStream);

      if (!stillExists) {
        const timer = setTimeout(() => setExpandedVideo(null), 200);
        return () => clearTimeout(timer);
      }
    }
  }, [
    expandedVideo,
    localStream,
    remoteStream,
    localScreenStream,
    remoteScreenStream,
  ]);

  useEffect(() => {
    const start = async () => {
      await startCall();
    };
    start();
  }, [startCall]);

  const remotePeerName = (() => {
    if (!user || !mentorshipSession?.bookedSessions) {
      return "Peer";
    }

    const session = mentorshipSession.bookedSessions;

    if (user.id === session.posterId) {
      return session.solver.displayName || "Solver";
    }

    if (user.id === session.solverId) {
      return session.poster.name || "Poster";
    }

    return "Peer";
  })();

  const activeStreams = [
    { ref: localStream, label: "You", type: "camera" },
    { ref: remoteStream, label: "Peer", type: "camera" },
    localScreenShare && {
      ref: localScreenShare,
      label: "Your Screen",
      type: "screen",
    },
    remoteScreenStream && {
      ref: remoteScreenShare,
      label: "Peer's Screen",
      type: "screen",
    },
  ].filter(Boolean);

  const streamCount = activeStreams.length;

  const getGridClass = () => {
    if (expandedVideo) return "grid-cols-1";

    if (streamCount <= 2) return "grid-cols-1 sm:grid-cols-2";
    if (streamCount === 3) return "grid-cols-1 sm:grid-cols-2";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2";
  };

  const toggleExpand = (videoId: string) => {
    setExpandedVideo(expandedVideo === videoId ? null : videoId);
  };

  return (
    <div className="flex flex-col w-full h-full justify-between items-center bg-background">
      <div className="w-full flex items-center justify-center flex-wrap gap-1 px-6 py-3 border-b border-border bg-background/95 backdrop-blur-sm flex-shrink-0 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 px-3 text-sm font-normal bg-muted/50 hover:bg-muted gap-2 rounded-full">
              <Mic size={16} />
              <span className="max-w-[200px] truncate">
                {devices.microphones.find((m) => m.deviceId === selectedMic)
                  ?.label || "Microphone"}
              </span>
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[280px]">
            {devices.microphones.map((mic) => (
              <DropdownMenuItem
                key={mic.deviceId}
                onClick={() => switchMic(mic.deviceId)}
                className={cn(
                  "cursor-pointer",
                  selectedMic === mic.deviceId && "bg-accent"
                )}>
                <Mic size={16} className="mr-2" />
                <span className="truncate">{mic.label || "Microphone"}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 px-3 text-sm font-normal bg-muted/50 hover:bg-muted gap-2 rounded-full">
              <Video size={16} />
              <span className="max-w-[200px] truncate">
                {devices.cameras.find((c) => c.deviceId === selectedCamera)
                  ?.label || "Camera"}
              </span>
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[280px]">
            {devices.cameras.map((cam) => (
              <DropdownMenuItem
                key={cam.deviceId}
                onClick={() => switchCamera(cam.deviceId)}
                className={cn(
                  "cursor-pointer",
                  selectedCamera === cam.deviceId && "bg-accent"
                )}>
                <Video size={16} className="mr-2" />
                <span className="truncate">{cam.label || "Camera"}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative flex-1 w-full overflow-hidden">
        <div
          className={cn(
            "grid auto-rows-[minmax(200px,1fr)] gap-3 h-full p-4 mx-auto transition-all duration-300",
            messageSideOpen && !isMobile
              ? "max-w-[calc(100%-400px)] w-full"
              : "max-w-7xl w-full",
            getGridClass()
          )}>
          <div
            className={cn(
              "relative rounded-2xl overflow-hidden bg-black shadow-lg border border-border transition-all duration-300 hover:scale-[1.01]",
              expandedVideo === "local" ? "col-span-full row-span-2" : "",
              expandedVideo && expandedVideo !== "local" ? "hidden" : ""
            )}>
            {localStream ? (
              <>
                <video
                  ref={localVideo}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 text-xs bg-black/70 text-white px-3 py-1.5 rounded-lg backdrop-blur-sm font-medium">
                  <div className="flex gap-2 justify-center items-center">
                    <span>You</span>
                    <span>{!cameraOn && <VideoOff size={10} />}</span>
                    <span>{!micOn && <MicOff size={10} />}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 h-8 w-8 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm rounded-lg"
                  onClick={() => toggleExpand("local")}>
                  {expandedVideo === "local" ? (
                    <Minimize2 size={16} />
                  ) : (
                    <Maximize2 size={16} />
                  )}
                </Button>
              </>
            ) : (
              <div className="flex flex-col h-full w-full items-center justify-center text-muted-foreground">
                <User size={48} />
                <p className="mt-2">Connecting...</p>
              </div>
            )}
          </div>

          <div
            className={cn(
              "relative rounded-2xl overflow-hidden bg-black shadow-lg border border-border transition-all duration-300 hover:scale-[1.01]",
              expandedVideo === "remote" ? "col-span-full row-span-2" : "",
              expandedVideo && expandedVideo !== "remote" ? "hidden" : ""
            )}>
            {remoteStream ? (
              <>
                <video
                  ref={remoteVideo}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 text-xs bg-black/70 text-white px-3 py-1.5 rounded-lg backdrop-blur-sm font-medium">
                  {remotePeerName}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 h-8 w-8 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm rounded-lg"
                  onClick={() => toggleExpand("remote")}>
                  {expandedVideo === "remote" ? (
                    <Minimize2 size={16} />
                  ) : (
                    <Maximize2 size={16} />
                  )}
                </Button>
              </>
            ) : (
              <div className="flex flex-col h-full w-full items-center justify-center text-muted-foreground">
                <User size={48} />
                <p className="mt-2">Waiting for {remotePeerName}...</p>
              </div>
            )}
          </div>

          {isScreenSharing && localScreenStream && (
            <div
              className={cn(
                "relative rounded-2xl overflow-hidden bg-black shadow-lg border border-primary transition-all duration-300 hover:scale-[1.01]",
                streamCount === 3 ? "col-span-full sm:col-span-1" : "",
                expandedVideo === "localScreen"
                  ? "col-span-full row-span-2"
                  : "",
                expandedVideo && expandedVideo !== "localScreen" ? "hidden" : ""
              )}>
              <video
                ref={localScreenShare}
                autoPlay
                playsInline
                className="w-full h-full object-contain bg-black"
              />
              <div className="absolute bottom-3 left-3 text-xs bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-1.5 font-medium">
                <Monitor size={14} />
                Your Screen
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 h-8 w-8 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm rounded-lg"
                onClick={() => toggleExpand("localScreen")}>
                {expandedVideo === "localScreen" ? (
                  <Minimize2 size={16} />
                ) : (
                  <Maximize2 size={16} />
                )}
              </Button>
            </div>
          )}

          {remoteScreenStream && (
            <div
              className={cn(
                "relative rounded-2xl overflow-hidden bg-black shadow-lg border border-accent transition-all duration-300 hover:scale-[1.01]",
                streamCount === 3 ? "col-span-full sm:col-span-1" : "",
                expandedVideo === "remoteScreen"
                  ? "col-span-full row-span-2"
                  : "",
                expandedVideo && expandedVideo !== "remoteScreen"
                  ? "hidden"
                  : ""
              )}>
              <video
                ref={remoteScreenShare}
                autoPlay
                playsInline
                className="w-full h-full object-contain bg-black"
              />
              <div className="absolute bottom-3 left-3 text-xs bg-accent/90 text-accent-foreground px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-1.5 font-medium">
                <Monitor size={14} />
                {remotePeerName}'s Screen
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 h-8 w-8 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm rounded-lg"
                onClick={() => toggleExpand("remoteScreen")}>
                {expandedVideo === "remoteScreen" ? (
                  <Minimize2 size={16} />
                ) : (
                  <Maximize2 size={16} />
                )}
              </Button>
            </div>
          )}
        </div>

        {messageSideOpen && (
          <div
            className={cn(
              "absolute inset-y-0 right-0 flex justify-end transition-all duration-300 ease-in-out overflow-hidden z-20",
              messageSideOpen ? "pointer-events-auto" : "pointer-events-none"
            )}>
            <div
              onClick={() => setMessageSideOpen(false)}
              className={cn(
                "absolute inset-0 bg-black/30 transition-opacity duration-300 hidden md:block",
                messageSideOpen ? "opacity-100" : "opacity-0"
              )}
            />

            <div
              className={cn(
                "relative h-full w-full sm:w-[400px] bg-background border-l border-border shadow-xl transition-transform duration-300 ease-in-out rounded-l-2xl flex-shrink-0",
                messageSideOpen ? "translate-x-0" : "translate-x-full"
              )}>
              <MentorshipWorkspace sidebar={false} controlled />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 py-4 px-6 w-full border-t border-border bg-background/95 backdrop-blur-sm flex-shrink-0 z-10">
        <div className="flex justify-center items-center gap-3 w-full">
          <Button
            variant={micOn ? "ghost" : "destructive"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={() => setMicOn()}>
            {micOn ? <Mic size={20} /> : <MicOff size={20} />}
          </Button>

          <Button
            variant={cameraOn ? "ghost" : "destructive"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={() => setCameraOn()}>
            {cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
          </Button>

          <Button
            variant={isScreenSharing ? "default" : "ghost"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={async () => await setToggleScreenShare()}>
            {isScreenSharing ? <Monitor size={20} /> : <MonitorOff size={20} />}
          </Button>

          <div className="w-px h-10 bg-border mx-1" />

          <Button
            variant="destructive"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={async () => {
              await endCall();
              clearState();
              router.back();
            }}>
            <PhoneOff size={20} />
          </Button>
        </div>

        <Button
          onClick={() => setMessageSideOpen((prev) => !prev)}
          variant={messageSideOpen ? "default" : "ghost"}
          size="icon"
          className="h-12 w-12 rounded-full flex-shrink-0">
          <MessageSquareText size={20} />
        </Button>
      </div>
    </div>
  );
}
