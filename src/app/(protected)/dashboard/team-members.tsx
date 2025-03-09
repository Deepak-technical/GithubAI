'use client'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import React from 'react'

const TeamMembers = () => {
    const {projectId}=useProject()
    const {data:members}=api.project.getTeammembers.useQuery({projectId})
  return (
    <>
    <div className='flex items-center gap-1'>
        {members?.map((member)=>(
            <img key={member.id} src={member.user.imageUrl || ' '} alt={member.user.firstName || ''} height={30} width={30} className='w-8 h-8 rounded-full'></img>
        ))}
    </div>
    </>
  )
}

export default TeamMembers