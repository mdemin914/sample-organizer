export interface DirectoryStructure {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children: DirectoryStructure[];
}

export interface AudioFile {
  name: string;
  path: string;
  size: number;
  extension: string;
}

export interface MatchResult {
  file: AudioFile;
  matched: boolean;
  destinationPath?: string;
  destinationFolder?: string;
  confidence: number;
  reasons: string[];
}