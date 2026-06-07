"use server"
import { createWebhook, getRepositories } from "@/module/github/lib/github";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { inngest } from "@/inngest/client";

export const fetchRepositories = async (
    page: number = 1,
    perPage: number = 10
) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    const githubRepos = await getRepositories(page, perPage);

    const dbRepos = await prisma.repository.findMany({
        where: {
            userId: session.user.id,
        },
    });

    const connectedRepoIds = new Set(dbRepos.map((repo => repo.githubId)));



    return githubRepos.map((repo: any) => ({
        ...repo,
        isConnected: connectedRepoIds.has(BigInt(repo.id))
    }))
};

export const connectRepository = async (
    owner: string,
    repo: string,
    githubId: number
) => {
    console.log("=== CONNECT REPOSITORY START ===");
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    // TODO: CHECK IF USER CAN CONNECT MORE REPOS
    console.log("Before createWebhook");
    const webhook = await createWebhook(owner, repo);
    console.log("Webhook result:", webhook);
    if (webhook) {
        console.log("Before Prisma upsert");

        await prisma.repository.upsert({

            where: {
                githubId: BigInt(githubId),
            },
            update: {},
            create: {
                githubId: BigInt(githubId),
                name: repo,
                owner,
                fullName: `${owner}/${repo}`,
                url: `https://github.com/${owner}/${repo}`,
                userId: session.user.id,
            },
        });
        console.log("Prisma upsert success");

    }

    // TODO: INCREMENT REPOSITORY COUNT FOR USAGE TRACKING

    // TODO: TRIGGER REPOSITORY INDEXING FOR RAG (FIRE AND FORGET)
    console.log("Before Inngest");

    try {
        await inngest.send({
            name: "repository.connected",
            data: {
                owner,
                repo,
                userId: session.user.id
            }
        })
        console.log("Inngest success");

    } catch (error) {
        console.error("Failed to trigger repo indexing:::", error);
    }
    console.log("=== CONNECT REPOSITORY END ===");

    return webhook;
};
