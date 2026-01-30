# WhatsApp Gemini AI Chatbot

A WhatsApp-themed AI chatbot interface powered by Google's Gemini AI. This prototype demonstrates how familiar chat interfaces can make AI more accessible, especially to older demographics who are already comfortable with WhatsApp.

## Features

- **WhatsApp-style UI**: Authentic WhatsApp interface with familiar design patterns
- **Text-only chat**: Simplified interface focused on text conversations
- **Google Gemini AI**: Powered by Gemini 1.5 Flash for fast, intelligent responses
- **LangChain Integration**: Advanced conversation management with proper message history
- **Real-time conversations**: Maintain context across multiple messages with intelligent memory
- **Typing indicators**: Visual feedback when AI is processing responses
- **Mobile-first design**: Optimized for mobile viewing with responsive layout

## Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **LangChain** - AI orchestration framework
- **@langchain/google-genai** - Google Gemini integration for LangChain

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm installed
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd whatsappgpt
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Edit `.env.local` and add your Gemini API key:
```
GOOGLE_GENERATIVE_AI_API_KEY=your_actual_api_key_here
```

5. Run the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
app/
├── api/
│   └── chat/
│       └── route.ts          # Gemini API endpoint
├── components/
│   ├── ChatHeader.tsx        # Header with AI assistant info
│   ├── ChatInput.tsx         # Message input field
│   ├── MessageBubble.tsx     # Individual message component
│   ├── MessageList.tsx       # Messages container
│   └── TypingIndicator.tsx   # Loading animation
├── page.tsx                  # Main chat page with state management
├── layout.tsx                # Root layout
└── globals.css               # WhatsApp theme styles
```

## How It Works

1. User types a message in the WhatsApp-style input
2. Message is sent to the `/api/chat` endpoint with conversation history
3. LangChain processes the message through a conversation chain:
   - Formats the message with system prompt and chat history
   - Sends to Gemini AI with proper context
   - Manages conversation memory automatically
4. AI response is displayed in a WhatsApp-style message bubble
5. Conversation history is maintained for contextual responses

### Why LangChain?

- **Better Memory Management**: Automatic handling of conversation context
- **Prompt Engineering**: Easy to customize system prompts and templates
- **Extensibility**: Simple to add tools, agents, or additional features
- **Production-Ready**: Built-in error handling and retry logic
- **Future-Proof**: Easy to switch models or add multi-model support

## Customization

### Change AI Model

Edit `app/api/chat/route.ts`:
```typescript
const model = new ChatGoogleGenerativeAI({
  modelName: "gemini-1.5-pro", // Use more capable model
  apiKey: apiKey,
  temperature: 0.7,
  maxOutputTokens: 2048, // Adjust response length
});
```

### Customize System Prompt

Edit the system message in `app/api/chat/route.ts`:
```typescript
const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "Your custom system prompt here - define personality, tone, and behavior",
  ],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
]);
```

### Adjust Message History

Edit the history slice in `app/api/chat/route.ts`:
```typescript
const chatHistory = history.slice(-10); // Change -10 to keep more/fewer messages
```

### Modify UI Theme

Edit CSS variables in `app/globals.css` to customize colors.

### Add LangGraph for Complex Workflows

For more advanced use cases, you can extend this with LangGraph:

```bash
pnpm add langgraph
```

Then create stateful agents, multi-step reasoning, or tool-calling workflows.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add `GOOGLE_GENERATIVE_AI_API_KEY` to environment variables
4. Deploy

### Other Platforms

Ensure you set the `GOOGLE_GENERATIVE_AI_API_KEY` environment variable in your hosting platform's settings.

## Documentation

- **[MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)** - Summary of LangChain migration changes
- **[LANGCHAIN_GUIDE.md](./LANGCHAIN_GUIDE.md)** - Advanced LangChain features and examples
- **[LANGCHAIN_VS_DIRECT_API.md](./LANGCHAIN_VS_DIRECT_API.md)** - Comparison and migration guide

## License

MIT

## Acknowledgments

- WhatsApp UI design inspiration
- Google Gemini AI for conversational AI
- LangChain for AI orchestration
- Next.js team for the amazing framework
