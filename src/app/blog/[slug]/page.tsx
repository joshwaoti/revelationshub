import { Header } from "@/components/marketing/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ArrowLeft, Share2, BookOpen } from "lucide-react";
import Link from "next/link";

export default function BlogPostPage() {
    return (
        <main className="min-h-screen bg-[var(--color-base)]">
            <Header />

            <article className="pt-28 pb-16 px-4 sm:px-6">
                <div className="max-w-3xl mx-auto">
                    {/* Back Link */}
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Blog
                    </Link>

                    {/* Header */}
                    <header className="mb-8">
                        <Badge variant="outline" className="mb-4">Technology</Badge>
                        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-text-light)] mb-4">
                            How Smart Video Editing is Transforming Church Communication
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-muted)]">
                            <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                Sarah Johnson
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                December 20, 2024
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                5 min read
                            </span>
                        </div>
                    </header>

                    {/* Featured Image */}
                    <div className="aspect-video bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-[var(--radius-default)] mb-8" />

                    {/* Content */}
                    <div className="prose prose-lg max-w-none text-[var(--color-text-light)]">
                        <p className="text-lg leading-relaxed mb-6">
                            In an age where attention spans are shrinking and digital content is king, churches face an
                            unprecedented challenge: how do you make a 45-minute sermon resonate in a world of 60-second videos?
                        </p>

                        <p className="leading-relaxed mb-6">
                            The answer is increasingly found in intelligent automation. Smart video editing tools are
                            transforming how churches repurpose and share their messages, making it possible to create
                            professional-quality content without a full media team.
                        </p>

                        <h2 className="font-display text-2xl font-bold mt-10 mb-4">The Challenge of Modern Ministry</h2>
                        <p className="leading-relaxed mb-6">
                            For years, churches have struggled with a fundamental disconnect: they invest hours preparing and
                            delivering Sunday messages, but that content rarely reaches beyond the walls of the church building.
                            Sure, some churches livestream their services, but how many people actually watch a full hour-long
                            video online?
                        </p>

                        <p className="leading-relaxed mb-6">
                            The data tells a sobering story. According to recent studies, the average viewer abandons online
                            videos within the first 30 seconds. For churches relying on full-length sermon recordings, this
                            means their most powerful moments may never be seen.
                        </p>

                        <h2 className="font-display text-2xl font-bold mt-10 mb-4">How Smart Tools Change Everything</h2>
                        <p className="leading-relaxed mb-6">
                            Smart video editing tools address this challenge head-on. By analyzing sermon transcripts, these
                            tools can automatically identify the most impactful moments—the &quot;aha&quot; insights, the powerful
                            illustrations, the emotional peaks—and extract them as standalone clips.
                        </p>

                        <blockquote className="border-l-4 border-[var(--color-primary)] pl-4 py-2 my-6 bg-[var(--color-primary)]/5 rounded-r">
                            <p className="italic">
                                &quot;What used to take our media team 3-4 hours now happens automatically in about 10 minutes.
                                We&apos;re creating more content than ever before.&quot;
                            </p>
                            <cite className="text-sm text-[var(--color-text-muted)] mt-2 block">— Pastor David Kim, Cornerstone Chapel</cite>
                        </blockquote>

                        <h2 className="font-display text-2xl font-bold mt-10 mb-4">Beyond Just Clips</h2>
                        <p className="leading-relaxed mb-6">
                            But the transformation goes beyond video clips. Modern intelligent tools can generate discussion guides
                            for small groups, create quote graphics for social media, extract podcast-ready audio, and even
                            write blog posts—all from a single sermon recording.
                        </p>

                        <p className="leading-relaxed mb-6">
                            This &quot;one sermon, endless content&quot; approach means that the hours spent preparing Sunday&apos;s
                            message can now generate a week&apos;s worth of content across multiple platforms.
                        </p>

                        <h2 className="font-display text-2xl font-bold mt-10 mb-4">Getting Started</h2>
                        <p className="leading-relaxed mb-6">
                            If you&apos;re ready to explore how smart tools can amplify your ministry&apos;s message, start by evaluating
                            your current content workflow. Ask yourself:
                        </p>

                        <ul className="list-disc list-inside space-y-2 mb-6 text-[var(--color-text-light)]">
                            <li>How much of your sermon content reaches people outside of Sunday morning?</li>
                            <li>How long does it take to create social media content from your messages?</li>
                            <li>Do you have the resources to consistently create engaging clips?</li>
                        </ul>

                        <p className="leading-relaxed mb-6">
                            The good news is that these tools are becoming increasingly accessible and affordable. Many offer
                            free trials, allowing you to experience the transformation firsthand before committing.
                        </p>

                        <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-default)] my-8">
                            <p className="font-medium text-[var(--color-text-light)] mb-2 flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-[var(--color-primary)]" />
                                Ready to Transform Your Ministry?
                            </p>
                            <p className="text-[var(--color-text-muted)] mb-4">
                                Try RevelationsHub free for 14 days and see how it can amplify your message.
                            </p>
                            <Link href="/sign-up">
                                <Button>Start Free Trial</Button>
                            </Link>
                        </div>
                    </div>

                    {/* Share */}
                    <div className="mt-12 pt-8 border-t border-[var(--color-border)] flex items-center justify-between">
                        <div>
                            <p className="font-medium text-[var(--color-text-light)]">Share this article</p>
                            <p className="text-sm text-[var(--color-text-muted)]">Help others discover these insights</p>
                        </div>
                        <Button variant="outline">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                    </div>
                </div>
            </article>
        </main>
    );
}
