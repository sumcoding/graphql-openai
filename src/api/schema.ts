import { makeExecutableSchema } from '@graphql-tools/schema'
import { chat_completion, completion, stream_chat_completion, stream_completion } from './generate'

const typeDefinitions = /* GraphQL */ `
  type Response {
    question: String!
    answer: String!
  }
  type Query {
    animals(question: String!): Response!
    chat(question: String!): Response!
  }
  type Subscription {
    animals(question: String!): Response!
    chat(question: String!): Response!
  }
`

const resolvers = {
  Query: {
    animals: async (_: any, { question }: { question: string }) => completion(question),
    chat: async (_: any, { question }: { question: string }) => chat_completion(question)
  },
  Subscription: {
    animals: {
      subscribe: async function* (_: any, { question }: { question: string }) {
        const stream = await stream_completion(question)
        let answer = ''
        for await (const part of stream) {
          answer += part.choices[0].text
          yield { answer, question }
        }
      },
      resolve: (payload: any) => payload
    },
    chat: {
      subscribe: async function* (_: any, { question }: { question: string }) {
        const stream = await stream_chat_completion(question)
        let answer = ''
        for await (const part of stream) {
          answer += part.choices[0].delta.content
          yield { answer, question }
        }
      },
      resolve: (payload: any) => payload
    }
  }
}

export const schema = makeExecutableSchema({
  resolvers: [resolvers],
  typeDefs: [typeDefinitions]
})
