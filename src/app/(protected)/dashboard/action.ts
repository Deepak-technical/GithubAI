'use server'

import {streamText} from 'ai'
import {createStreamableValue} from 'ai/rsc'
import {createGoogleGenerativeAI} from '@ai-sdk/google'
import { generateEmbedding } from '@/lib/gemini'
import { db } from '@/server/db'

const google=createGoogleGenerativeAI({
    apiKey:process.env.GOOGLE_API_KEY,
})

export async function askQuestion(question:string,projectId:string){
    const stream=createStreamableValue()
    const queryVector=await generateEmbedding(question);
    const vectorQuery=`[${queryVector.join(',')}]`

    const result=await db.$queryRaw`
    SELECT "fileName", "sourceCode","summary",
    1-("summaryEmbedding"<=> ${vectorQuery}::vector) AS similarity
    FROM "SourceCodeEmbedding"
    WHERE 1-("summaryEmbedding"<=> ${vectorQuery}::vector) >.5
    AND "projectId"=${projectId}
    ORDER BY similarity DESC
    LIMIT 10` as 
     {fileName:string;sourceCode:string;summary:string;}[]
   
   let context=''

   for(const doc of  result){
    context+=`source: ${doc.fileName}\ncode content:${doc.sourceCode}\n summary of file:${doc.summary}\n\n`
   }

   (async()=>{
       const{textStream}=await streamText({
        model:google('gemini-2.0-flash'),
        prompt:`{
        You are a code assistant who answers questions about the codebase. Your target audience is a technical intern.

AI Assistant Characteristics
AI assistant is a brand new, powerful, human-like artificial intelligence.
Traits of AI: Expert knowledge, helpfulness, cleverness, and articulateness.
Behavior: AI is well-behaved, well-mannered, friendly, kind, and inspiring.
Knowledge Scope: AI has the sum of all knowledge in its brain and can accurately answer nearly any question about any topic.

Context & Question Handling
If the question is about code or a specific file, AI will provide a detailed answer with step-by-step instructions.

START CONTEXT BLOCK
${context}
END OF CONTEXT BLOCK

START QUESTION
${question}
END OF QUESTION

The AI assistant will take into account any CONTEXT BLOCK provided in a conversation.

If the context does not provide the answer to a question, the AI assistant will say:

"I'm sorry, but I don't know the answer."

AI will not apologize for previous responses but will indicate when new information is gained.

Answering Style
No Invention: AI will not invent anything beyond what is drawn directly from the context.
Markdown Syntax: Answers will use markdown, with code snippets if needed.
Detail & Clarity: Answers will be as detailed as possible to eliminate ambiguity.
Answer Requirement: Answer in markdown style, with code snippets if needed. Be as detailed as possible when answering. Make sure there is no empty response.}`
       });
       for await(const delta of textStream){
        stream.update(delta);

       }

       stream.done();
   })()
   console.log(stream.value)

   return {
    output:stream.value,
    filesReferences:result
   }

}