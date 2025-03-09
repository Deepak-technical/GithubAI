import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react';
import React from 'react'
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import ReactMarkdown from "react-markdown";


import { Skeleton } from "@/components/ui/skeleton"; 
import { redirect } from 'next/navigation';
const CommitLog = () => {
    const { projectId, project } = useProject();
    const { data: commits } = api.project.getCommits.useQuery({ projectId })
    return <>
   {!project ? (
            <div className="flex flex-col items-center justify-center space-y-4 p-6">
                <p className="text-gray-600 text-lg">No project found. Create a new project to get started.</p>
                <p onClick={()=>{redirect('create')}}>Create Project</p>
            </div>
        ) : !commits ? (
            <ul className="space-y-6">
                {[...Array(3)].map((_, commitIdx) => (
                    <li key={commitIdx} className="relative flex gap-x-4">
                        <div className={`absolute left-0 top-0 flex w-6 justify-center ${commitIdx !== 2 ? "-bottom-6" : "h-6"}`}>
                            <div className="w-px translate-x-1 bg-gray-200"></div>
                        </div>
                        <>
                            <Skeleton className="relative mt-4 size-8 flex-none rounded-full bg-gray-200" />
                            <div className="flex-auto rounded-md bg-white p-3 ring-1 ring-inset ring-gray-200">
                                <div className="flex justify-between gap-x-4">
                                    <Skeleton className="h-4 w-1/3" />
                                </div>
                                <div className="mt-2 space-y-2">
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-3 w-full" />
                                </div>
                            </div>
                        </>
                    </li>
                ))}
            </ul>
        ) : (
            <ul className="space-y-6">
                {commits.map((commit, commitIdx) => (
                    <li key={commit.id} className="relative flex gap-x-4">
                        <div className={`absolute left-0 top-0 flex w-6 justify-center ${commitIdx !== commits.length - 1 ? "-bottom-6" : "h-6"}`}>
                            <div className="w-px translate-x-1 bg-gray-200"></div>
                        </div>
                        <>
                            <img src={commit?.commitAuthorAvatar} alt="commit avatar" className="relative mt-4 size-8 flex-none rounded-full bg-gray-50" />
                            <div className="flex-auto rounded-md bg-white p-3 ring-1 ring-inset ring-gray-200">
                                <div className="flex justify-between gap-x-4">
                                    <Link target="_blank" href={`${project?.githubUrl}/commit/${commit.commitHash}`} className="py-0.5 text-xs leading-5 text-gray-500">
                                        <span className="font-medium text-gray-900">{commit.commitAuthorName} {" "}</span>
                                        <span className="inline-flex items-center">
                                            {" "}committed
                                            <ExternalLink className="ml-1 size-4" />
                                        </span>
                                    </Link>
                                </div>
                                <div className="font-semibold">
                                    <ReactMarkdown>{commit.commitMessage}</ReactMarkdown>
                                </div>
                                <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-500">
                                    <ReactMarkdown>{commit.summary}</ReactMarkdown>
                                </pre>
                            </div>
                        </>
                    </li>
                ))}
            </ul>
        )}</>
}

export default CommitLog