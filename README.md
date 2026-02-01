# PolicyLens 🔍

> AI-powered insurance policy analysis platform that makes complex insurance documents simple and transparent

PolicyLens is a FinTech/InsurTech application that leverages artificial intelligence to analyze insurance policies, identify exclusions, assess risks, and provide intelligent chat assistance. Built with privacy-first principles, it helps users understand their insurance coverage without compromising their data.

## ✨ Features

- **🤖 AI-Powered Analysis**: Comprehensive policy analysis using Google Gemini AI
- **📄 PDF Upload**: Upload insurance documents directly for instant analysis
- **⚠️ Smart Exclusions Detection**: Automatically identifies and categorizes policy exclusions by risk level
- **💬 Intelligent Chat Assistant**: Ask questions about your policy and get instant AI-powered answers
- **📊 Risk Assessment**: Visual risk gauge and detailed risk metrics
- **📜 Analysis History**: Track all your policy analyses over time (requires authentication)
- **🔒 Privacy-First**: All processing happens in-memory with no permanent file storage
- **🎨 Modern UI/UX**: Beautiful gradient designs with smooth animations

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Wouter** for routing
- **TanStack Query** for data fetching
- **shadcn/ui** components
- **Lucide React** icons

### Backend
- **Node.js** with Express
- **TypeScript**
- **PostgreSQL** database
- **Drizzle ORM** for database management
- **Google Gemini AI** for policy analysis
- **Multer** for file uploads
- **pdf-parse** for PDF text extraction

### Authentication
- **Google OAuth 2.0**
- **Lucia Auth** for session management

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google Cloud account with Gemini API access
- Google OAuth credentials

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BHUVI-SHIP-IT/Policy-lens.git
   cd Policy-lens
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/policylens

   # AI Configuration
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_gemini_api_key_here
   AI_MODEL=gemini-flash-latest

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

   # Session
   SESSION_SECRET=your_random_session_secret
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5000`

## 🔑 Getting API Keys

### Google Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key and add it to your `.env` file

### Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure consent screen
6. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
7. Copy Client ID and Client Secret to `.env`

## 📖 Usage

### Analyzing a Policy

1. **Enter Policy Text**: Paste insurance policy text directly into the textarea
2. **Upload PDF**: Click the upload button to analyze PDF documents (max 50MB)
3. **Run Analysis**: Click "Analyze Policy" to get AI-powered insights
4. **View Results**: See risk assessment, key exclusions, and recommendations

### Using the Chat Assistant

1. Navigate to the Chat page
2. The assistant automatically has context of your uploaded policy
3. Ask questions like:
   - "What does this policy cover?"
   - "Are natural disasters covered?"
   - "What are the main exclusions?"

### Viewing Exclusions

1. Go to the Exclusions page after analysis
2. Filter by risk level (High, Medium, Low)
3. See detailed explanations and implications

### Checking History

1. Sign in with Google
2. Navigate to History page
3. View all your past policy analyses

## 📁 Project Structure

```
PolicyLens/
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   └── ui/         # shadcn/ui components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and configs
│   │   └── pages/          # Page components
│   └── public/             # Static assets
├── server/                  # Backend Express application
│   ├── auth.ts             # Authentication logic
│   ├── routes.ts           # API routes
│   ├── ai-engine.ts        # AI analysis engine
│   ├── pdf-parser.ts       # PDF processing
│   └── index.ts            # Server entry point
├── shared/                  # Shared types and schemas
│   └── schema.ts           # Database schema
└── .env                     # Environment variables
```

## 🔌 API Endpoints

### Policy Analysis
- `POST /api/ai/analyze` - Analyze policy text
  ```json
  {
    "policyText": "string"
  }
  ```

### Chat
- `POST /api/ai/chat` - Ask questions about policy
  ```json
  {
    "question": "string",
    "policyContext": "string"
  }
  ```

### File Upload
- `POST /api/upload/pdf` - Upload and parse PDF
  - Content-Type: `multipart/form-data`
  - Field: `policyDocument`
  - Max size: 50MB

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `POST /api/auth/logout` - Sign out

### History
- `GET /api/policy-analyses` - Get user's analysis history
- `POST /api/policy-analyses` - Save analysis to history

## 🎯 Features in Detail

### AI Analysis Output
The AI provides:
- **Overall Risk Score** (0-100)
- **Risk Level** (High/Medium/Low)
- **Key Exclusions**: Major items not covered
- **Recommendations**: Actionable advice
- **Coverage Summary**: What's included
- **Detailed Analysis**: Comprehensive insights

### Privacy & Security
- No permanent file storage (in-memory processing)
- Secure session management with Lucia Auth
- Google OAuth for authentication
- Environment-based API key management

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Built with ❤️ by the PolicyLens team

## 🐛 Known Issues

- Analysis history requires user authentication
- Maximum file upload size: 50MB
- PDF parsing works best with text-based PDFs (not scanned images)

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Note**: This is a demonstration project. For production use, ensure proper security audits and compliance with insurance industry regulations.
