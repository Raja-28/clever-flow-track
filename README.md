# Smart Expense Manager

A modern, AI-powered personal finance tracking application built with React, TypeScript, and Supabase.

## Features

- 📊 **Dashboard** - Real-time spending analytics and visual charts
- 💰 **Transaction Tracking** - Log income and expenses with categories
- 🤖 **AI Insights** - Get personalized financial recommendations
- 🎯 **Smart Goals** - Set and track savings goals
- 🏆 **Gamification** - Earn badges and level up your financial habits
- 📈 **Trend Analysis** - Visualize spending patterns over time
- 🎨 **Dark/Light Mode** - Beautiful UI with theme support

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Charts**: Recharts
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or bun

### Installation

```bash
# Clone the repository
git clone <your-repo-url>

# Navigate to project directory
cd clever-flow-track

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Netlify

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop the `dist` folder
3. Your site is live!

### Deploy to Vercel

```bash
npx vercel --prod
```

## License

MIT License
