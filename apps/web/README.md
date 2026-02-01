# Arcadeum Web App

The Next.js web application for the Arcadeum platform.

**Live Deployment:** [https://arcadeum.vercel.app/](https://arcadeum.vercel.app/)

## Getting Started

### Prerequisites

- Node.js v18+
- pnpm

### Installation

Install dependencies from the workspace root:

```bash
pnpm install
```

### Environment Setup

Create a `.env.local` file in the `apps/web` directory. You can use the example file as a template:

```bash
cp .env.example .env.local
```

Ensure you configure the necessary environment variables for:

- Backend API URL
- Auth Provider (if applicable, e.g., Google OAuth)

### Running the App

To start the development server:

```bash
pnpm --filter web dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

| Command      | Description              |
| :----------- | :----------------------- |
| `pnpm dev`   | Start development server |
| `pnpm build` | Build for production     |
| `pnpm start` | Start production server  |
| `pnpm lint`  | Run ESLint               |

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (via `postcss` configuration) - _Verify if Tailwind is actually used, otherwise simply CSS/Sass_
- **State Management**: React Context / Hooks
