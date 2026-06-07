import { inngest } from "../client";
import { getPullRequestDiff } from "@module/github/lib/github";
import { retrieveContext } from "@module/ai/lib/rag";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import prisma from "@/lib/db";

export const generateReview = inngest.createFunction(
    { id: "generate-review", concurrency: 5 },
    { event: "pr.review.requested" },

    async ({ event, step }) => {
        const { owner, repo, prNumber, userId } = event.data;

        const { diff, title, description, token } = await step.run(
            "fetch-pr-data",
            async () => {
                const account = await prisma.account.findFirst({
                    where: {
                        userId: userId,
                        providerId: "github",
                    },
                });

                if (!account?.accessToken) {
                    throw new Error("No GitHub access token found");
                }

                const data = await getPullRequestDiff(
                    account.accessToken,
                    owner,
                    repo,
                    prNumber
                );

                return {
                    ...data,
                    token: account.accessToken,
                };
            }
        );

        const context = await step.run(
            "retrieve-context",
            async () => {
                const query = `${title}\n${description}`;

                return await retrieveContext(
                    query,
                    `${owner}/${repo}`
                );
            }
        );

        const review = await step.run(
            "generate-ai-review",
            async () => {
                const prompt = `
          Review this pull request and provide:
          1. Summary of changes
          2. Potential issues or bugs
          3. Code quality suggestions
          4. Security concerns
          5. Performance considerations

          Pull Request Title:
          ${title}

          Description:
          ${description}

          Relevant Context:
          ${context}

          Diff:
          ${diff}
        `;

                const { text } = await generateText({
                    model: google("gemini-2.5-pro"),
                    prompt,
                });

                return text;
            }
        );
    }
);