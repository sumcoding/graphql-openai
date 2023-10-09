import OpenAI from 'openai'
import 'dotenv/config'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})
const davinci = "text-davinci-003"
const gpt = "gpt-3.5-turbo"
const temperature = 1
const system_prompt = "You are an experienced frontend developer with extensive knowledge in popular frameworks like vue, react and solidJS"

function prep_question(question: string) {
  if (!openai.apiKey) {
    throw new Error(`OpenAI API key not configured ${process.env.OPENAI_API_KEY}`)
  }

  if (!question || question.trim().length === 0) {
    throw new Error('Pleas enter valid question')
  }
}

function generateAnimalPrompt(question: string) {
  prep_question(question)

  const capitalizedAnimal =
  question[0].toUpperCase() + question.slice(1).toLowerCase()
  return `Suggest three names for an animal that is a superhero.

Animal: Cat
Names: Captain Sharpclaw, Agent Fluffball, The Incredible Feline
Animal: Dog
Names: Ruff the Protector, Wonder Canine, Sir Barks-a-Lot
Animal: ${capitalizedAnimal}
Names:`
}


export const completion = async (question: string, config: OpenAI.Completions.CompletionCreateParamsNonStreaming = {
  model: davinci,
  prompt: generateAnimalPrompt(question),
  temperature,
}) => {
  const completion = await openai.completions.create(config)
  return { 'question': question, answer: completion.choices[0]?.text }

}

export const chat_completion = async (
  question: string, 
  messages: Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> = [
    { role: "system", content: system_prompt },
    { role: "user", content: question }
  ],
  config: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
    model: gpt,
    temperature,
    messages
  }
) => {
  const completion = await openai.chat.completions.create(config)
  return { 'question': question, answer: completion.choices[0]?.message.content }
}

export const stream_completion = async (
  question: string,
  config: OpenAI.Completions.CompletionCreateParamsStreaming = {
    model: davinci,
    temperature,
    stream: true,
    prompt: generateAnimalPrompt(question),
  },
) => {
  return openai.completions.create({
    ...config,
    stream: true
  })
}

export const stream_chat_completion = async (
  question: string,
  messages: Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> = [
    { role: "system", content: system_prompt },
    { role: "user", content: question }
  ],
  config: OpenAI.Chat.Completions.ChatCompletionCreateParams = {
    model: gpt,
    temperature,
    messages
  },
) => {
  prep_question(question)
  return openai.chat.completions.create({
    ...config,
    stream: true
  })
}
