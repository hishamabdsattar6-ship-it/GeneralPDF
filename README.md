# GeneralPDF - Smart AI-Powered PDF Management Suite

GeneralPDF is a comprehensive, all-in-one web application for managing, editing, and enhancing PDF documents. It leverages modern web technologies and AI models (Gemini) to provide a fast, secure, and professional experience.

## 🚀 Features

- **Standard Tools**: Merge, Split, Compress, Create, View, Edit, Sign, and Encrypt PDF files.
- **AI Tools**:
  - **OCR**: Extract text from scanned PDFs or images using Tesseract.js.
  - **Summarize**: Get concise summaries of long documents using Gemini AI.
  - **Chat with PDF**: Interact with your documents and ask questions about the content.
  - **AI Create**: Generate complete PDF documents from simple descriptions.
  - **Compare**: Highlight differences between two PDF versions.
  - **Translate**: Translate your PDF content while maintaining the context.
- **Performance**:
  - **Web Workers**: Heavy computations (like OCR and encryption) run in background threads to keep the UI smooth.
  - **Code Splitting**: Lazy loading of components for minimal initial bundle size.
  - **Client-Side Processing**: Most operations happen directly in the browser for maximum privacy and speed.
- **UI/UX**:
  - **Full RTL Support**: Native Arabic and English support with dynamic layout adjustment.
  - **Dark Mode**: Eye-friendly interface for all environments.
  - **Responsive Design**: Polished experience on mobile, tablet, and desktop.
  - **Real-time Progress**: Visual feedback for long-running operations.

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Framer Motion.
- **State Management**: Zustand (with Persistence).
- **PDF Logic**: pdfjs-dist, pdf-lib, tesseract.js.
- **AI**: Gemini 1.5 Flash (via @google/genai) and GPT-4o-mini (via OpenAI).

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment example file:
   ```bash
   cp .env.example .env
   ```
4. Add your API keys to the `.env` file (see Configuration).

### Development

Start the development server:
```bash
npm run dev
```

### Production Build

Create a production build:
```bash
npm run build
```

The static files will be in the `dist` directory.

## ⚙️ Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Gemini API Key (Required for AI features)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Choose the default AI provider
VITE_AI_PROVIDER=gemini
```

## 🔐 Security & Privacy

- **No Uploads**: Most processing is done client-side using `pdf-lib` and `pdf.js`. Your data never leaves your machine unless you use AI features (where text is sent to Gemini APIs).
- **Encryption**: Support for strong PDF passwords to protect sensitive information.
- **Open Privacy**: We do not store or track your files.

## 📄 License

This project is licensed under the Apache-2.0 License.
