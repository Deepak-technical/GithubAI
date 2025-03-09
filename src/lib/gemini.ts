const { GoogleGenerativeAI } = require("@google/generative-ai");
import axios from 'axios'
import { Document } from '@langchain/core/documents';
const genAI = new GoogleGenerativeAI(
    process.env.GOOGLE_API_KEY
)
const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash'
})

export async function summariseCommit(githubUrl: string, commitHash: string) {
    const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
        headers: {
            Accept: 'application/vnd.github.v3.diff'
        }
    });
    return await aisummarisesCommit(data) || " Unable to summarise commit"


}

export const aisummarisesCommit = async (diff: string) => {
    const response = await model.generateContent([
        `You are an expert in Programmer 
        For every file, there are a few metadata lines, like (for example):

diff --git a/lib/index.js b/lib/index.js
index aodf691...bfef603 180644
a/lib/index.js
+++ b/lib/index.js

This means that 'lib/index.js' was modified in this commit. Note that this is only an example.

Then there is a specifier of the lines that were modified:

A line starting with + means it was added.
A line starting with - means that line was deleted.
A line that starts with neither + nor - is code given for context and better understanding.
It is not part of the diff.
EXAMPLE SUMMARY COMMENTS:

Raised the amount of returned recordings from 10 to 100 [packages/server/recordings_api.ts], [packages/server/constants.ts]
Fixed a typo in the github action name [.github/workflows/gpt-commit-summarizer.yml]
Moved the octokit initialization to a separate file [src/octokit.ts], [src/index.ts]
Added an OpenAI API for completions [packages/utils/apis/openai.ts]
Lowered numeric tolerance for test files
Most commits will have fewer comments than this examples list.
The last comment does not include the file names because there were more than two relevant files in the hypothetical commit.

Do not include parts of the example in your summary in depth.
It is given only as an example of appropriate comments.

And if the file has full of addition means intial commit then sumamrize the what is whole project out of it

Please summarise the following diff file: ${diff}`
    ]);

    return response.response.text();

}

export async function summariseCode(doc: Document) {

    try {
        console.log("getting summary for ...", doc.metadata.source);
        const code = doc.pageContent.slice(0, 10000);
        const response = await model.generateContent([
            `You are an intelligent senior software engineer who specialize in onboarding junior software engineers ontoo the projects
        You are onboarding a junior software engineer and explaining to them purpose of the  ${doc.metadata.source}
        Here is the code:
        -----
        ${code}
        -----
        
        Give a summary no more than 200 words of the code above`

        ])
        return response.response.text();
    } catch (e) {
        return ""
    }
}

export async function generateEmbedding(summary: string) {
    const model = genAI.getGenerativeModel({
        model: "text-embedding-004"

    })
    const result = await model.embedContent(summary);
    const embedding = await result.embedding;
    return embedding.values
}

// console.log(await aisummarisesCommit(
//     `diff --git a/index.html b/index.html
// index 3c4b1c5..d2e8f7b 100644
// --- a/index.html
// +++ b/index.html
// @@ -1,6 +1,6 @@
//  <!DOCTYPE html>
//  <html>
// -<head>
// -    <title>Old Title</title>
// +</head>
// +    <title>New Title</title>
//  </head>
//  <body>
//      <h1>Hello, World!</h1>


// diff --git a/style.css b/style.css
// index 5f6d7a8..9b0c1d2 100644
// --- a/style.css
// +++ b/style.css
// @@ -3,7 +3,7 @@ body {
//      font-family: Arial, sans-serif;
//      background-color: #ffffff;
// -    color: #333333;
// +    color: #000000;
//      margin: 0;
//      padding: 0;
//  }


// diff --git a/app.js b/app.js
// index a1b2c3d..e4f5g6h 100644
// --- a/app.js
// +++ b/app.js
// @@ -10,6 +10,7 @@ function greet() {
//      const message = "Hello, World!";
//      console.log(message);
//  }

// +greet();

//  module.exports = greet;

//   `
// ))

// console.log(await generateEmbedding('hello world'))