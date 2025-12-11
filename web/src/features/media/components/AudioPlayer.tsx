"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils/utils";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import * as React from "react";

interface AudioPlayerProps {
  src: string;
  title?: string;
  className?: string;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function AudioVisualizer({
  analyser,
  isPlaying,
}: {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const animationRef = React.useRef<number>(0);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const displayWidth = rect.width;
    const displayHeight = rect.height;

    const styles = getComputedStyle(canvas);
    const primaryColor =
      styles.getPropertyValue("--primary").trim() || "217 91% 60%";

    const drawBars = (dataArray?: Uint8Array) => {
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      const barCount = 32;
      const barWidth = displayWidth / barCount - 2;
      const barGap = 2;

      for (let i = 0; i < barCount; i++) {
        let barHeight: number;
        let opacity: number;

        if (dataArray) {
          const bufferLength = dataArray.length;
          const dataIndex = Math.floor((i / barCount) * bufferLength * 0.5);
          barHeight = (dataArray[dataIndex] / 255) * displayHeight * 0.9;
          opacity = 0.4 + (barHeight / displayHeight) * 0.6;
        } else {
          barHeight = 4 + Math.random() * 8;
          opacity = 0.3;
        }

        const x = i * (barWidth + barGap);
        const y = displayHeight - barHeight;

        ctx.fillStyle = `hsl(${primaryColor} / ${opacity})`;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }
    };

    if (isPlaying && analyser) {
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        animationRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        drawBars(dataArray);
      };

      draw();
    } else {
      drawBars();
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="h-50 w-full rounded-md "
      style={{ width: "100%", height: "200px" }}
    />
  );
}

function AudioPlayer({ src, title, className }: AudioPlayerProps) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(false);

  const [analyser, setAnalyser] = React.useState<AnalyserNode | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const sourceRef = React.useRef<MediaElementAudioSourceNode | null>(null);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const initAudioContext = () => {
    if (audioContextRef.current || !audioRef.current) return;

    const audioContext = new AudioContext();
    const analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 256;

    const source = audioContext.createMediaElementSource(audioRef.current);
    source.connect(analyserNode);
    analyserNode.connect(audioContext.destination);

    audioContextRef.current = audioContext;
    sourceRef.current = source;
    setAnalyser(analyserNode);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      initAudioContext();
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume || 1;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card p-4 text-card-foreground h-full justify-center",
        className,
      )}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        crossOrigin="anonymous"
      />

      {title && (
        <div className="truncate text-sm font-medium text-foreground">
          {title}
        </div>
      )}

      <AudioVisualizer analyser={analyser} isPlaying={isPlaying} />

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={togglePlay}
          className="size-9 shrink-0 bg-transparent"
        >
          {isPlaying ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4 ml-0.5" />
          )}
        </Button>

        <div className="flex flex-1 items-center gap-2">
          <span className="w-10 text-xs tabular-nums text-muted-foreground">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="flex-1"
          />
          <span className="w-10 text-xs tabular-nums text-muted-foreground">
            {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="size-8 shrink-0"
          >
            {isMuted ? (
              <VolumeX className="size-4" />
            ) : (
              <Volume2 className="size-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-20"
          />
        </div>
      </div>
    </div>
  );
}

export { AudioPlayer };
