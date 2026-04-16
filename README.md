# Stranger Things Crossword Challenge (EFL A1-B2)

Interactive classroom crossword game inspired by Stranger Things.

## What This App Includes

- Interactive crossword with 20 words and clues related to Stranger Things
- EFL-friendly clues designed for A1 to B2 learners
- Live letter validation:
  - Correct letter: green/teal highlight
  - Incorrect letter: orange highlight
- Team competition mode:
  - Team A / Team B round selector
  - "Next round" switch button
  - Points are awarded only when a full word is solved
- Scrabble-style letter scoring (higher-value letters give more points)
- Animations:
  - Word-solved feedback animation + message
  - Full-puzzle completion overlay + confetti animation
- Retro sound effects with ON/OFF toggle
- Custom crossword builder panel:
   - Paste lines as `ANSWER|Clue|Level`
   - Build and load custom puzzles from the UI
   - Reload default puzzle at any time
- Responsive UI for classroom screens and laptops

## Recommended Framework Options

These are the strongest options for this type of project:

1. React + Vite + TypeScript (implemented in this project)
   - Best balance of speed, reliability, ecosystem, and maintainability.
   - Great for classroom-ready UI and component organization.

2. Vue + Vite + TypeScript
   - Excellent readability and fast onboarding for many teachers/students.
   - Slightly less common in English teaching content templates than React.

3. SvelteKit
   - Very lightweight and smooth animations.
   - Smaller ecosystem for educational plugins/tools compared to React.

## Why React + TypeScript Was Chosen

- Type safety reduces bugs in crossword placement and scoring logic.
- Predictable state management for teams, rounds, and solved words.
- Easy to extend later (timer mode, hint mode, online multiplayer, teacher dashboard).

## Project Structure

- `src/App.tsx`: Main game logic (crossword generation, scoring, gameplay)
- `src/styles.css`: Stranger Things themed visuals and animations
- `src/main.tsx`: React entry point
- `TODO.md`: Task roadmap and checklist
- `docs/implementation-change-log.md`: Implementation history

## Run Locally

1. Install dependencies:
   - `npm install`
2. Start development server:
   - `npm run dev`
3. Build production version:
   - `npm run build`
4. Preview production build:
   - `npm run preview`

## Gameplay Rules Implemented

- Teams take turns by selecting active team in "Current round".
- Players type letters directly in crossword cells.
- A word is scored only when every letter in that word is correct.
- The active team at that moment receives the full word points.
- No points are granted for partially correct words.

## Custom Words / Custom Crosswords

- Use the "Custom crossword builder" panel in the app.
- Add one word per line in this format:
   - `ANSWER|Clue|Level`
- Example:
   - `VECNA|Main villain in later seasons|A2`
- Valid levels: `A1`, `A2`, `B1`, `B2`.
- Requirements:
   - At least 10 entries
   - Answers between 3 and 12 letters (A-Z)
   - No duplicate answers
- JSON workflows:
   - Export current set using "Export set as JSON"
   - Import a saved set using "Import set from JSON"
   - Supported formats: `{ words: [...] }` or a direct array of word objects

If the generator cannot build a valid grid, the app shows a clear message and you can adjust the word set.

## Pedagogical Notes (EFL)

- Word set includes names, places, objects, and abstract nouns from A1-B2 range.
- Clues use mostly controlled language and short syntax for mixed-level classes.
- Score values motivate strategic clue selection and team collaboration.

## Quality and Bug Prevention

- Strict TypeScript compiler options are enabled.
- Crossword generator validates conflicts and boundaries before placing words.
- UI state avoids duplicate point awards using solved-word tracking.

## Possible Next Improvements

- Teacher panel to edit/add custom word lists per unit.
- Difficulty presets (A1-A2 only, B1-B2 only, mixed).
- Timer and bonus multipliers for tournament mode.
- Export/import puzzle sets as JSON.
