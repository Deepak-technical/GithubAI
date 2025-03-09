import {AssemblyAI} from "assemblyai";

const client=new AssemblyAI({apiKey:process.env.ASSEMBLYAI_API_KEY!})

function msToTime(ms:number){
    const seconds = ms / 1000;
    const minutes=Math.floor(seconds/60)
    const remainingSeconds=Math.floor(seconds%60)
    return `${minutes.toString().padStart(2,'0')}:${remainingSeconds.toString().padStart(2,'0')}}`
}
export const processMeeting=async(meetingUrl:string)=>{
    const transcript=await client.transcripts.transcribe({
        audio:meetingUrl,
        auto_chapters:true,

    })
    const summaries=transcript.chapters?.map(chapter=>({
        start:msToTime(chapter.start),
        end:msToTime(chapter.end),
        gist:chapter.gist,
        headline:chapter.headline,
        summary:chapter.summary
    })) || []

    return {transcript, summaries}

}
// const fikeUrl='https://assembly.ai/sports_injuries.mp3';
// const response=await processMeeting(fikeUrl)
// console.log(response)