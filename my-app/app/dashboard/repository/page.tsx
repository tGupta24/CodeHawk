"use client";

import React, { useEffect, useRef, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Search, Star } from "lucide-react";

import { useRepositories } from "@/module/repository/hooks/use-repositories";
import { RepositoryListSkeleton } from "@/module/repository/components/repository-skeleton";
import { useConnectRepository } from "@/module/repository/hooks/use-connect-repository";

interface Repository {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    stargazers_count: number;
    language: string | null;
    topics: string[];
    isConnected?: boolean;
}

const RepositoryPage = () => {
    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useRepositories();

    const { mutate: connectRepo } = useConnectRepository();

    const [searchQuery, setSearchQuery] = useState("");
    const [localConnectingId, setLocalConnectingId] = useState<number | null>(
        null
    );

    const observerTarget = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    hasNextPage &&
                    !isFetchingNextPage
                ) {
                    fetchNextPage();
                }
            },
            {
                threshold: 1,
            }
        );

        const currentTarget = observerTarget.current;

        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    const allRepositories =
        data?.pages.flatMap((page: Repository[]) => page) || [];

    const filteredRepositories = allRepositories.filter(
        (repo: Repository) =>
            repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleConnect = (repo: Repository) => {
        setLocalConnectingId(repo.id);

        connectRepo(
            {
                owner: repo.full_name.split("/")[0],
                repo: repo.name,
                githubId: repo.id,
            },
            {
                onSettled: () => setLocalConnectingId(null),
            }
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Repositories
                    </h1>
                    <p className="text-muted-foreground">
                        Manage and view all your GitHub repositories
                    </p>
                </div>

                <RepositoryListSkeleton />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center h-400">
                <p className="text-red-500">
                    Failed to load repositories.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Repositories
                </h1>
                <p className="text-muted-foreground">
                    Manage and view all your GitHub repositories
                </p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                <Input
                    placeholder="Search repositories..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Repository List */}
            <div className="grid gap-4">
                {filteredRepositories.map((repo: Repository) => (
                    <Card
                        key={repo.id}
                        className="transition-shadow hover:shadow-md"
                    >
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <CardTitle className="text-lg">
                                            {repo.name}
                                        </CardTitle>

                                        <Badge variant="outline">
                                            {repo.language || "Unknown"}
                                        </Badge>

                                        {repo.isConnected && (
                                            <Badge variant="secondary">
                                                Connected
                                            </Badge>
                                        )}
                                    </div>

                                    <CardDescription>
                                        {repo.description || "No description available"}
                                    </CardDescription>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        asChild
                                    >
                                        <a
                                            href={repo.html_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>

                                    <Button
                                        onClick={() => handleConnect(repo)}
                                        disabled={
                                            localConnectingId === repo.id ||
                                            repo.isConnected
                                        }
                                        variant={
                                            repo.isConnected
                                                ? "outline"
                                                : "default"
                                        }
                                    >
                                        {localConnectingId === repo.id
                                            ? "Connecting..."
                                            : repo.isConnected
                                                ? "Connected"
                                                : "Connect"}
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* Stars */}
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Star className="h-4 w-4" />
                                <span>{repo.stargazers_count}</span>
                            </div>

                            {/* Topics */}
                            {repo.topics?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {repo.topics.slice(0, 5).map((topic) => (
                                        <Badge
                                            key={topic}
                                            variant="secondary"
                                        >
                                            {topic}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Infinite Scroll Loader */}
            <div ref={observerTarget} className="py-4">
                {isFetchingNextPage && (
                    <RepositoryListSkeleton />
                )}

                {!hasNextPage && allRepositories.length > 0 && (
                    <p className="text-center text-muted-foreground">
                        No More Repositories
                    </p>
                )}
            </div>
        </div>
    );
};

export default RepositoryPage;