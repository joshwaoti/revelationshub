"use client";

import { use, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Loader2,
    ArrowLeft,
} from "lucide-react";
import { DownloadClipButton } from "@/components/DownloadClipButton";
import Link from "next/link";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function VideoEditorPage({ params }: PageProps) {
    const { id: sermonId } = use(params);
    const searchParams = useSearchParams();
    const clipId = searchParams.get("clip") as Id<"clips"> | null;

    // Fetch data
    const sermon = useQuery(api.sermons.getById, { sermonId: sermonId as Id<"sermons"> });
    const clip = useQuery(api.clips.getById, clipId ? { clipId } : "skip");

    // State
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Signed URL for video
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    // Fetch video URL when clip loads
    useEffect(() => {
        if (clip?.s3Key) {
            const fetchUrl = async () => {
                try {
                    const res = await fetch(`/api/s3/signed-url?key=${encodeURIComponent(clip.s3Key)}`);
                    const data = await res.json();
                    if (data.url) setVideoUrl(data.url);
                } catch (e) {
                    console.error("Failed to get video URL", e);
                }
            };
            fetchUrl();
        }
    }, [clip?.s3Key]);

    // Video Control Helpers
    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleSeekTo = (time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, Math.min(time, videoRef.current.duration || 0));
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
            setDuration(videoRef.current.duration || 0);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration || 0);
        }
    };

    // Loading states
    if (!clipId) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="p-6">
                    <p className="text-[var(--color-text-muted)]">No clip selected. Please select a clip from the clips page.</p>
                    <Link href={`/sermon/${sermonId}/clips`}>
                        <Button className="mt-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Go to Clips
                        </Button>
                    </Link>
                </Card>
            </div>
        );
    }

    if (clip === undefined || sermon === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    if (clip === null) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="p-6 text-center">
                    <p className="text-[var(--color-text-muted)]">Clip not found</p>
                    <Link href={`/sermon/${sermonId}/clips`}>
                        <Button className="mt-4">Go to Clips</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[var(--color-base)]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                <div className="flex items-center gap-4">
                    <Link href={`/sermon/${sermonId}/clips`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Clips
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-semibold text-lg text-[var(--color-text-light)]">
                            Video Clip
                        </h1>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            {sermon?.title} • Clip at {Math.floor(clip.startTime / 60)}:{Math.floor(clip.startTime % 60).toString().padStart(2, '0')}
                        </p>
                    </div>
                </div>
                <Badge
                    className={
                        clip.status === "ready"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                    }
                >
                    {clip.status === "ready" ? "Ready" : "Processing"}
                </Badge>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Video Preview */}
                <div className="flex-1 flex flex-col items-center justify-center bg-[var(--color-base)] p-8">
                    <div className="relative aspect-[9/16] max-h-[80vh] w-auto bg-black rounded-lg shadow-2xl overflow-hidden group">
                        {/* Main Video */}
                        <video
                            ref={videoRef}
                            src={videoUrl || undefined}
                            className="w-full h-full object-cover"
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onClick={togglePlay}
                            playsInline
                            controls
                        />

                        {/* Play/Pause Overlay Button (shows when paused) */}
                        {!isPlaying && (
                            <div
                                className="absolute inset-0 flex items-center justify-center bg-black/20"
                                onClick={togglePlay}
                            >
                                <div className="h-16 w-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 cursor-pointer transition-colors">
                                    <Play className="h-8 w-8 text-white fill-current ml-1" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Timeline Controls */}
                    <div className="mt-6 w-full max-w-md bg-[var(--color-surface)] p-4 rounded-lg border border-[var(--color-border)]">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-mono text-[var(--color-text-muted)]">
                                {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
                            </span>
                            <div className="flex items-center gap-3">
                                <button onClick={() => handleSeekTo(currentTime - 5)} className="p-2 hover:text-[var(--color-primary)] transition-colors">
                                    <SkipBack className="h-5 w-5" />
                                </button>
                                <button onClick={togglePlay} className="p-2 hover:text-[var(--color-primary)] transition-colors">
                                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                                </button>
                                <button onClick={() => handleSeekTo(currentTime + 5)} className="p-2 hover:text-[var(--color-primary)] transition-colors">
                                    <SkipForward className="h-5 w-5" />
                                </button>
                            </div>
                            <span className="text-sm font-mono text-[var(--color-text-muted)]">
                                {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
                            </span>
                        </div>

                        {/* Progress bar */}
                        <div
                            className="w-full h-2 bg-[var(--color-border)] rounded-full cursor-pointer overflow-hidden"
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const percent = (e.clientX - rect.left) / rect.width;
                                const time = percent * duration;
                                handleSeekTo(time);
                            }}
                        >
                            <div
                                className="h-full bg-[var(--color-primary)] transition-all"
                                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Download Section */}
                    <div className="mt-6 w-full max-w-md">
                        <Card className="bg-[var(--color-surface)] border-[var(--color-border)]">
                            <CardContent className="p-6 text-center">
                                <h3 className="font-medium mb-2 text-[var(--color-text-light)]">Download Video</h3>
                                <p className="text-sm text-[var(--color-text-muted)] mb-4">
                                    This clip has captions burned in from processing.
                                </p>
                                <DownloadClipButton
                                    clipS3Key={clip.s3Key}
                                    clipTitle={`${sermon?.title || "sermon"}_clip_${Math.floor(clip.startTime)}`}
                                    className="w-full"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
