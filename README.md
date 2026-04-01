# Image Background Remover 🦞</

> A simple, fast, and free online tool to remove backgrounds from images.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-orange)

## ✨ Features

- 🚀 **Fast** - Remove background in 5 seconds
- 🔒 **Secure** - Images are processed in memory and not stored
- 📱 **Responsive** - Works on desktop, tablet, and mobile
- 🎨 **High Quality** - Preserves original image quality
- 📤 **Easy Upload** - Drag and drop or click to upload

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **API**: Cloudflare Workers / Next.js API Routes
- **Background Removal**: Remove.bg API

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm / yarn / pnpm
- Remove.bg API Key ([Get one here](https://www.remove.bg/zh/developers/api))

### Installation

1. Clone the repository
```bash
git clone https://github.com/Loriaya/image-background-remover2.git
cd image-background-remover2
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local and add your REMOVE_BG_API_KEY
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variable `REMOVE_BG_API_KEY`
4. Deploy!

### Cloudflare Pages

1. Connect your GitHub repository to Cloudflare Pages
2. Add environment variable `REMOVE_BG_API_KEY`
3. Build command: `npm run build`
4. Output directory: `.next`

## 📁 Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── remove-bg/
│   │   │       └── route.ts    # API endpoint
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Main page
│   │   └── globals.css
│   ├── components/
│   │   ├── UploadZone.tsx      # Upload component
│   │   ├── ImagePreview.tsx     # Comparison view
│   │   └── ProcessingState.tsx # Loading state
│   └── lib/
│       └── remove-bg.ts        # API utilities
├── public/
├── .env.example
├── next.config.js
├── tailwind.config.ts
└── package.json
```

## 💰 Cost

- **Remove.bg**: $0.09 per image (Free tier: 50 images/hour with CPU processing)
- **Hosting**: Free options available (Vercel, Cloudflare Pages)

## 📄 License

MIT

---

Made with 🦐 by [Loriaya](https://github.com/Loriaya)
