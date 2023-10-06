import { IncomingMessage } from 'http';
import { ChatCompletionRequestMessage, Configuration, CreateChatCompletionRequest, OpenAIApi } from 'openai';
import 'dotenv/config'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const davinci = "text-davinci-003"
const gpt = "gpt-3.5-turbo"
const temperature = 1;
const system_prompt = "You are an experienced frontend developer with extensive knowledge in popular frameworks like vue, react and solidJS"

export const animals = async function (question: string, stream: any = false) {
  if (!configuration.apiKey) {
    throw new Error(`OpenAI API key not configured ${process.env.OPENAI_API_KEY}`)
  }

  const q = question ?? '';
  if (q.trim().length === 0) {
    throw new Error('Pleas enter valid question')
  }

  try {
    if (stream) {
      await streamCompletion(q, stream)
    } else {
      return simpleCompletion(q)
    }
  } catch (error) {
    throw error
  }
}

export const chatGpt = async function (question: string, stream: any = false) {
  if (!configuration.apiKey) {
    throw new Error(`OpenAI API key not configured ${process.env.OPENAI_API_KEY}`)
  }

  const q = question ?? '';
  if (q.trim().length === 0) {
    throw new Error('Pleas enter valid question')
  }

  const messages: Array<ChatCompletionRequestMessage> = [
    { role: "system", content: system_prompt },
    { role: "user", content: q }
  ]

  const config: CreateChatCompletionRequest = {
    model: gpt,
    temperature,
    messages
  }
  try {
    if (stream) {
      await streamChatCompletion(q, stream, { ...config, stream: true })
    } else {
      return simpleChatCompletion(q, config)
    }
  } catch (error) {
    throw error
  }
}

function generateAnimalPrompt(animal: string) {
  const capitalizedAnimal =
    animal[0].toUpperCase() + animal.slice(1).toLowerCase();
  return `Suggest three names for an animal that is a superhero.

Animal: Cat
Names: Captain Sharpclaw, Agent Fluffball, The Incredible Feline
Animal: Dog
Names: Ruff the Protector, Wonder Canine, Sir Barks-a-Lot
Animal: ${capitalizedAnimal}
Names:`;
}


const simpleCompletion = async (question: string, config: any = {
  model: davinci,
  prompt: generateAnimalPrompt(question),
  temperature,
}) => {
  const completion = await openai.createCompletion(config);
  const result = completion.data.choices[0];
  return { 'question': question, answer: result?.text }

}

const simpleChatCompletion = async (question: string, config: CreateChatCompletionRequest) => {
  const completion = await openai.createChatCompletion(config);
  const result = completion.data.choices[0];
  return { 'question': question, answer: result?.message?.content ?? '' }

}


const streamCompletion = async (
  question: string,
  pubSub: any,
  config: any = {
    model: davinci,
    temperature,
    stream: true,
    prompt: generateAnimalPrompt(question),
  },
) => {
  const completion = await openai.createCompletion({
    ...config,
  }, {
    responseType: 'stream'
  });
  const stream = completion.data as unknown as IncomingMessage;
  stream.on('data', (chunk: Buffer) => {
    let result: any = null;
    const payloads = chunk.toString().split("\n\n");

    for (const payload of payloads) {
      if (payload.includes('[DONE]')) return;
      if (payload.startsWith("data:")) {
        const data = JSON.parse(payload.replace("data: ", ""));
        result = data.choices[0]
        pubSub.publish('stream', { question, answer: result.text, done: result.finish_reason !== null })
      }
    }
  });

  stream.on('end', () => {
    setTimeout(() => {
      console.log('\nStream done');
    }, 10);
  });

  stream.on('error', (err: Error) => {
    console.log(err);
    throw err;
  });
}

const streamChatCompletion = async (
  question: string,
  pubSub: any,
  config: CreateChatCompletionRequest,
) => {
  const completion = await openai.createChatCompletion({
    ...config,
  }, {
    responseType: 'stream'
  });
  const stream = completion.data as unknown as IncomingMessage;
  stream.on('data', (chunk: Buffer) => {
    let result: any = null;
    const payloads = chunk.toString().split("\n\n");
    for (const payload of payloads) {
      if (payload.includes('[DONE]')) return;
      if (payload.startsWith("data:")) {
        const data = JSON.parse(payload.replace("data: ", ""));
        result = data.choices[0]
        pubSub.publish('stream', { question, answer: result.delta?.content ?? '', done: result.finish_reason !== null })
      }
    }
  });

  stream.on('end', () => {
    setTimeout(() => {
      console.log('\nStream done');
    }, 10);
  });

  stream.on('error', (err: Error) => {
    console.log(err);
    throw err;
  });
}


