export interface CategorizationResult {
  categoryPath: string;
  confidence: number;
}

const rules: { keywords: string[]; path: string }[] = [
  { keywords: ["kick", "bass"], path: "drums/kick/" },
  { keywords: ["snare"], path: "drums/snare/" },
  { keywords: ["hihat", "hat"], path: "drums/cymbals/hi-hats/" },
  { keywords: ["crash"], path: "drums/cymbals/crash/" },
  { keywords: ["tom"], path: "drums/toms/" },
  { keywords: ["cymbal"], path: "drums/cymbals/" },
];

export function categorizeSample(fileName: string): CategorizationResult {
  const lower = fileName.toLowerCase();
  for (const { keywords, path } of rules) {
    for (const key of keywords) {
      if (lower.includes(key)) {
        return { categoryPath: path, confidence: 0.9 };
      }
    }
  }
  return { categoryPath: "drums/other/", confidence: 0.5 };
}
