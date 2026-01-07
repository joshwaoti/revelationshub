import { Header } from "@/components/marketing/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Clock, ArrowRight, User } from "lucide-react";
import Link from "next/link";

const blogPosts = [
    {
        slug: "smart-video-editing-for-churches",
        title: "How Smart Video Editing is Transforming Church Communication",
        excerpt: "Discover how intelligent tools are helping churches create more engaging content with less effort.",
        category: "Technology",
        author: "Sarah Johnson",
        date: "Dec 20, 2024",
        readTime: "5 min",
        featured: true,
    },
    {
        slug: "sermon-clips-best-practices",
        title: "10 Best Practices for Creating Viral Sermon Clips",
        excerpt: "Learn the secrets to creating sermon clips that resonate with your audience and spread your message.",
        category: "Tips & Tricks",
        author: "Pastor Michael",
        date: "Dec 18, 2024",
        readTime: "7 min",
        featured: false,
    },
    {
        slug: "small-group-discussion-guides",
        title: "Why Your Church Needs Auto-Generated Discussion Guides",
        excerpt: "See how automated discussion guides can deepen small group engagement and save hours of preparation.",
        category: "Discipleship",
        author: "Emily Chen",
        date: "Dec 15, 2024",
        readTime: "4 min",
        featured: false,
    },
    {
        slug: "social-media-strategy-churches",
        title: "Building a Social Media Strategy for Your Church in 2025",
        excerpt: "A comprehensive guide to reaching more people through strategic social media presence.",
        category: "Marketing",
        author: "David Kim",
        date: "Dec 12, 2024",
        readTime: "8 min",
        featured: false,
    },
    {
        slug: "repurpose-sermon-content",
        title: "7 Ways to Repurpose Your Sunday Sermon",
        excerpt: "Maximize the impact of every message by transforming it into multiple content formats.",
        category: "Tips & Tricks",
        author: "Sarah Johnson",
        date: "Dec 10, 2024",
        readTime: "6 min",
        featured: false,
    },
];

const categories = ["All", "Technology", "Tips & Tricks", "Discipleship", "Marketing"];

export default function BlogPage() {
    return (
        <main className="min-h-screen bg-[var(--color-base)]">
            <Header />

            <div className="pt-28 pb-16 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-text-light)] mb-4">
                            Blog
                        </h1>
                        <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
                            Insights, tips, and best practices for amplifying your ministry through digital content.
                        </p>
                    </div>

                    {/* Search & Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                            <Input
                                type="text"
                                placeholder="Search articles..."
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                            {categories.map((cat) => (
                                <Button
                                    key={cat}
                                    variant={cat === "All" ? "default" : "outline"}
                                    size="sm"
                                    className="shrink-0"
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Featured Post */}
                    {blogPosts.filter(p => p.featured).map((post) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`}>
                            <Card className="mb-8 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                                <div className="grid grid-cols-1 md:grid-cols-2">
                                    <div className="aspect-video md:aspect-auto bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] relative">
                                        <Badge variant="ai" className="absolute top-4 left-4">
                                            Featured
                                        </Badge>
                                    </div>
                                    <CardContent className="p-6 flex flex-col justify-center">
                                        <Badge variant="outline" className="w-fit mb-3">{post.category}</Badge>
                                        <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--color-text-light)] mb-3 group-hover:text-[var(--color-primary)] transition-colors">
                                            {post.title}
                                        </h2>
                                        <p className="text-[var(--color-text-muted)] mb-4">
                                            {post.excerpt}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                                            <span className="flex items-center gap-1">
                                                <User className="h-3.5 w-3.5" />
                                                {post.author}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {post.date}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                {post.readTime}
                                            </span>
                                        </div>
                                    </CardContent>
                                </div>
                            </Card>
                        </Link>
                    ))}

                    {/* Post Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {blogPosts.filter(p => !p.featured).map((post) => (
                            <Link key={post.slug} href={`/blog/${post.slug}`}>
                                <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                                    <div className="aspect-video bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20" />
                                    <CardContent className="p-4">
                                        <Badge variant="outline" className="mb-2">{post.category}</Badge>
                                        <h3 className="font-display text-lg font-semibold text-[var(--color-text-light)] mb-2 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-[var(--color-text-muted)] mb-3 line-clamp-2">
                                            {post.excerpt}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                                            <span>{post.author}</span>
                                            <span>{post.date}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* Load More */}
                    <div className="text-center mt-12">
                        <Button variant="outline">
                            Load More Articles
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}
