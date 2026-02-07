# WhatsApp AI Chatbot with Sarvam AI

A WhatsApp-themed AI chatbot interface powered by Sarvam AI, India's leading multilingual AI platform. This prototype demonstrates how familiar chat interfaces can make AI more accessible, with native support for Indian languages.

## Features

- **WhatsApp-style UI**: Authentic WhatsApp interface with familiar design patterns
- **Sarvam AI Integration**: Powered by Sarvam-M model with native Indian language support
- **Multiple AI Capabilities**:
  - **Chat**: Conversational AI with context-aware responses
  - **Translation**: Translate between 11 Indian languages and English
  - **Text-to-Speech**: Convert text to natural-sounding speech
  - **Speech-to-Text**: Transcribe audio in multiple Indian languages
- **LangChain Integration**: Advanced conversation management with proper message history
- **Real-time conversations**: Maintain context across multiple messages
- **Typing indicators**: Visual feedback when AI is processing responses
- **Mobile-first design**: Optimized for mobile viewing with responsive layout
- **Rate Limiting**: Built-in rate limiting for API protection

## Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Sarvam AI SDK** - Official JavaScript SDK for Sarvam AI
- **LangChain** - AI orchestration framework (for Gemini fallback)
- **Upstash Redis** - Rate limiting and analytics

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm installed
- Sarvam AI API key ([Get one here](https://dashboard.sarvam.ai/))
- Upstash Redis account ([Get one here](https://console.upstash.com/))
- Optional: Google Gemini API key for fallback ([Get one here](https://makersuite.google.com/app/apikey))

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

4. Edit `.env.local` and add your API keys:
```
# Primary AI Provider (default: sarvam)
AI_PROVIDER=sarvam
SARVAM_AI_API_KEY=your_sarvam_api_key_here

# Redis for rate limiting
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token

# Optional: Gemini fallback
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here
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
│   ├── chat/
│   │   └── route.ts          # Chat API endpoint (Sarvam AI)
│   ├── translate/
│   │   └── route.ts          # Translation API endpoint
│   ├── tts/
│   │   └── route.ts          # Text-to-Speech API endpoint
│   └── stt/
│       └── route.ts          # Speech-to-Text API endpoint
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

## API Endpoints

### 1. Chat API (`/api/chat`)
Conversational AI powered by Sarvam-M model.

**Rate Limit**: 10 requests per day per IP

**Request**:
```typescript
POST /api/chat
{
  "message": "Hello, how are you?",
  "history": [
    { "id": 1, "message": "Hi", "timestamp": "10:00 AM", "sent": true }
  ]
}
```

**Response**:
```typescript
{
  "message": "I'm doing well, thank you!",
  "timestamp": "10:01 AM",
  "remaining": 9
}
```

### 2. Translation API (`/api/translate`)
Translate text between Indian languages and English.

**Rate Limit**: 20 requests per day per IP

**Supported Languages**: `hi-IN`, `bn-IN`, `ta-IN`, `te-IN`, `gu-IN`, `kn-IN`, `ml-IN`, `mr-IN`, `pa-IN`, `od-IN`, `en-IN`

**Request**:
```typescript
POST /api/translate
{
  "input": "Hello, how are you?",
  "source_language_code": "auto",  // or specific language code
  "target_language_code": "hi-IN",
  "speaker_gender": "Male"  // or "Female"
}
```

**Response**:
```typescript
{
  "translated_text": "नमस्ते, आप कैसे हैं?",
  "source_language_code": "en-IN",
  "target_language_code": "hi-IN",
  "remaining": 19
}
```

### 3. Text-to-Speech API (`/api/tts`)
Convert text to natural-sounding speech in Indian languages.

**Rate Limit**: 15 requests per day per IP

**Request**:
```typescript
POST /api/tts
{
  "input": "नमस्ते, आप कैसे हैं?",
  "target_language_code": "hi-IN",
  "speaker": "meera",  // Voice ID
  "model": "bulbul:v1"
}
```

**Response**:
```typescript
{
  "audio_base64": "base64_encoded_audio_data",
  "sample_rate": 22050,
  "duration": 2.5,
  "remaining": 14
}
```

### 4. Speech-to-Text API (`/api/stt`)
Transcribe audio to text in Indian languages.

**Rate Limit**: 15 requests per day per IP

**Request** (multipart/form-data):
```
POST /api/stt
Content-Type: multipart/form-data

file: <audio_file>
language_code: "hi-IN"
model: "saarika:v2.5"
```

**Response**:
```typescript
{
  "transcript": "नमस्ते, आप कैसे हैं?",
  "language_code": "hi-IN",
  "duration": 2.5,
  "remaining": 14
}
```

## How It Works

### Chat Flow
1. User types a message in the WhatsApp-style input
2. Message is sent to the `/api/chat` endpoint with conversation history
3. Sarvam AI SDK processes the message:
   - Formats the message with system prompt and chat history
   - Sends to Sarvam-M model with proper context
   - Returns contextual AI response
4. AI response is displayed in a WhatsApp-style message bubble
5. Conversation history is maintained for contextual responses

### Translation Flow
1. Send text to `/api/translate` with source and target language codes
2. Sarvam AI uses Mayura model to translate between languages
3. Supports auto-detection of source language
4. Returns translated text with detected source language

### Text-to-Speech Flow
1. Send text to `/api/tts` with target language and voice preferences
2. Sarvam AI uses Bulbul model to generate natural-sounding speech
3. Returns base64-encoded audio that can be played in the browser
4. Supports multiple Indian languages and voice options

### Speech-to-Text Flow
1. Upload audio file to `/api/stt` with language code
2. Sarvam AI uses Saarika model to transcribe the audio
3. Returns transcript with duration information
4. Supports multiple audio formats and Indian languages

## Customization

### Switch AI Provider

To use Gemini instead of Sarvam, set in `.env.local`:
```
AI_PROVIDER=gemini
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here
```

### Customize System Prompt

Edit the system message in `app/api/chat/route.ts`:
```typescript
const messages = [
  {
    role: "system",
    content: "Your custom system prompt here - define personality, tone, and behavior",
  },
  // ... rest of messages
];
```

### Adjust Message History

Edit the history slice in `app/api/chat/route.ts`:
```typescript
...history.slice(-10) // Change -10 to keep more/fewer messages
```

### Modify Rate Limits

Edit the rate limiter configuration in each API route:
```typescript
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(20, "1 d"), // 20 requests per day
  analytics: true,
  prefix: "whatsappgpt:endpoint:ratelimit",
});
```

### Modify UI Theme

Edit CSS variables in `app/globals.css` to customize colors.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `SARVAM_AI_API_KEY`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `AI_PROVIDER` (optional, defaults to "sarvam")
   - `GOOGLE_GENERATIVE_AI_API_KEY` (optional, for Gemini fallback)
4. Deploy

### Other Platforms

Ensure you set all required environment variables in your hosting platform's settings.

## Supported Languages

Sarvam AI supports the following languages:

- Hindi (hi-IN)
- Bengali (bn-IN)
- Tamil (ta-IN)
- Telugu (te-IN)
- Gujarati (gu-IN)
- Kannada (kn-IN)
- Malayalam (ml-IN)
- Marathi (mr-IN)
- Punjabi (pa-IN)
- Odia (od-IN)
- English (en-IN)

For translation only, additional languages are supported via the Sarvam Translate model (22 Indian languages total).

## Rate Limits

Default rate limits per IP address:
- Chat: 10 requests/day
- Translation: 20 requests/day
- Text-to-Speech: 15 requests/day
- Speech-to-Text: 15 requests/day

All limits reset every 24 hours. Customize in each API route file.

## Documentation

- **[Sarvam AI Docs](https://docs.sarvam.ai/)** - Official Sarvam AI documentation
- **[Sarvam AI SDK](https://www.npmjs.com/package/sarvamai)** - JavaScript SDK reference

## License

MIT

## Acknowledgments

- WhatsApp UI design inspiration
- Sarvam AI for multilingual AI capabilities
- Google Gemini AI for conversational AI fallback
- LangChain for AI orchestration
- Upstash for serverless Redis
- Next.js team for the amazing framework
