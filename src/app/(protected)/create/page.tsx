"use client";
import { Input } from '@/components/ui/input'
import React from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import useRefetch from '@/hooks/use-refetch';



type FormInput={
    repoUrl:string,
    projectName:string,
    githubToken?:string

}
const CreatePage = () => {

    const {register,handleSubmit,reset}=useForm<FormInput>();
    const createProject=api.project.createProject.useMutation();
    const refetch = useRefetch();;

    function onSubmit(data:FormInput){
        createProject.mutate({
            githubUrl:data.repoUrl,
            name:data.projectName,
            githubToken:data.githubToken
    },{
        onSuccess: ()=>{
            toast.success('Project created sucessfully');
            refetch();
            reset();
        },
        onError: ()=>{
            toast.error('Project creation failed')
        }
    })
        return;
    }

  return (

    <div className='flex items-center gap-8 h-full justify-center'>
        <img src="./scubacat_dribbbble.png"  className='h-96 w-auto'/>
        <div>
            <div>
            <h1 className='font-semibold text-2xl'>
                Link your Github Repository
            </h1>
            <p className='text-sm text-muted-foreground'>
                Enter the URL of your Repository to link it GitAI
            </p>
            </div>
        
        <div className="h-4"></div>
            <div>
                <form onSubmit={handleSubmit(onSubmit)}>
                 <Input  {...register('projectName',{required:true})} placeholder="ProjectName" required/>
                    <div className="h-2"></div>
                    <Input  {...register('repoUrl',{required:true})} placeholder="Github Url" required/>
                    <div className="h-2"></div>
                    <Input  {...register('githubToken',{required:false})} placeholder="Github Token (Optional)"/>
                    <div className="h-4"></div>
                    <Button type='submit' disabled={createProject.isPending}> Create Project</Button>
                </form>
            </div>
        </div>
        </div>
    
    
  )
}

export default CreatePage