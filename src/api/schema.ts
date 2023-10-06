import { makeExecutableSchema } from '@graphql-tools/schema'
import { animals, chatGpt } from './generate';
import { createPubSub } from 'graphql-yoga'

const pubSub = createPubSub()

const typeDefinitions = /* GraphQL */ `
  type Response {
    question: String!
    answer: String!
    done: Boolean
  }
  type Query {
    animals(question: String!): Response!
    chatGpt(question: String!): Response!
  }
  type Subscription {
    animals(question: String!): Response!
    chatGpt(question: String!): Response!
  }
`

const resolvers = {
  Query: {
    animals: async (_: any, { question }: { question: string }) => animals(question),
    chatGpt: async (_: any, { question }: { question: string }) => chatGpt(question)
  },
  Subscription: {
    animals: {
      // This will return the value on every 1 sec until it reaches 0
      subscribe: async function* (_: any, { question }: { question: string }) {
        await animals(question, pubSub)
        const sub = pubSub.subscribe('stream');
        let d: boolean | undefined = false;
        const { value } = await sub.next()
        d = value.done;
        let v = value;
        yield v;
        while (!d) {
          const { value } = await sub.next()
          v = { ...value, answer: v.answer + value.answer }

          yield v;
          d = v.done;
          if (d) {
            console.log('FINAL VALUE:', v)
            break;
          }
        }
      },
      resolve: (payload: any) => payload
    },
    chatGpt: {
      // This will return the value on every 1 sec until it reaches 0
      subscribe: async function* (_: any, { question }: { question: string }) {
        await chatGpt(question, pubSub)
        const sub = pubSub.subscribe('stream');
        let d: boolean | undefined = false;
        const { value } = await sub.next()
        d = value.done;
        let v = value;
        yield v;
        while (!d) {
          const { value } = await sub.next()
          v = { ...value, answer: v.answer + value.answer }

          yield v;
          d = v.done;
          if (d) {
            console.log('FINAL VALUE:', v)
            break;
          }
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
