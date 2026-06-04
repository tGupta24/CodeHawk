"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    getConnectedRepositories,
    disconnectRepository,
    disconnectAllRepositories,
} from "@/module/settings/actions";

import { toast } from "sonner";

import {
    ExternalLink,
    Trash2,
    AlertTriangle,
} from "lucide-react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function RepositoryList() {
    const queryClient = useQueryClient();

    const [disconnectAllOpen, setDisconnectAllOpen] =
        useState(false);

    const {
        data: repositories,
        isLoading,
    } = useQuery({
        queryKey: ["connected-repositories"],
        queryFn: async () =>
            await getConnectedRepositories(),
        staleTime: 1000 * 60 * 2,
        refetchOnWindowFocus: false,
    });

    const disconnectMutation = useMutation({
        mutationFn: async (repositoryId: string) => {
            return await disconnectRepository(repositoryId);
        },

        onSuccess: (result) => {
            if (result?.success) {
                queryClient.invalidateQueries({
                    queryKey: ["connected-repositories"],
                });

                queryClient.invalidateQueries({
                    queryKey: ["dashboard-stats"],
                });

                toast.success(
                    "Repository disconnected successfully"
                );
            } else {
                toast.error(
                    result?.error ||
                    "Failed to disconnect repository"
                );
            }
        },
    });

    const disconnectAllMutation = useMutation({
        mutationFn: async () => {
            return await disconnectAllRepositories();
        },

        onSuccess: (result) => {
            if (result?.success) {
                queryClient.invalidateQueries({
                    queryKey: ["connected-repositories"],
                });

                queryClient.invalidateQueries({
                    queryKey: ["dashboard-stats"],
                });

                toast.success(
                    "All repositories disconnected"
                );

                setDisconnectAllOpen(false);
            } else {
                toast.error(
                    result?.error ||
                    "Failed to disconnect repositories"
                );
            }
        },
    });

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>
                        Connected Repositories
                    </CardTitle>
                    <CardDescription>
                        Manage your connected GitHub repositories
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="h-20 bg-muted rounded" />
                        <div className="h-20 bg-muted rounded" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Connected Repositories
                </CardTitle>
                <CardDescription>
                    Manage your connected GitHub repositories
                </CardDescription>
                <div>
                    {repositories && repositories.length > 0 && (
                        <AlertDialog
                            open={disconnectAllOpen}
                            onOpenChange={setDisconnectAllOpen}
                        >
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    disabled={
                                        !repositories?.length ||
                                        disconnectAllMutation.isPending
                                    }
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Disconnect All
                                </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-destructive" />
                                        Disconnect All Repositories?
                                    </AlertDialogTitle>

                                    <AlertDialogDescription>
                                        This will disconnect all {repositories.length} repositories
                                        and delete all associated AI reviews.
                                        <br />
                                        This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>

                                    <AlertDialogAction
                                        onClick={() =>
                                            disconnectAllMutation.mutate()
                                        }
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        disabled={disconnectAllMutation.isPending}
                                    >
                                        {disconnectAllMutation.isPending
                                            ? "Disconnecting..."
                                            : "Disconnect All"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                {!repositories?.length ? (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">
                            No repositories connected yet.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {repositories.map((repo) => (
                            <div
                                key={repo.id}
                                className="flex items-center justify-between rounded-lg border p-4"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium">
                                            {repo.name}
                                        </h4>

                                        <Badge variant="secondary">
                                            Connected
                                        </Badge>
                                    </div>

                                    <p className="text-sm text-muted-foreground">
                                        {repo.fullName}
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        Connected on{" "}
                                        {new Date(
                                            repo.createdAt
                                        ).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        asChild
                                    >
                                        <a
                                            href={repo.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="ml-4 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>

                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Disconnect Repository?
                                                </AlertDialogTitle>

                                                <AlertDialogDescription>
                                                    This will disconnect{" "}
                                                    <strong>{repo.fullName}</strong>{" "}
                                                    and delete all associated AI
                                                    reviews.
                                                    <br />
                                                    This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>

                                            <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                    Cancel
                                                </AlertDialogCancel>

                                                <AlertDialogAction
                                                    onClick={() =>
                                                        disconnectMutation.mutate(
                                                            repo.id
                                                        )
                                                    }
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    disabled={
                                                        disconnectMutation.isPending
                                                    }
                                                >
                                                    {disconnectMutation.isPending
                                                        ? "Disconnecting..."
                                                        : "Disconnect"}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>


        </Card>
    );
}