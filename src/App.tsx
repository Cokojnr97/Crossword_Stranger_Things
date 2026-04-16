import { useEffect, useMemo, useRef, useState } from 'react';

type Direction = 'across' | 'down';
type Team = 'A' | 'B';
type Level = 'A1' | 'A2' | 'B1' | 'B2';

interface WordSpec {
  answer: string;
  clue: string;
  level: Level;
}

interface PlacedWord extends WordSpec {
  id: string;
  row: number;
  col: number;
  direction: Direction;
  number: number;
  cells: Array<{ row: number; col: number; letter: string }>;
  score: number;
}

interface CrosswordData {
  size: number;
  grid: Array<Array<string | null>>;
  words: PlacedWord[];
  startCellNumbers: Record<string, number>;
}

interface CustomWordSetPayload {
  name: string;
  exportedAt: string;
  words: WordSpec[];
}

const WORD_BANK: WordSpec[] = [
  { answer: 'ELEVEN', clue: 'Girl with powers who closes the gate', level: 'A2' },
  { answer: 'HOPPER', clue: 'Police chief of Hawkins', level: 'A2' },
  { answer: 'MIKE', clue: 'Boy who leads the friend group', level: 'A1' },
  { answer: 'DUSTIN', clue: 'Funny friend with a cap and great ideas', level: 'A2' },
  { answer: 'LUCAS', clue: 'Friend who is practical and brave', level: 'A2' },
  { answer: 'MAX', clue: 'Skateboard girl and strong friend', level: 'A1' },
  { answer: 'WILL', clue: 'Boy who disappears in season one', level: 'A1' },
  { answer: 'UPSIDEDOWN', clue: 'Dark parallel world full of danger', level: 'B1' },
  { answer: 'DEMOGORGON', clue: 'Monster from another world', level: 'B1' },
  { answer: 'VECNA', clue: 'Main villain in later seasons', level: 'A2' },
  { answer: 'HAWKINS', clue: 'Small town where the story happens', level: 'A2' },
  { answer: 'PORTAL', clue: 'Opening between two worlds', level: 'B1' },
  { answer: 'LABORATORY', clue: 'Secret place for dangerous experiments', level: 'B2' },
  { answer: 'BICYCLE', clue: 'Vehicle the kids use to travel quickly', level: 'A2' },
  { answer: 'WAFFLES', clue: 'Food Eleven loves', level: 'A1' },
  { answer: 'RADIO', clue: 'Device used for communication', level: 'A1' },
  { answer: 'FLASHLIGHT', clue: 'Tool used in dark places', level: 'A2' },
  { answer: 'MYSTERY', clue: 'A situation that is difficult to explain', level: 'B1' },
  { answer: 'FRIENDSHIP', clue: 'Strong bond between the main characters', level: 'B1' },
  { answer: 'COURAGE', clue: 'Brave feeling when facing danger', level: 'B1' }
];

const LETTER_POINTS: Record<string, number> = {
  A: 1,
  B: 3,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 2,
  H: 4,
  I: 1,
  J: 8,
  K: 5,
  L: 1,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  V: 4,
  W: 4,
  X: 8,
  Y: 4,
  Z: 10
};

const ALLOWED_LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2'];

const CUSTOM_TEMPLATE = [
  'ELEVEN|Girl with powers who closes the gate|A2',
  'HOPPER|Police chief of Hawkins|A2',
  'UPSIDEDOWN|Dark parallel world full of danger|B1',
  'WAFFLES|Food Eleven loves|A1',
  'DEMOGORGON|Monster from another world|B1'
].join('\n');

const KEY = (row: number, col: number): string => `${row}-${col}`;

const scoreWord = (answer: string): number =>
  answer
    .split('')
    .reduce((sum, letter) => sum + (LETTER_POINTS[letter] ?? 0), 0);

function inBounds(size: number, row: number, col: number): boolean {
  return row >= 0 && row < size && col >= 0 && col < size;
}

function canPlaceWord(
  grid: Array<Array<string | null>>,
  word: string,
  row: number,
  col: number,
  direction: Direction
): boolean {
  const size = grid.length;

  for (let i = 0; i < word.length; i += 1) {
    const r = row + (direction === 'down' ? i : 0);
    const c = col + (direction === 'across' ? i : 0);

    if (!inBounds(size, r, c)) {
      return false;
    }

    const existing = grid[r][c];
    if (existing !== null && existing !== word[i]) {
      return false;
    }

    if (existing === null) {
      if (direction === 'across') {
        const up = r - 1;
        const down = r + 1;
        if (inBounds(size, up, c) && grid[up][c] !== null) {
          return false;
        }
        if (inBounds(size, down, c) && grid[down][c] !== null) {
          return false;
        }
      } else {
        const left = c - 1;
        const right = c + 1;
        if (inBounds(size, r, left) && grid[r][left] !== null) {
          return false;
        }
        if (inBounds(size, r, right) && grid[r][right] !== null) {
          return false;
        }
      }
    }
  }

  const beforeRow = row - (direction === 'down' ? 1 : 0);
  const beforeCol = col - (direction === 'across' ? 1 : 0);
  if (inBounds(size, beforeRow, beforeCol) && grid[beforeRow][beforeCol] !== null) {
    return false;
  }

  const afterRow = row + (direction === 'down' ? word.length : 0);
  const afterCol = col + (direction === 'across' ? word.length : 0);
  if (inBounds(size, afterRow, afterCol) && grid[afterRow][afterCol] !== null) {
    return false;
  }

  return true;
}

function commitWord(
  grid: Array<Array<string | null>>,
  word: string,
  row: number,
  col: number,
  direction: Direction
): Array<{ row: number; col: number; letter: string }> {
  const cells: Array<{ row: number; col: number; letter: string }> = [];

  for (let i = 0; i < word.length; i += 1) {
    const r = row + (direction === 'down' ? i : 0);
    const c = col + (direction === 'across' ? i : 0);
    grid[r][c] = word[i];
    cells.push({ row: r, col: c, letter: word[i] });
  }

  return cells;
}

function tryBuild(size: number, words: WordSpec[]): Omit<CrosswordData, 'startCellNumbers'> | null {
  const grid: Array<Array<string | null>> = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null)
  );

  const placed: Array<Omit<PlacedWord, 'number'>> = [];

  const sorted = [...words].sort((a, b) => b.answer.length - a.answer.length);
  const first = sorted[0];
  const startRow = Math.floor(size / 2);
  const startCol = Math.max(0, Math.floor((size - first.answer.length) / 2));

  if (!canPlaceWord(grid, first.answer, startRow, startCol, 'across')) {
    return null;
  }

  placed.push({
    id: first.answer,
    answer: first.answer,
    clue: first.clue,
    level: first.level,
    row: startRow,
    col: startCol,
    direction: 'across',
    cells: commitWord(grid, first.answer, startRow, startCol, 'across'),
    score: scoreWord(first.answer)
  });

  for (let index = 1; index < sorted.length; index += 1) {
    const next = sorted[index];
    let placedNow = false;

    for (const existing of placed) {
      if (placedNow) {
        break;
      }

      for (let i = 0; i < next.answer.length; i += 1) {
        if (placedNow) {
          break;
        }

        for (let j = 0; j < existing.answer.length; j += 1) {
          if (next.answer[i] !== existing.answer[j]) {
            continue;
          }

          const direction: Direction = existing.direction === 'across' ? 'down' : 'across';
          const row =
            existing.row + (existing.direction === 'down' ? j : 0) - (direction === 'down' ? i : 0);
          const col =
            existing.col + (existing.direction === 'across' ? j : 0) - (direction === 'across' ? i : 0);

          if (!canPlaceWord(grid, next.answer, row, col, direction)) {
            continue;
          }

          placed.push({
            id: next.answer,
            answer: next.answer,
            clue: next.clue,
            level: next.level,
            row,
            col,
            direction,
            cells: commitWord(grid, next.answer, row, col, direction),
            score: scoreWord(next.answer)
          });
          placedNow = true;
          break;
        }
      }
    }

    if (placedNow) {
      continue;
    }

    for (const direction of ['across', 'down'] as const) {
      if (placedNow) {
        break;
      }

      for (let row = 0; row < size; row += 1) {
        if (placedNow) {
          break;
        }

        for (let col = 0; col < size; col += 1) {
          if (!canPlaceWord(grid, next.answer, row, col, direction)) {
            continue;
          }

          placed.push({
            id: next.answer,
            answer: next.answer,
            clue: next.clue,
            level: next.level,
            row,
            col,
            direction,
            cells: commitWord(grid, next.answer, row, col, direction),
            score: scoreWord(next.answer)
          });
          placedNow = true;
          break;
        }
      }
    }

    if (!placedNow) {
      return null;
    }
  }

  const startsSorted = [...placed].sort((a, b) => (a.row - b.row) || (a.col - b.col));
  let nextNumber = 1;
  const numberByCell: Record<string, number> = {};

  const withNumbers: PlacedWord[] = startsSorted.map((word) => {
    const startKey = KEY(word.row, word.col);
    if (numberByCell[startKey] === undefined) {
      numberByCell[startKey] = nextNumber;
      nextNumber += 1;
    }

    return {
      ...word,
      number: numberByCell[startKey]
    };
  });

  return {
    size,
    grid,
    words: withNumbers,
    startCellNumbers: numberByCell
  };
}

function buildCrossword(words: WordSpec[]): CrosswordData {
  for (let size = 17; size <= 24; size += 1) {
    const built = tryBuild(size, words);
    if (built !== null) {
      return built;
    }
  }

  throw new Error('Could not generate crossword with the current word list.');
}

function parseCustomWordSet(raw: string): { words: WordSpec[]; error: string | null } {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 10) {
    return { words: [], error: 'Please provide at least 10 words for a stable crossword.' };
  }

  const words: WordSpec[] = [];
  const seenAnswers = new Set<string>();

  for (const line of lines) {
    const parts = line.split('|').map((part) => part.trim());
    if (parts.length < 2) {
      return {
        words: [],
        error: `Invalid line: "${line}". Use ANSWER|Clue|Level.`
      };
    }

    const normalizedAnswer = parts[0].toUpperCase().replace(/[^A-Z]/g, '');
    const clue = parts[1];
    const levelRaw = (parts[2] ?? 'A2').toUpperCase() as Level;
    const level: Level = ALLOWED_LEVELS.includes(levelRaw) ? levelRaw : 'A2';

    if (normalizedAnswer.length < 3 || normalizedAnswer.length > 12) {
      return {
        words: [],
        error: `Word "${parts[0]}" must have 3-12 letters (A-Z only).`
      };
    }

    if (clue.length < 5) {
      return {
        words: [],
        error: `Clue for "${normalizedAnswer}" is too short.`
      };
    }

    if (seenAnswers.has(normalizedAnswer)) {
      return {
        words: [],
        error: `Duplicate answer detected: "${normalizedAnswer}".`
      };
    }

    seenAnswers.add(normalizedAnswer);
    words.push({
      answer: normalizedAnswer,
      clue,
      level
    });
  }

  return { words, error: null };
}

function wordsToBuilderText(words: WordSpec[]): string {
  return words.map((word) => `${word.answer}|${word.clue}|${word.level}`).join('\n');
}

function sanitizeJsonWords(rawWords: unknown): { words: WordSpec[]; error: string | null } {
  if (!Array.isArray(rawWords)) {
    return { words: [], error: 'Imported JSON must contain a words array.' };
  }

  const lines: string[] = [];
  for (const item of rawWords) {
    if (typeof item !== 'object' || item === null) {
      return { words: [], error: 'Imported words must be objects.' };
    }

    const answer = String((item as { answer?: unknown }).answer ?? '');
    const clue = String((item as { clue?: unknown }).clue ?? '');
    const level = String((item as { level?: unknown }).level ?? 'A2').toUpperCase();
    lines.push(`${answer}|${clue}|${level}`);
  }

  return parseCustomWordSet(lines.join('\n'));
}

function App(): JSX.Element {
  const [wordSet, setWordSet] = useState<WordSpec[]>(WORD_BANK);
  const [wordSetMode, setWordSetMode] = useState<'default' | 'custom'>('default');
  const [customInput, setCustomInput] = useState<string>(CUSTOM_TEMPLATE);
  const [builderError, setBuilderError] = useState<string>('');

  const crossword = useMemo(() => buildCrossword(wordSet), [wordSet]);
  const wordsById = useMemo(
    () => Object.fromEntries(crossword.words.map((word) => [word.id, word])),
    [crossword.words]
  );

  const acrossWords = useMemo(
    () => crossword.words.filter((word) => word.direction === 'across').sort((a, b) => a.number - b.number),
    [crossword.words]
  );
  const downWords = useMemo(
    () => crossword.words.filter((word) => word.direction === 'down').sort((a, b) => a.number - b.number),
    [crossword.words]
  );

  const cellSolution = useMemo(() => {
    const map: Record<string, string> = {};
    crossword.words.forEach((word) => {
      word.cells.forEach((cell) => {
        map[KEY(cell.row, cell.col)] = cell.letter;
      });
    });
    return map;
  }, [crossword.words]);

  const cellToWords = useMemo(() => {
    const map: Record<string, string[]> = {};
    crossword.words.forEach((word) => {
      word.cells.forEach((cell) => {
        const key = KEY(cell.row, cell.col);
        map[key] = map[key] ? [...map[key], word.id] : [word.id];
      });
    });
    return map;
  }, [crossword.words]);

  const [entries, setEntries] = useState<Record<string, string>>({});
  const [selectedWordId, setSelectedWordId] = useState<string>(crossword.words[0]?.id ?? '');
  const [activeTeam, setActiveTeam] = useState<Team>('A');
  const [scores, setScores] = useState<Record<Team, number>>({ A: 0, B: 0 });
  const [solvedBy, setSolvedBy] = useState<Record<string, Team>>({});
  const [flashMessage, setFlashMessage] = useState<string>('');
  const [allSolved, setAllSolved] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const solvedCount = Object.keys(solvedBy).length;
  const completionPercent = crossword.words.length > 0
    ? Math.round((solvedCount / crossword.words.length) * 100)
    : 0;

  const selectedWord = selectedWordId ? wordsById[selectedWordId] : undefined;

  function ensureAudioContext(): AudioContext | null {
    if (!soundEnabled) {
      return null;
    }

    if (audioRef.current === null) {
      audioRef.current = new AudioContext();
    }

    return audioRef.current;
  }

  function playTone(freq: number, durationMs: number): void {
    const ctx = ensureAudioContext();
    if (ctx === null) {
      return;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  }

  function playWordSolvedSound(): void {
    playTone(523.25, 120);
    window.setTimeout(() => playTone(659.25, 140), 110);
  }

  function playCompleteSound(): void {
    const sequence = [392.0, 523.25, 659.25, 783.99];
    sequence.forEach((freq, idx) => {
      window.setTimeout(() => playTone(freq, 180), idx * 130);
    });
  }

  function isWordSolved(word: PlacedWord, state: Record<string, string>): boolean {
    return word.cells.every((cell) => state[KEY(cell.row, cell.col)] === cell.letter);
  }

  function handleCellInput(row: number, col: number, rawValue: string): void {
    const key = KEY(row, col);
    const value = rawValue.toUpperCase().replace(/[^A-Z]/g, '').slice(-1);

    setEntries((prev) => {
      const next = { ...prev };
      if (value === '') {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });

    const word = selectedWord;
    if (!word || value === '') {
      return;
    }

    const currentIndex = word.cells.findIndex((cell) => cell.row === row && cell.col === col);
    if (currentIndex >= 0 && currentIndex < word.cells.length - 1) {
      const nextCell = word.cells[currentIndex + 1];
      const nextRef = inputRefs.current[KEY(nextCell.row, nextCell.col)];
      nextRef?.focus();
    }
  }

  function handleCellKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
    row: number,
    col: number
  ): void {
    if (event.key !== 'Backspace') {
      return;
    }

    const key = KEY(row, col);
    if ((entries[key] ?? '') !== '') {
      return;
    }

    const word = selectedWord;
    if (!word) {
      return;
    }

    const currentIndex = word.cells.findIndex((cell) => cell.row === row && cell.col === col);
    if (currentIndex > 0) {
      const prevCell = word.cells[currentIndex - 1];
      const prevRef = inputRefs.current[KEY(prevCell.row, prevCell.col)];
      prevRef?.focus();
    }
  }

  function selectWordFromCell(row: number, col: number): void {
    const wordsInCell = cellToWords[KEY(row, col)] ?? [];
    if (wordsInCell.length === 0) {
      return;
    }

    if (wordsInCell.length === 1) {
      setSelectedWordId(wordsInCell[0]);
      return;
    }

    const unsolved = wordsInCell.find((wordId) => solvedBy[wordId] === undefined);
    setSelectedWordId(unsolved ?? wordsInCell[0]);
  }

  function switchTeamForNextRound(): void {
    setActiveTeam((prev) => (prev === 'A' ? 'B' : 'A'));
  }

  function resetGameState(): void {
    setEntries({});
    setSelectedWordId('');
    setActiveTeam('A');
    setScores({ A: 0, B: 0 });
    setSolvedBy({});
    setFlashMessage('');
    setAllSolved(false);
    inputRefs.current = {};
  }

  function loadDefaultPuzzle(): void {
    setWordSet(WORD_BANK);
    setWordSetMode('default');
    setBuilderError('');
    resetGameState();
    setFlashMessage('Default Stranger Things puzzle loaded.');
    window.setTimeout(() => setFlashMessage(''), 1800);
  }

  function applyCustomPuzzle(): void {
    const parsed = parseCustomWordSet(customInput);
    if (parsed.error !== null) {
      setBuilderError(parsed.error);
      return;
    }

    try {
      buildCrossword(parsed.words);
    } catch {
      setBuilderError(
        'Could not generate a crossword with this set. Try shorter words and more shared letters.'
      );
      return;
    }

    setWordSet(parsed.words);
    setWordSetMode('custom');
    setBuilderError('');
    resetGameState();
    setFlashMessage(`Custom crossword loaded (${parsed.words.length} words).`);
    window.setTimeout(() => setFlashMessage(''), 2200);
  }

  function exportCustomSet(): void {
    const parsedFromEditor = parseCustomWordSet(customInput);
    const wordsToExport = parsedFromEditor.error === null ? parsedFromEditor.words : wordSet;

    const payload: CustomWordSetPayload = {
      name: 'crossword-word-set',
      exportedAt: new Date().toISOString(),
      words: wordsToExport
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crossword-word-set-${Date.now()}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setFlashMessage(`Exported ${wordsToExport.length} words to JSON.`);
    window.setTimeout(() => setFlashMessage(''), 1800);
  }

  async function onImportFileChange(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const content = await file.text();
      const parsedJson = JSON.parse(content) as unknown;

      const rawWords =
        Array.isArray(parsedJson)
          ? parsedJson
          : (parsedJson as { words?: unknown }).words;

      const cleaned = sanitizeJsonWords(rawWords);
      if (cleaned.error !== null) {
        setBuilderError(cleaned.error);
        return;
      }

      try {
        buildCrossword(cleaned.words);
      } catch {
        setBuilderError(
          'Imported set could not build a crossword. Use shorter words and more shared letters.'
        );
        return;
      }

      setCustomInput(wordsToBuilderText(cleaned.words));
      setWordSet(cleaned.words);
      setWordSetMode('custom');
      setBuilderError('');
      resetGameState();
      setFlashMessage(`Imported custom set (${cleaned.words.length} words).`);
      window.setTimeout(() => setFlashMessage(''), 2200);
    } catch {
      setBuilderError('Could not read JSON file. Please check file format.');
    } finally {
      event.target.value = '';
    }
  }

  useEffect(() => {
    setSelectedWordId(crossword.words[0]?.id ?? '');
  }, [crossword]);

  useEffect(() => {
    const newlySolved = crossword.words.filter(
      (word) => solvedBy[word.id] === undefined && isWordSolved(word, entries)
    );

    if (newlySolved.length === 0) {
      return;
    }

    setSolvedBy((prev) => {
      const next = { ...prev };
      newlySolved.forEach((word) => {
        next[word.id] = activeTeam;
      });

      if (Object.keys(next).length === crossword.words.length) {
        setAllSolved(true);
      }

      return next;
    });

    const earned = newlySolved.reduce((sum, word) => sum + word.score, 0);
    setScores((prev) => ({
      ...prev,
      [activeTeam]: prev[activeTeam] + earned
    }));

    const solvedText = newlySolved.length > 1 ? `${newlySolved.length} words` : newlySolved[0].answer;
    setFlashMessage(`Team ${activeTeam} solved ${solvedText} (+${earned})`);
    window.setTimeout(() => setFlashMessage(''), 2000);

    playWordSolvedSound();

    if (solvedCount + newlySolved.length === crossword.words.length) {
      playCompleteSound();
    }
  }, [activeTeam, crossword.words, entries, solvedBy, solvedCount]);

  const winnerLabel =
    scores.A === scores.B
      ? 'Tie game'
      : scores.A > scores.B
        ? 'Team A leads'
        : 'Team B leads';

  return (
    <div className="page-wrap">
      <div className="noise-layer" aria-hidden="true" />
      <header className="top-banner">
        <h1 className="neon-title">Stranger Things Crossword</h1>
        <p className="subtitle">EFL Challenge A1-B2 | Team Competition Mode | {wordSetMode === 'default' ? 'Default set' : 'Custom set'}</p>
      </header>

      <section className="control-panel" aria-label="Game controls">
        <div className="score-box">
          <p className="label">Current round</p>
          <div className="team-switcher" role="group" aria-label="Team selector">
            <button
              type="button"
              onClick={() => setActiveTeam('A')}
              className={activeTeam === 'A' ? 'team-btn active team-a' : 'team-btn team-a'}
            >
              Team A
            </button>
            <button
              type="button"
              onClick={() => setActiveTeam('B')}
              className={activeTeam === 'B' ? 'team-btn active team-b' : 'team-btn team-b'}
            >
              Team B
            </button>
            <button type="button" className="team-btn next-round" onClick={switchTeamForNextRound}>
              Next round
            </button>
          </div>
        </div>

        <div className="score-box">
          <p className="label">Scoreboard</p>
          <p className="score-line">Team A: {scores.A} pts</p>
          <p className="score-line">Team B: {scores.B} pts</p>
          <p className="score-hint">{winnerLabel}</p>
        </div>

        <div className="score-box">
          <p className="label">Progress</p>
          <p className="score-line">{solvedCount} / {crossword.words.length} words solved</p>
          <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completionPercent}>
            <span className="progress-fill" style={{ width: `${completionPercent}%` }} />
          </div>
          <button
            type="button"
            className={soundEnabled ? 'sound-btn enabled' : 'sound-btn'}
            onClick={() => setSoundEnabled((prev) => !prev)}
          >
            {soundEnabled ? 'Sound: ON' : 'Sound: OFF'}
          </button>
        </div>
      </section>

      <section className="builder-panel" aria-label="Custom crossword builder">
        <p className="label">Custom crossword builder (future-proof mode)</p>
        <p className="builder-help">One item per line: ANSWER|Clue|Level. Levels: A1, A2, B1, B2.</p>
        <textarea
          className="builder-input"
          value={customInput}
          onChange={(event) => setCustomInput(event.target.value)}
          aria-label="Custom crossword input"
          spellCheck={false}
        />
        <div className="builder-actions">
          <button type="button" className="team-btn" onClick={loadDefaultPuzzle}>
            Load default puzzle
          </button>
          <button type="button" className="team-btn active" onClick={applyCustomPuzzle}>
            Build custom crossword
          </button>
          <button type="button" className="team-btn" onClick={exportCustomSet}>
            Export set as JSON
          </button>
          <button
            type="button"
            className="team-btn"
            onClick={() => importInputRef.current?.click()}
          >
            Import set from JSON
          </button>
          <input
            ref={importInputRef}
            className="import-input"
            type="file"
            accept="application/json,.json"
            onChange={onImportFileChange}
          />
        </div>
        {builderError && <p className="builder-error">{builderError}</p>}
      </section>

      {flashMessage && <div className="flash-message">{flashMessage}</div>}

      <main className="game-layout">
        <section className="board-section" aria-label="Crossword board">
          <div className="grid" style={{ gridTemplateColumns: `repeat(${crossword.size}, minmax(20px, 34px))` }}>
            {crossword.grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const key = KEY(rowIndex, colIndex);
                if (cell === null) {
                  return <div key={key} className="cell block" aria-hidden="true" />;
                }

                const isSelectedCell = selectedWord?.cells.some(
                  (wordCell) => wordCell.row === rowIndex && wordCell.col === colIndex
                );
                const inputValue = entries[key] ?? '';
                const statusClass =
                  inputValue === ''
                    ? 'empty'
                    : inputValue === cellSolution[key]
                      ? 'correct'
                      : 'incorrect';

                const solvedCell = (cellToWords[key] ?? []).some((wordId) => solvedBy[wordId] !== undefined);

                return (
                  <div
                    key={key}
                    className={`cell letter ${statusClass} ${isSelectedCell ? 'selected' : ''} ${solvedCell ? 'solved' : ''}`}
                  >
                    {crossword.startCellNumbers[key] !== undefined && (
                      <span className="cell-number">{crossword.startCellNumbers[key]}</span>
                    )}
                    <input
                      ref={(el) => {
                        inputRefs.current[key] = el;
                      }}
                      type="text"
                      inputMode="text"
                      maxLength={1}
                      value={inputValue}
                      aria-label={`Row ${rowIndex + 1} Column ${colIndex + 1}`}
                      onClick={() => selectWordFromCell(rowIndex, colIndex)}
                      onChange={(event) => handleCellInput(rowIndex, colIndex, event.target.value)}
                      onKeyDown={(event) => handleCellKeyDown(event, rowIndex, colIndex)}
                    />
                  </div>
                );
              })
            )}
          </div>
        </section>

        <aside className="clues-section" aria-label="Clues list">
          <div className="clues-group">
            <h2>Across</h2>
            <ul>
              {acrossWords.map((word) => {
                const solvedTeam = solvedBy[word.id];
                return (
                  <li
                    key={word.id}
                    className={selectedWordId === word.id ? 'active-clue' : ''}
                    onClick={() => setSelectedWordId(word.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        setSelectedWordId(word.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <strong>{word.number}</strong> {word.clue} ({word.answer.length})
                    <span className="meta">[{word.level}] {word.score} pts {solvedTeam ? `| Team ${solvedTeam}` : ''}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="clues-group">
            <h2>Down</h2>
            <ul>
              {downWords.map((word) => {
                const solvedTeam = solvedBy[word.id];
                return (
                  <li
                    key={word.id}
                    className={selectedWordId === word.id ? 'active-clue' : ''}
                    onClick={() => setSelectedWordId(word.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        setSelectedWordId(word.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <strong>{word.number}</strong> {word.clue} ({word.answer.length})
                    <span className="meta">[{word.level}] {word.score} pts {solvedTeam ? `| Team ${solvedTeam}` : ''}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </main>

      {allSolved && (
        <div className="completion-overlay" role="dialog" aria-modal="true" aria-label="Crossword completed">
          <div className="completion-card">
            <h2>Crossword Completed!</h2>
            <p>Every clue is solved. Hawkins is safe... for now.</p>
            <p>Final score: Team A {scores.A} - Team B {scores.B}</p>
          </div>
          <div className="confetti-field" aria-hidden="true">
            {Array.from({ length: 48 }, (_, i) => (
              <span key={`spark-${i}`} style={{ left: `${(i * 13) % 100}%`, animationDelay: `${(i % 8) * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
