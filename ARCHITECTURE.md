# GeneralPDF Architecture

## 1. Directory Structure

```
/
âââ src/
â   âââ assets/         # Static assets (images, icons)
â   âââ components/     # Reusable UI components
â   â   âââ layout/     # Header, Footer, LoadingBar, MainLayout
â   â   âââ common/     # Buttons, Modals, Inputs
â   â   âââ tools/      # Specific tool UI components (e.g., PDFViewer, SignatureCanvas)
â   âââ hooks/          # Custom React hooks (e.g., usePDFReader, useTranslation)
â   âââ pages/          # Application routes (Home, NormalTools, AITools, etc.)
â   âââ services/       # External service integrations
â   â   âââ aiService.ts       # Unified API for Gemini/OpenAI logic
â   â   âââ cryptoService.ts   # AES-256-GCM encryption logic
â   â   âââ pdfService.ts      # pdf-lib wrappers for PDF manipulation
â   âââ store/          # Zustand state management
â   â   âââ useAppStore.ts     # Global state (theme, language, loading)
â   â   âââ usePdfStore.ts     # Current active PDF, pages, edits
â   âââ utils/          # Helper functions (e.g., file readers, formatters)
â   âââ workers/        # Web Workers for heavy computations
â   â   âââ crypto.worker.ts   # Background encryption/decryption
â   â   âââ ocr.worker.ts      # Background text extraction (Tesseract.js)
â   â   âââ pdf.worker.ts      # Background PDF processing (splitting, merging)
â   âââ App.tsx         # Root component and Routing
â   âââ main.tsx        # Entry point
â   âââ index.css       # Tailwind CSS & Global styles
âââ public/           # Static files served directly
âââ .env.example      # Example environment variables
âââ package.json
âââ vite.config.ts    # Vite configuration
```

## 2. Component, Hook, Service, and Util Organization

- **Components (`src/components/`)**: Strictly presentation and user interaction. They listen to the Zustand store for data and call Services/Hooks to trigger actions.
- **Hooks (`src/hooks/`)**: Act as glue between the UI and Services. Examples include `usePDFProcessor` which manages the lifecycle of sending a file to a Web Worker, updating the Zustand loading state, and receiving the result.
- **Services (`src/services/`)**: Pure TypeScript logic (UI-agnostic). They handle calls to `pdf-lib`, API interactions, and setting up communication with Web Workers. 
  - *Example*: `aiService.ts` will expose `generateAIResponse(text, context, task)`.
- **Utils (`src/utils/`)**: Small, stateless helper functions like `formatBytes(size)`, `cn` (for Tailwind class merging), and `generateFileHash(file)`.

## 3. Decoupling Logic from UI (Heavy Processing via Web Workers)

To ensure the UI remains fully responsive (e.g., the browser does not freeze) during expensive operations like OCR extraction, heavy PDF manipulation, or AES encryption, we utilize **Web Workers**:

### The Flow:
1. **User Interaction**: User clicks "Encrypt PDF".
2. **Component Level**: The UI component sets `isLoading: true` and `loadingMessage: 'Encrypting...'` in `useAppStore`. It then calls a hook/service function `encryptFile(file, password)`.
3. **Service Layer**: The service spawns or communicates with `crypto.worker.ts`, passing the raw `ArrayBuffer` of the PDF and the password.
4. **Web Worker Thread**: The worker performs PBKDF2 key derivation and AES-256-GCM encryption/decryption in the background. It can post messages back to the main thread (e.g., `progress: 50%`) to update the loading bar.
5. **Completion**: The worker posts the encrypted `ArrayBuffer` back to the main thread.
6. **Finalizing**: The service receives the data, stops the loading indicator in `useAppStore`, and triggers a download or update in the UI.

This separation guarantees that animations, scrolling, and status updates ("Ø¬Ø§Ø±Ù Ø§ÙÙØ¹Ø§ÙØ¬Ø©...") perfectly render at 60 FPS while the CPU works at 100% in the background thread.
