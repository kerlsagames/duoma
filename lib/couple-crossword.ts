export type CrosswordDir = "across" | "down";

export type CrosswordEntry = {
  id: string;
  num: number;
  row: number;
  col: number;
  dir: CrosswordDir;
  answer: string;
  clue: string;
};

export type CrosswordPuzzle = {
  id: string;
  title: string;
  size: number;
  entries: CrosswordEntry[];
};

export const CROSSWORD_PUZZLES: CrosswordPuzzle[] = [
  {
    id: "us-mini",
    title: "The two of us",
    size: 5,
    entries: [
      {
        id: "1a",
        num: 1,
        row: 0,
        col: 0,
        dir: "across",
        answer: "HEART",
        clue: "What we keep handing each other",
      },
      {
        id: "1d",
        num: 1,
        row: 0,
        col: 0,
        dir: "down",
        answer: "HOME",
        clue: "Where the snacks secretly live",
      },
      {
        id: "2d",
        num: 2,
        row: 0,
        col: 2,
        dir: "down",
        answer: "ATE",
        clue: "What we did at the too-expensive place",
      },
      {
        id: "3d",
        num: 3,
        row: 0,
        col: 4,
        dir: "down",
        answer: "TWO",
        clue: "Toothbrushes. Always.",
      },
    ],
  },
  {
    id: "night-in",
    title: "Night in",
    size: 5,
    entries: [
      {
        id: "1a",
        num: 1,
        row: 0,
        col: 0,
        dir: "across",
        answer: "KISS",
        clue: "The thing we do instead of pausing the show",
      },
      {
        id: "1d",
        num: 1,
        row: 0,
        col: 0,
        dir: "down",
        answer: "KIND",
        clue: "The only fight-ending tone that works",
      },
      {
        id: "3a",
        num: 3,
        row: 2,
        col: 0,
        dir: "across",
        answer: "NEST",
        clue: "Couch + blankets + nobody else's business",
      },
      {
        id: "2d",
        num: 2,
        row: 0,
        col: 2,
        dir: "down",
        answer: "SOS",
        clue: "Our private 'save me from this conversation' ping",
      },
    ],
  },
  {
    id: "getaway",
    title: "Getaway",
    size: 6,
    entries: [
      {
        id: "1a",
        num: 1,
        row: 0,
        col: 0,
        dir: "across",
        answer: "COUPLE",
        clue: "Legal status optional; this is the vibe",
      },
      {
        id: "1d",
        num: 1,
        row: 0,
        col: 0,
        dir: "down",
        answer: "CABIN",
        clue: "No signal. One good knife. You, obviously.",
      },
      {
        id: "3d",
        num: 3,
        row: 0,
        col: 5,
        dir: "down",
        answer: "ELOPE",
        clue: "The nuclear option if the guest list gets loud",
      },
      {
        id: "4a",
        num: 4,
        row: 4,
        col: 0,
        dir: "across",
        answer: "NEEDLE",
        clue: "Haystack's other half — also what we hunt for in a fight",
      },
    ],
  },
];

export function crosswordKey(row: number, col: number): string {
  return `${row}-${col}`;
}

export function puzzleCells(puzzle: CrosswordPuzzle): Set<string> {
  const cells = new Set<string>();
  for (const entry of puzzle.entries) {
    for (let i = 0; i < entry.answer.length; i += 1) {
      const r = entry.dir === "down" ? entry.row + i : entry.row;
      const c = entry.dir === "across" ? entry.col + i : entry.col;
      cells.add(crosswordKey(r, c));
    }
  }
  return cells;
}

export function cellNumber(
  puzzle: CrosswordPuzzle,
  row: number,
  col: number
): number | null {
  const hit = puzzle.entries.find((entry) => entry.row === row && entry.col === col);
  return hit?.num ?? null;
}

export function letterAt(
  puzzle: CrosswordPuzzle,
  row: number,
  col: number
): string | null {
  for (const entry of puzzle.entries) {
    for (let i = 0; i < entry.answer.length; i += 1) {
      const r = entry.dir === "down" ? entry.row + i : entry.row;
      const c = entry.dir === "across" ? entry.col + i : entry.col;
      if (r === row && c === col) return entry.answer[i] ?? null;
    }
  }
  return null;
}

export function isPuzzleComplete(
  puzzle: CrosswordPuzzle,
  letters: Record<string, string>
): boolean {
  const cells = puzzleCells(puzzle);
  for (const key of cells) {
    const [r, c] = key.split("-").map(Number);
    const want = letterAt(puzzle, r, c);
    if (!want || (letters[key] ?? "").toUpperCase() !== want) return false;
  }
  return true;
}
