'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import MDEditor from '@uiw/react-md-editor'
// import { DialogHeader } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import useProject from '@/hooks/use-project'
// import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Github } from 'lucide-react'
import React from 'react'
import { askQuestion } from './action'
import CodeReferences from './code-references'
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import { readStreamableValue } from 'ai/rsc'

const AskQuestionCard = () => {
    const { project } = useProject();
    const [question, setQuestion] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [loading,setLoading]=React.useState(false);
    const [filesReferences,setFilesReferences]=React.useState<{fileName:string;sourceCode:string;summary:string}[]>([])
    const [answer,setAnswer]=React.useState('')
    const saveAnswer=api.project.savAnswer.useMutation();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setAnswer('');
        setFilesReferences([])
        e.preventDefault();
        if(!project?.id) return;
        
        // window.alert(question)
        setLoading(true);
        
        const {output,filesReferences}=await askQuestion(question,project.id);
        setOpen(true);
        setFilesReferences(filesReferences);
        for await(const delta of readStreamableValue(output)){
            if(delta){
                setAnswer(ans=>ans+delta)
            }
        }
        setLoading(false)


        

    }
    return (
        <>
            <Dialog open={open} onOpenChange={setOpen} >
                <DialogContent className='sm:max-w-[80vw] overflow-scroll'>
                    <DialogHeader>
                        <DialogTitle className='flex justify-around items-center'>
                            <Github size={30} />{question}
                            {/* <pre>{answer}</pre> */}
                            <Button disabled={saveAnswer.isPending} size='lg' variant={'secondary'} className='bg-green-400' onClick={()=>{
                            saveAnswer.mutate({
                                projectId:project!.id,
                                question,
                                answer,
                                filesReferences
                            },{
                                onSuccess:()=>{
                                    toast.success('Answer saved successfully')
                                },
                                onError:()=>{
                                    toast.error('Error in saving answers')
                                }
                            })
                        }}> Save Answer</Button>
                        <Button type='button' onClick={()=>{setOpen(false)}} >
                     Close
                    </Button>
                        </DialogTitle>
                      

                    </DialogHeader>
                    
                    
                    <MDEditor.Markdown source={answer} className='max-w-[80vw] !h-full max-h-[30vh] overflow-scroll bg-white text-gray-100'/>
                    <CodeReferences filesReferences={filesReferences}/>
                    

{/* 
                    {filesReferences.map(file=>{
                        return <span>{file.fileName}</span>
                    })} */}
                    
                </DialogContent>
            </Dialog>
            <Card className='relative col-span-3'>

                <CardHeader>
                    <CardTitle>Ask any Question</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit}>
                        <Textarea placeholder='While file should I edit to change the hompage'
                            onChange={(e) => setQuestion(e.target.value)} />
                        <div className="h-4"></div>
                        <Button type='submit'disabled={loading}>
                            Ask GithubAI
                        </Button>
                    </form>
                </CardContent>

            </Card>
        </>
        // <div>AskQuestionCard</div>
    )
}

export default AskQuestionCard