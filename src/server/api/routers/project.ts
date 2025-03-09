import { pollCommits } from "@/lib/github";
import { createTRPCRouter, proctedProcedure, publicProcedure } from "../trpc";
import { z } from "zod"
import { indexGithubRepo } from "@/lib/github-loader";
import { truncate } from "fs";
export const projectRouter = createTRPCRouter({
    createProject: proctedProcedure.input(
        z.object({
            name: z.string(),
            githubUrl: z.string(),
            githubToken: z.string().optional()
        })
    ).mutation(async ({ ctx, input }) => {
        const project = await ctx.db.project.create({
            data: {
                githubUrl: input.githubUrl,
                name: input.name,
                userToProjects: {
                    create: {
                        userId: ctx.user.userId!,


                    }
                }
            }
        })
        await indexGithubRepo(project.id, input.githubUrl, input.githubToken)
        await pollCommits(project.id)
        return project
    }),
    getProjects: proctedProcedure.query(async ({ ctx }) => {
        return await ctx.db.project.findMany({
            where: {
                userToProjects: {
                    some: {
                        userId: ctx.user.userId!
                    }
                },
                deletedAt: null
            }
        })
    }),
    getCommits: proctedProcedure.input(
        z.object({
            projectId: z.string()
        })
    ).query(async ({ ctx, input }) => {
        try {
            await pollCommits(input.projectId);
            const commits = await ctx.db.commit.findMany({ where: { projectId: input.projectId } });
            return commits ?? [];  // Ensure it always returns an array
        } catch (err) {
            console.error(err);
            return [];  // Return an empty array in case of an error
        }
    }),
    savAnswer: proctedProcedure.input(z.object({
        projectId: z.string(),
        question: z.string(),
        filesReferences: z.any(),
        answer: z.string(),

    })).mutation(async ({ ctx, input }) => {
        return await ctx.db.question.create({
            data: {
                answer: input.answer,
                filesReferences: input.filesReferences,
                projectId: input.projectId,
                question: input.question,
                userId: ctx.user.userId!,
            }
        })
    }),
    getQuestions: proctedProcedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
        return await ctx.db.question.findMany({
            where: {
                projectId: input.projectId,

            },
            include: {
                user: true,
            },
            orderBy: {
                created_at: 'desc'
            }
        })
    }),
    uploadMeeting: proctedProcedure.input(z.object({ projectId: z.string(), meetingUrl: z.string(), name: z.string() })).mutation(async ({ ctx, input }) => {
        const meeting = await ctx.db.meeting.create({
            data: {
                meetingUrl: input.meetingUrl,
                projectId: input.projectId,
                name: input.name,
                status: "PROCESSING"
            }
        })
        return meeting;
    }),
    getMeetings: proctedProcedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
        return await ctx.db.meeting.findMany({ where: { projectId: input.projectId }, include: { issues: true } })
    }),
    deleteMeeting: proctedProcedure.input(z.object({ meetingId: z.string() })).mutation(async ({ ctx, input }) => {
        return await ctx.db.meeting.deleteMany({ where: { id: input.meetingId } })
    }),
    getMeetingById: proctedProcedure.input(z.object({ meetingId: z.string() })).query(async ({ ctx, input }) => {
        return await ctx.db.meeting.findUnique({ where: { id: input.meetingId }, include: { issues: true } })
    }),
    archiveProject: proctedProcedure.input(z.object({ projectId: z.string() })).mutation(async ({ ctx, input }) => {
        return await ctx.db.project.update({ where: { id: input.projectId }, data: { deletedAt: new Date() } })
    }),
    getTeammembers: proctedProcedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
        return await ctx.db.userToProject.findMany({ where: { projectId: input.projectId }, include: { user: true } })
    })
})