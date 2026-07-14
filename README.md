# ⚽ Reverse Akinator

A modern, highly-interactive web application built with React and Tailwind CSS. Instead of guessing the player you are thinking of, the AI attempts to guess by asking you up to 20 strategic questions!

## 🚀 Features
- **Strict State Management**: Robust state machine handling `INTRO`, `ASKING`, `LOADING`, `WIN`, and `LOSE` game flows.
- **Dynamic UI**: Beautiful, EA-Sports inspired cyberpunk aesthetic featuring glassmorphism and subtle micro-animations.
- **Responsive Design**: Fully responsive component architecture that looks great on mobile, tablet, and desktop.
- **Vite & React**: Lightning-fast local development and optimized production builds.

## 🛠️ Tech Stack
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)

## 💻 Running Locally

To get the project running on your local machine, follow these steps:

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/YOUR_USERNAME/reverse-akinator.git
   cd reverse-akinator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the URL provided in your terminal (usually `http://localhost:5173/`).

## 📁 Project Structure
- `src/components/` - Modular UI components (`GameSession`, `GameScreen`, `IntroScreen`, etc.)
- `src/hooks/` - Custom React hooks handling business logic (`useGameMachine`)
- `src/types/` - TypeScript type definitions

## 🎮 How to Play
1. Think of a famous football player.
2. Click **Start Game**.
3. The AI will ask you Yes/No style questions. Answer them truthfully using the on-screen buttons.
4. If the AI guesses correctly within 20 questions, it wins. If it can't, you win!
