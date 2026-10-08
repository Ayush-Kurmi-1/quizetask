# Assessment App

A responsive single-page assessment app built with React, `useReducer`, localStorage persistence, and Tailwind CSS.

## Technologies Used

- React 19
- Vite
- Tailwind CSS
- `useReducer` for quiz state management
- localStorage for progress restoration

## Project Setup

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

## Implementation Details

- The quiz questions live in `src/data/assessmentQuestions.json`.
- A single reducer manages the question list, current question index, selected answers, timer, and quiz status.
- The timer starts at 10 minutes and automatically submits the assessment when it reaches zero.
- Current progress is saved in localStorage and restored after a refresh so the user can continue from the same point.
- After submission, the app shows score, total questions, percentage, and a detailed review of each answer.
- Tailwind CSS is used for the complete responsive UI.
