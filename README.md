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
- Collapsible menu with:
  - Sound control (moved from main panel)
   - Language switch (English / French)
  - Custom crossword builder panel
  - JSON import/export for word sets
- Fullscreen theater mode:
  - Hides header/title for projector use
  - Larger grid and clue text for classroom viewing
  - Team selector, scoreboard, and progress remain visible
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

## Deploy as Web App (No IDE Needed on Target Computer)

For another computer, the easiest approach is to deploy the app as a static website.

### 1. Build the web version

- Run:
   - `npm install`
   - `npm run build:web`
- This creates the deployable folder:
   - `dist/`

### 2. Publish `dist/` with one of these options

1. Netlify (fastest)
- Go to Netlify Drop and drag the `dist/` folder.
- You get a public URL instantly.

2. Vercel
- Create a new static project and upload/link this repo.
- Build command: `npm run build:web`
- Output directory: `dist`

3. Any school server / shared hosting
- Upload all files inside `dist/`.
- Open the hosted URL in any browser.

4. GitHub Pages (GitHub servers)
- Push this project to a GitHub repository.
- This project already includes the workflow:
   - `.github/workflows/deploy-pages.yml`
- In GitHub repository settings:
   - Go to `Settings > Pages`
   - Under `Build and deployment`, set `Source` to `GitHub Actions`
- Push to `main` branch.
- GitHub Actions will build and deploy automatically.
- Your app will be available at:
   - `https://<your-username>.github.io/<your-repo>/`

### 3. Use on classroom computers

- Open the hosted URL from Chrome/Edge/Firefox.
- No Visual Studio Code or coding IDE is required.
- No local Node.js install is required on student/teacher client machines.

## Interface Modes

- **Normal Mode** (default):
  - Header with title and current word set displayed
  - Team selector, scoreboard, progress bar in control panel
  - Menu button opens collapsible panel
- **Theater Mode** (fullscreen):
  - Click "⛶ Theater" button to enter
  - Hides header title and banner
  - Enlarges grid cells and clue text
  - Perfect for projector use in classrooms

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
   - Answers between 3 and 15 letters (A-Z)
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
