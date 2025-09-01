import { AudioFile, DirectoryStructure, MatchResult } from '../types';
import * as path from 'path';

// Common musical instrument and sample type keywords
const SAMPLE_KEYWORDS = {
  // Drums
  kick: ['kick', 'bd', 'bassdrum', 'bass_drum', 'kick_drum'],
  snare: ['snare', 'sd', 'snr', 'snare_drum'],
  hihat: ['hihat', 'hh', 'hi_hat', 'hi-hat', 'hat', 'hats', 'closed_hat', 'open_hat'],
  crash: ['crash', 'cr', 'crash_cymbal'],
  ride: ['ride', 'rd', 'ride_cymbal'],
  tom: ['tom', 'tt', 'ft', 'floor_tom', 'rack_tom', 'high_tom', 'mid_tom', 'low_tom'],
  cymbal: ['cymbal', 'cym', 'crash', 'ride', 'china', 'splash'],
  percussion: ['perc', 'percussion', 'shaker', 'tambourine', 'cowbell', 'conga', 'bongo'],
  
  // Bass
  bass: ['bass', 'bs', 'sub', 'subbass', 'sub_bass', '808'],
  
  // Leads and Synths
  lead: ['lead', 'ld', 'melody', 'main', 'solo'],
  synth: ['synth', 'syn', 'synthesizer', 'analog', 'digital'],
  pad: ['pad', 'string', 'strings', 'atmosphere', 'ambient'],
  pluck: ['pluck', 'plk', 'pizzicato', 'stab'],
  
  // Chord and Harmony
  chord: ['chord', 'chd', 'harmony', 'progression'],
  arp: ['arp', 'arpeggiate', 'arpeggio'],
  
  // FX
  fx: ['fx', 'effect', 'sfx', 'sound_effect', 'impact', 'sweep', 'whoosh', 'riser', 'drop'],
  vocal: ['vocal', 'vox', 'voice', 'chop', 'vocal_chop'],
  
  // Genres and Styles
  trap: ['trap', 'hip_hop', 'hiphop'],
  house: ['house', 'tech_house', 'deep_house'],
  techno: ['techno', 'tech'],
  dubstep: ['dubstep', 'dub', 'wobble'],
  dnb: ['dnb', 'drum_and_bass', 'jungle'],
  
  // Characteristics
  one_shot: ['one_shot', 'oneshot', 'hit'],
  loop: ['loop', 'lp', 'cycle'],
  wet: ['wet', 'reverb', 'delay', 'echo'],
  dry: ['dry', 'clean'],
};

// Musical keys and scales
const MUSICAL_KEYS = [
  'c', 'c#', 'db', 'd', 'd#', 'eb', 'e', 'f', 'f#', 'gb', 'g', 'g#', 'ab', 'a', 'a#', 'bb', 'b',
  'cm', 'c#m', 'dm', 'd#m', 'em', 'fm', 'f#m', 'gm', 'g#m', 'am', 'a#m', 'bm'
];

// BPM patterns
const BPM_PATTERN = /(\d{2,3})\s?bpm/i;
const KEY_PATTERN = new RegExp(`\\b(${MUSICAL_KEYS.join('|')})\\b`, 'i');

export async function matchAudioFiles(
  audioFiles: AudioFile[],
  outputStructure: DirectoryStructure
): Promise<MatchResult[]> {
  const results: MatchResult[] = [];
  const folderPaths = getAllFolderPaths(outputStructure);
  
  for (const file of audioFiles) {
    const match = findBestMatch(file, folderPaths);
    results.push(match);
  }
  
  return results;
}

function getAllFolderPaths(structure: DirectoryStructure): Array<{path: string, name: string, keywords: string[]}> {
  const folders: Array<{path: string, name: string, keywords: string[]}> = [];
  
  function traverse(node: DirectoryStructure, pathParts: string[] = []) {
    if (node.type === 'directory') {
      const currentPath = [...pathParts, node.name];
      const keywords = extractKeywords(currentPath.join(' '));
      
      folders.push({
        path: node.path,
        name: currentPath.join(' → '),
        keywords: keywords
      });
      
      for (const child of node.children) {
        traverse(child, currentPath);
      }
    }
  }
  
  traverse(structure);
  return folders;
}

function extractKeywords(text: string): string[] {
  const normalizedText = text.toLowerCase().replace(/[_-]/g, ' ');
  const keywords: string[] = [];
  
  // Extract all keywords from the text
  Object.entries(SAMPLE_KEYWORDS).forEach(([category, terms]) => {
    terms.forEach(term => {
      if (normalizedText.includes(term)) {
        keywords.push(category);
        keywords.push(term);
      }
    });
  });
  
  // Add the original words as keywords too
  const words = normalizedText.split(/\s+/).filter(word => word.length > 2);
  keywords.push(...words);
  
  return [...new Set(keywords)]; // Remove duplicates
}

function findBestMatch(file: AudioFile, folders: Array<{path: string, name: string, keywords: string[]}>): MatchResult {
  const fileName = path.parse(file.name).name.toLowerCase();
  const fileKeywords = extractKeywords(fileName);
  
  let bestMatch: {path: string, name: string, keywords: string[]} | null = null;
  let bestScore = 0;
  let matchReasons: string[] = [];
  
  for (const folder of folders) {
    const score = calculateMatchScore(fileKeywords, folder.keywords, fileName, folder.name.toLowerCase());
    
    if (score.total > bestScore) {
      bestScore = score.total;
      bestMatch = folder;
      matchReasons = score.reasons;
    }
  }
  
  const confidence = Math.min(bestScore / 10, 1); // Normalize to 0-1 range
  const matched = confidence >= 0.5; // Require at least 50% confidence for auto-match
  
  return {
    file,
    matched,
    destinationPath: bestMatch ? path.join(bestMatch.path, file.name) : undefined,
    destinationFolder: bestMatch?.name,
    confidence,
    reasons: matchReasons.length > 0 ? matchReasons : ['No strong matches found'],
  };
}

function calculateMatchScore(
  fileKeywords: string[],
  folderKeywords: string[],
  fileName: string,
  folderName: string
): {total: number, reasons: string[]} {
  let score = 0;
  const reasons: string[] = [];
  
  // Direct keyword matches (high weight)
  const keywordMatches = fileKeywords.filter(fk => folderKeywords.includes(fk));
  score += keywordMatches.length * 3;
  if (keywordMatches.length > 0) {
    reasons.push(`Keyword matches: ${keywordMatches.join(', ')}`);
  }
  
  // Partial string matches
  const fileWords = fileName.split(/[_\-\s]+/).filter(w => w.length > 2);
  const folderWords = folderName.split(/[_\-\s→]+/).filter(w => w.length > 2);
  
  for (const fileWord of fileWords) {
    for (const folderWord of folderWords) {
      if (fileWord.includes(folderWord) || folderWord.includes(fileWord)) {
        score += 2;
        reasons.push(`Partial match: "${fileWord}" ↔ "${folderWord}"`);
      }
    }
  }
  
  // Exact word matches
  const exactMatches = fileWords.filter(fw => folderWords.includes(fw));
  score += exactMatches.length * 4;
  if (exactMatches.length > 0) {
    reasons.push(`Exact word matches: ${exactMatches.join(', ')}`);
  }
  
  // Musical key detection
  const fileKey = fileName.match(KEY_PATTERN);
  const folderKey = folderName.match(KEY_PATTERN);
  if (fileKey && folderKey && fileKey[0].toLowerCase() === folderKey[0].toLowerCase()) {
    score += 2;
    reasons.push(`Musical key match: ${fileKey[0]}`);
  }
  
  // BPM detection
  const fileBpm = fileName.match(BPM_PATTERN);
  const folderBpm = folderName.match(BPM_PATTERN);
  if (fileBpm && folderBpm && fileBpm[1] === folderBpm[1]) {
    score += 2;
    reasons.push(`BPM match: ${fileBpm[1]} BPM`);
  }
  
  // Category-specific bonuses
  const drumKeywords = ['kick', 'snare', 'hihat', 'crash', 'ride', 'tom', 'cymbal'];
  const fileHasDrums = fileKeywords.some(k => drumKeywords.includes(k));
  const folderHasDrums = folderKeywords.some(k => drumKeywords.includes(k));
  if (fileHasDrums && folderHasDrums) {
    score += 1;
    reasons.push('Both contain drum-related keywords');
  }
  
  // Penalize very generic matches
  if (folderKeywords.length > 0 && keywordMatches.length / folderKeywords.length < 0.3) {
    score *= 0.8; // Reduce score for weak matches
  }
  
  return { total: score, reasons };
}