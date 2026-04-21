# Implementation Change Log

## 2026-04-16

- Created a full React + TypeScript crossword app scaffold manually in workspace.
- Implemented a crossword generator that places 20 Stranger Things words with across/down clues.
- Added letter-by-letter grid interaction with correctness coloring (correct vs incorrect).
- Added team competition logic with round selector and score tracking for Team A and Team B.
- Implemented Scrabble-style letter scoring and full-word-only point assignment.
- Added solved-word detection with duplicate-score protection.
- Added word-solved flash feedback and full-completion celebration overlay with animation.
- Added retro-style sound effects and sound on/off control.
- Implemented Stranger Things-inspired visual theme and responsive layout.
- Added project docs: README, TODO checklist, and change log.
- Resolved TypeScript diagnostics by adjusting `tsconfig.node.json` to avoid pre-install type resolution failure.
- Installed project dependencies successfully with `npm install`.
- Started and verified Vite dev server at `http://localhost:5173/`.
- Added a custom crossword builder panel that accepts `ANSWER|Clue|Level` lines.
- Added input validation for custom sets (minimum entries, answer length, duplicate prevention).
- Added UI actions to build custom crossword sets and reload the default puzzle.
- Added JSON export for custom/default word sets from the builder panel.
- Added JSON import support for saved sets with validation and compatibility checks.
- Added fullscreen/theater mode toggle ("⛶ Theater" button) for classroom projector use.
- Moved sound control button from main control panel to collapsible menu.
- Moved custom crossword builder panel to collapsible menu (opened via "☰ Menu" button).
- Implemented responsive fullscreen layout with enlarged grid cells (28-48px) and larger clue text.
- Fixed TypeScript type annotation for tryBuild function to return correct CrosswordData type.
- Cleaned up duplicate state declarations in App component.

## 2026-04-17

- Reworked theater mode to use the browser Fullscreen API (`requestFullscreen` / `exitFullscreen`) instead of visual-only expansion.
- Added a dedicated fullscreen top navigation bar that combines team selector, scoreboard, and progress into one compact row.
- Kept fullscreen controls (menu and exit fullscreen) in the same top nav for quicker classroom operation.
- Redesigned fullscreen layout to fit in a single viewport (`100dvh`) with no page-level scrolling.
- Tightened crossword cell sizing and restored square/compact cell visuals in fullscreen mode.
- Rebalanced board/clues fullscreen split so both remain readable while fitting one screen.
- Added fullscreen change event handling to keep app state in sync when users exit fullscreen via keyboard.
- Re-ran diagnostics after the redesign with no TypeScript or CSS errors.
- Increased fullscreen crossword visual size by enlarging cell constraints and prioritizing board width over clues width.
- Added fullscreen zoom presets (`Standard`, `Large`, `XL`) in the menu for projector-friendly sizing.
- Connected zoom presets to grid column sizing and fullscreen cell sizing rules for live adjustment.
- Added bilingual support with a new menu language switch (`English` / `Francais`).
- Localized major UI labels, controls, status messages, and completion text for French.
- Added French clue translations for the default Stranger Things word set while keeping custom sets compatible.
- Extended custom word validation to allow answers up to 15 letters.
- Updated crossword generator sizing to adapt to the longest word for improved placement success.
- Added explicit web deployment support by configuring Vite portable base path (`./`).
- Added `build:web` and `preview:web` scripts for static web publishing workflow.
- Documented web deployment steps for non-IDE target computers in README.
- Added GitHub Actions workflow for automatic deployment to GitHub Pages (`.github/workflows/deploy-pages.yml`).
- Documented GitHub Pages setup steps in README.
