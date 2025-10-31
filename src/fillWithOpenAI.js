const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function createBatchWithPrompt(prompt) {
  try {
    // Step 1: Create a JSONL file with your prompt
    // const jsonlContent = `{"prompt": "${prompt}"}`;
    const jsonlContent = `{"custom_id": "request-jp-1", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "gpt-3.5-turbo-0125", "messages": [{"role": "system", "content": "You are a helpful assistant."},{"role": "user", "content": "${prompt}"}],"max_tokens": 2000}}`;

    const filePath = path.join(__dirname, 'prompts.jsonl');
    fs.writeFileSync(filePath, jsonlContent);

    // Step 2: Upload the JSONL file to OpenAI
    const fileUploadResponse = await openai.files.create({
      purpose: 'batch',
      file: fs.createReadStream(filePath)
    });

    const inputFileId = fileUploadResponse.id;

    console.log('File uploaded successfully, file ID:', inputFileId);

    // Step 3: Create the batch using the uploaded file ID
    const batchResponse = await openai.batches.create({
      input_file_id: inputFileId,
      endpoint: '/v1/chat/completions',
      completion_window: '24h',
    });

    const batchId = batchResponse.id;

    console.log('Batch created successfully, batch ID:', batchId);

    // Step 4: Poll the batch status until it's completed
    await retrieveBatchStatus(batchId);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function retrieveBatchStatus(batchId) {
    try {
      // Retrieve the status of the batch
      const statusResponse = await openai.batches.retrieve( batchId );
  
      // Check the status of the batch
      if (statusResponse.status === 'completed') {
        console.log('Batch completed, retrieving output with id:', statusResponse.output_file_id);
        await getBatchOutput(statusResponse.output_file_id);
      } else if (statusResponse.status === 'failed') {
        console.error('Batch failed:',statusResponse.errors.object, statusResponse.errors.data);
      } else {
        console.log('Batch status:', statusResponse.status);
        // Optionally continue to poll or handle other statuses
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  async function getBatchOutput(outputFileId) {
    try {
      const outputResponse = await(await openai.files.content(outputFileId)).text();
      console.log('Batch output:', outputResponse);
    } catch (error) {
      console.error('Error fetching output:', error);
    }
  }


// const filePath = path.join(__dirname, 'kanaCharacters.json');
// const fileContent = JSON.stringify(require(filePath)).replace(/"/g, '\\"').replace(/\n/g, '');

// createBatchWithPrompt(`I have this file for my website for learning japanese. Give me some corrections if necesary, and expand it with more words in the same style. Best if the words are easy for beginners, and have themes like travel, daily life or anime. The translations should be short, and you dont need to rewrite what I already have there. Here the file:  ${fileContent}  Remember to give me some corrections if necesary, and expand it with more words in the same style. Best if the words are easy for beginners, and have themes like travel, daily life or anime. The translations should be short, and you dont need to rewrite what I already have there.`);

retrieveBatchStatus("batch_MyZFp53WPQhsfRRniH1GIq21");