'use client'

import { Button } from "@/components/ui/button"
import useProject from "@/hooks/use-project"
import { api } from "@/trpc/react"
import { on } from "node:events"

import React from 'react'
import { toast } from "sonner"
import useRefetch from "@/hooks/use-refetch"

const ArchiveButton = () => {
    const {projectId}=useProject();
    const refetch=useRefetch()
    const archiveProject=api.project.archiveProject.useMutation();
    return (
        <Button disabled={archiveProject.isPending} size='sm' variant="destructive" onClick={()=>{
            const confirm=window.confirm('Are you sure you want to archive this project');
            if(confirm) archiveProject.mutate({projectId},{
                onSuccess:()=>{
                    toast.success("Project archived successfully")
                    refetch()

                },
                onError:()=>{
                    toast.error("Failed to archive project")
                }
            })
        }}>Archive

        </Button>
    )

}

export default ArchiveButton