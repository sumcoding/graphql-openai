# graphql-openai

This is an example implementation of openai with a graphql yoga server.

Server runs on http://localhost:4000/graphql
It requires environment variable `OPENAI_API_KEY` set with your OpenAI token

## Install
`npm install -g pnpm` if you do not have pnpm (other install options: https://pnpm.io/installation)

`pnpm install`

## Yoga Server

Set up your OpenAI token as `OPENAI_API_KEY` first in a .env file

Run:
`pnpm dev`

Yoga comes with a graphiQL interface, so open http://localhost:4000/graphql and use the examples below to start.

## Graphql Requests

```graphql
# Examples with gpt
query getGpt {
  chatGpt(question: "What is the most performant framework?") {
    question
    answer
  }
}

subscription steamGpt {
  chatGpt(question: "What is the most performant framework?") {
    question
    answer
    done
  }
}

# Examples with davinci
query animal {
  animals(question: "dog") {
    question
    answer
  }
}

subscription animalStream {
  animals(question: "tiger") {
    question
    answer
    done
  }
}
```
