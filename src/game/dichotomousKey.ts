import type { Organism } from "@/data/organisms";

export interface DichotomousNode {
  id: string;
  question: string;
  emoji?: string;
  // condition checks against organism.karakteristik / taxonomy
  test: (o: Organism) => boolean;
  yes: DichotomousNode | string; // string = leaf label (e.g. "Mamalia")
  no: DichotomousNode | string;
}

const has = (o: Organism, ...traits: string[]) =>
  traits.every((t) => o.karakteristik.some((k) => k.toLowerCase().includes(t.toLowerCase())));

export const rootKey: DichotomousNode = {
  id: "n1",
  emoji: "🦴",
  question: "Apakah memiliki tulang belakang (vertebrata)?",
  test: (o) => has(o, "bertulang belakang") && !has(o, "tidak bertulang"),
  yes: {
    id: "n2",
    emoji: "🫁",
    question: "Apakah bernapas dengan paru-paru?",
    test: (o) => has(o, "bernapas dengan paru-paru"),
    yes: {
      id: "n3",
      emoji: "🌡️",
      question: "Apakah berdarah panas (homeoterm)?",
      test: (o) => has(o, "berdarah panas"),
      yes: {
        id: "n4",
        emoji: "🐾",
        question: "Apakah memiliki rambut & menyusui?",
        test: (o) => has(o, "berambut") && has(o, "menyusui"),
        yes: "Mammalia (Mamalia)",
        no: "Aves (Burung)",
      },
      no: {
        id: "n5",
        emoji: "🦎",
        question: "Apakah tubuh tertutup sisik?",
        test: (o) => has(o, "bersisik"),
        yes: "Reptilia (Reptil)",
        no: "Amphibia (Amfibi)",
      },
    },
    no: "Pisces (Ikan)",
  },
  no: {
    id: "n6",
    emoji: "🪲",
    question: "Apakah tubuh beruas (Arthropoda)?",
    test: (o) => o.filum === "Arthropoda",
    yes: {
      id: "n7",
      emoji: "🦵",
      question: "Apakah memiliki 6 kaki?",
      test: (o) => has(o, "berkaki enam"),
      yes: "Insecta (Serangga)",
      no: "Arachnida (Laba-laba)",
    },
    no: {
      id: "n8",
      emoji: "🌱",
      question: "Apakah memiliki klorofil (autotrof)?",
      test: (o) => has(o, "berklorofil") || has(o, "autotrof"),
      yes: {
        id: "n9",
        emoji: "🌸",
        question: "Apakah berbunga & berbiji?",
        test: (o) => has(o, "berbunga"),
        yes: {
          id: "n10",
          emoji: "🌽",
          question: "Apakah berkeping biji satu (monokotil)?",
          test: (o) => has(o, "berbiji belah satu"),
          yes: "Monokotil",
          no: "Dikotil",
        },
        no: {
          id: "n11",
          emoji: "🌿",
          question: "Apakah memiliki pembuluh angkut?",
          test: (o) => has(o, "berpembuluh"),
          yes: "Pteridophyta (Paku)",
          no: "Bryophyta (Lumut)",
        },
      },
      no: "Fungi (Jamur)",
    },
  },
};

export interface Step {
  nodeId: string;
  question: string;
  chosen: "yes" | "no";
  correct: boolean;
}

export function classify(organism: Organism, root: DichotomousNode = rootKey): { steps: Step[]; result: string } {
  const steps: Step[] = [];
  let cursor: DichotomousNode | string = root;
  while (typeof cursor !== "string") {
    const truth = cursor.test(organism);
    steps.push({ nodeId: cursor.id, question: cursor.question, chosen: truth ? "yes" : "no", correct: true });
    cursor = truth ? cursor.yes : cursor.no;
  }
  return { steps, result: cursor };
}

// Suggest 3 common chip choices to present at each node beyond yes/no — for chip UI
export const ALL_CHIPS = [
  "Berambut", "Bersayap", "Bertelur", "Berkaki Empat", "Berkaki Enam", "Berkaki Delapan",
  "Bernapas Insang", "Bernapas Paru-paru", "Hidup di Darat", "Hidup di Air",
  "Berdarah Panas", "Berdarah Dingin", "Bersisik", "Berbulu", "Berklorofil",
  "Berbunga", "Berspora", "Menyusui", "Karnivora", "Herbivora", "Omnivora",
];
