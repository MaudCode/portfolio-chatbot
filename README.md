# Portfolio Chatbot

An AI-powered chatbot for my portfolio website. Visitors can ask questions about my work, background, and services — and get conversational responses.

## Tech Stack

- **AI Model**: Llama 3.3 70B (via Groq API)
- **Backend**: Cloudflare Workers
- **Frontend**: Framer (React code component)

## How It Works
```
┌─────────────────┐     ┌─────────────────┐     ┌───────────────┐
│  Framer site    │────▶│  Cloudflare     │────▶│  Groq API     │
│  (chat UI)      │◀────│  Worker         │◀────│  (Llama 3.3)  │
└─────────────────┘     └─────────────────┘     └───────────────┘
```

1. Visitor types a message in the chat interface
2. Message is sent to the Cloudflare Worker
3. Worker forwards it to Groq API with a system prompt containing portfolio info
4. AI response is returned and displayed in the chat

## Project Structure
```
portfolio-chatbot/
├── README.md
├── cloudflare-worker/
│   └── worker.js          # Backend API handling requests
└── framer-component/
    └── ChatBot.tsx        # Frontend chat interface
```

## Setup

### Cloudflare Worker
1. Create a Cloudflare account and set up a new Worker
2. Paste the code from `worker.js`
3. Add your Groq API key as an environment variable: `GROQ_API_KEY`
4. Customize the system prompt with your own info
5. Deploy

### Framer Component
1. Create a new code component in Framer
2. Paste the code from `ChatBot.tsx`
3. Update the fetch URL to point to your Cloudflare Worker
4. Style to match your site

## Get Your Own API Key

Sign up for a free Groq account at [console.groq.com](https://console.groq.com) — no credit card required.

## Author

[Maud Crooymans](https://linkedin.com/in/maud-crooymans)
