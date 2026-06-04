"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { deleteWebhook } from "@/module/github/lib/github";

export async function getUserProfile() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const user = await prisma.user.findUnique({
            where: {
                id: session.user.id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                createdAt: true,
            },
        });

        return user;
    } catch (error) {
        console.error("Error fetching profile::", error);
        throw error;
    }
}

export async function updateUserProfile(data: {
    name?: string;
    email?: string;
}) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                name: data.name,
                email: data.email,
            },
            select: {
                id: true,
                name: true,
                email: true
            }
        });
        revalidatePath("/dashboard,settings", "page");
        return {
            success: true,
            user: updatedUser
        }
    } catch (error) {
        console.error("Error updateing user profile::", error);
        return { success: false, error: "Failed to update profile" }
    }
}

export const getConnectedRepositories = async () => {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const repositories = await prisma.repository.findMany({
            where: {
                userId: session.user.id,
            },
            select: {
                id: true,
                name: true,
                fullName: true,
                url: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return repositories;
    } catch (error) {
        console.error("Error fetching repositories:", error);
        throw error;
    }
};

export const disconnectRepository = async (
    repositoryId: string
) => {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const repository = await prisma.repository.findUnique({
            where: {
                id: repositoryId,
                userId: session.user.id,
            },
        });

        if (!repository) {
            throw new Error("Repository not found");
        }


        await deleteWebhook(repository.owner, repository.name);

        await prisma.repository.delete({
            where: {
                id: repositoryId,
            },
        });

        revalidatePath("/dashboard/settings", "page");
        revalidatePath("/dashboard/repository", "page");

        return {
            success: true,
        };
    } catch (error) {
        console.error(
            "Error disconnecting repository:",
            error
        );

        return {
            success: false,
            error: "Failed to disconnect repository",
        };
    }
};

export const disconnectAllRepositories = async () => {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const repositories = await prisma.repository.findMany({
            where: {
                userId: session.user.id,
            },
        });

        await Promise.all(
            repositories.map(async (repository) => {

                try {
                    await deleteWebhook(repository.owner, repository.name);
                } catch (error) {
                    console.error(
                        `Failed to delete webhook for ${repository.fullName}`,
                        error
                    );
                }
            })
        );

        await prisma.repository.deleteMany({
            where: {
                userId: session.user.id,
            },
        });

        revalidatePath("/dashboard/settings");
        revalidatePath("/dashboard/repository");
        return {
            success: true,
            count: repositories.length,
        };
    } catch (error) {
        console.error("Error disconnecting repositories:", error);

        return {
            success: false,
            error: "Failed to disconnect repositories",
        };
    }
};

