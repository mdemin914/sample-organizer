import { matchAudioFiles } from '../fileMatcher';
import { AudioFile, DirectoryStructure } from '../../types';

describe('fileMatcher', () => {
  // Mock audio files
  const mockAudioFiles: AudioFile[] = [
    {
      name: 'Kick_Drum_C_128BPM.wav',
      path: '/input/Kick_Drum_C_128BPM.wav',
      size: 1024000,
      extension: '.wav'
    },
    {
      name: 'Snare_Trap_Dry.wav',
      path: '/input/Snare_Trap_Dry.wav',
      size: 512000,
      extension: '.wav'
    },
    {
      name: 'Hi_Hat_Closed.wav',
      path: '/input/Hi_Hat_Closed.wav',
      size: 256000,
      extension: '.wav'
    },
    {
      name: 'Lead_Synth_Am.wav',
      path: '/input/Lead_Synth_Am.wav',
      size: 2048000,
      extension: '.wav'
    },
    {
      name: 'Bass_808_Sub.wav',
      path: '/input/Bass_808_Sub.wav',
      size: 1536000,
      extension: '.wav'
    },
    {
      name: 'Crash_Cymbal_140BPM.wav',
      path: '/input/Crash_Cymbal_140BPM.wav',
      size: 768000,
      extension: '.wav'
    },
    {
      name: 'Unknown_Sample_001.wav',
      path: '/input/Unknown_Sample_001.wav',
      size: 128000,
      extension: '.wav'
    }
  ];

  // Mock directory structure
  const mockDirectoryStructure: DirectoryStructure = {
    name: 'Sample Library',
    path: '/output/Sample Library',
    type: 'directory',
    children: [
      {
        name: 'Drums',
        path: '/output/Sample Library/Drums',
        type: 'directory',
        children: [
          {
            name: 'Kicks',
            path: '/output/Sample Library/Drums/Kicks',
            type: 'directory',
            children: []
          },
          {
            name: 'Snares',
            path: '/output/Sample Library/Drums/Snares',
            type: 'directory',
            children: []
          },
          {
            name: 'Hi-Hats',
            path: '/output/Sample Library/Drums/Hi-Hats',
            type: 'directory',
            children: [
              {
                name: 'Closed',
                path: '/output/Sample Library/Drums/Hi-Hats/Closed',
                type: 'directory',
                children: []
              },
              {
                name: 'Open',
                path: '/output/Sample Library/Drums/Hi-Hats/Open',
                type: 'directory',
                children: []
              }
            ]
          },
          {
            name: 'Cymbals',
            path: '/output/Sample Library/Drums/Cymbals',
            type: 'directory',
            children: [
              {
                name: 'Crash',
                path: '/output/Sample Library/Drums/Cymbals/Crash',
                type: 'directory',
                children: []
              },
              {
                name: 'Ride',
                path: '/output/Sample Library/Drums/Cymbals/Ride',
                type: 'directory',
                children: []
              }
            ]
          }
        ]
      },
      {
        name: 'Bass',
        path: '/output/Sample Library/Bass',
        type: 'directory',
        children: [
          {
            name: '808s',
            path: '/output/Sample Library/Bass/808s',
            type: 'directory',
            children: []
          },
          {
            name: 'Sub Bass',
            path: '/output/Sample Library/Bass/Sub Bass',
            type: 'directory',
            children: []
          }
        ]
      },
      {
        name: 'Leads',
        path: '/output/Sample Library/Leads',
        type: 'directory',
        children: [
          {
            name: 'Synth Leads',
            path: '/output/Sample Library/Leads/Synth Leads',
            type: 'directory',
            children: []
          }
        ]
      },
      {
        name: 'Misc',
        path: '/output/Sample Library/Misc',
        type: 'directory',
        children: []
      }
    ]
  };

  describe('matchAudioFiles', () => {
    it('should match kick drum to kicks folder', async () => {
      const results = await matchAudioFiles([mockAudioFiles[0]], mockDirectoryStructure);
      
      expect(results).toHaveLength(1);
      expect(results[0].file.name).toBe('Kick_Drum_C_128BPM.wav');
      expect(results[0].matched).toBe(true);
      expect(results[0].confidence).toBeGreaterThan(0.8);
      expect(results[0].destinationFolder).toContain('Kicks');
      expect(results[0].destinationPath).toContain('Kicks/Kick_Drum_C_128BPM.wav');
    });

    it('should match snare to snares folder', async () => {
      const results = await matchAudioFiles([mockAudioFiles[1]], mockDirectoryStructure);
      
      expect(results).toHaveLength(1);
      expect(results[0].file.name).toBe('Snare_Trap_Dry.wav');
      expect(results[0].matched).toBe(true);
      expect(results[0].confidence).toBeGreaterThan(0.8);
      expect(results[0].destinationFolder).toContain('Snares');
    });

    it('should match hi-hat to closed hi-hats folder', async () => {
      const results = await matchAudioFiles([mockAudioFiles[2]], mockDirectoryStructure);
      
      expect(results).toHaveLength(1);
      expect(results[0].file.name).toBe('Hi_Hat_Closed.wav');
      expect(results[0].matched).toBe(true);
      expect(results[0].confidence).toBeGreaterThan(0.8);
      expect(results[0].destinationFolder).toContain('Closed');
    });

    it('should match synth lead to synth leads folder', async () => {
      const results = await matchAudioFiles([mockAudioFiles[3]], mockDirectoryStructure);
      
      expect(results).toHaveLength(1);
      expect(results[0].file.name).toBe('Lead_Synth_Am.wav');
      expect(results[0].matched).toBe(true);
      expect(results[0].confidence).toBeGreaterThan(0.8);
      expect(results[0].destinationFolder).toContain('Synth Leads');
    });

    it('should match 808 bass to 808s folder', async () => {
      const results = await matchAudioFiles([mockAudioFiles[4]], mockDirectoryStructure);
      
      expect(results).toHaveLength(1);
      expect(results[0].file.name).toBe('Bass_808_Sub.wav');
      expect(results[0].matched).toBe(true);
      expect(results[0].confidence).toBeGreaterThan(0.8);
      expect(results[0].destinationFolder).toContain('808s');
    });

    it('should match crash cymbal to crash folder', async () => {
      const results = await matchAudioFiles([mockAudioFiles[5]], mockDirectoryStructure);
      
      expect(results).toHaveLength(1);
      expect(results[0].file.name).toBe('Crash_Cymbal_140BPM.wav');
      expect(results[0].matched).toBe(true);
      expect(results[0].confidence).toBeGreaterThan(0.8);
      expect(results[0].destinationFolder).toContain('Crash');
    });

    it('should handle unknown samples with low confidence', async () => {
      const results = await matchAudioFiles([mockAudioFiles[6]], mockDirectoryStructure);
      
      expect(results).toHaveLength(1);
      expect(results[0].file.name).toBe('Unknown_Sample_001.wav');
      expect(results[0].confidence).toBeLessThan(0.5);
      expect(results[0].matched).toBe(false);
    });

    it('should process multiple files correctly', async () => {
      const testFiles = [mockAudioFiles[0], mockAudioFiles[1], mockAudioFiles[6]];
      const results = await matchAudioFiles(testFiles, mockDirectoryStructure);
      
      expect(results).toHaveLength(3);
      
      // Kick should match
      expect(results[0].matched).toBe(true);
      expect(results[0].confidence).toBeGreaterThan(0.8);
      
      // Snare should match
      expect(results[1].matched).toBe(true);
      expect(results[1].confidence).toBeGreaterThan(0.8);
      
      // Unknown should not match
      expect(results[2].matched).toBe(false);
      expect(results[2].confidence).toBeLessThan(0.5);
    });

    it('should handle BPM matching', async () => {
      const bpmFile: AudioFile = {
        name: 'Kick_128BPM.wav',
        path: '/input/Kick_128BPM.wav',
        size: 1024000,
        extension: '.wav'
      };

      const bpmStructure: DirectoryStructure = {
        name: 'Library',
        path: '/output/Library',
        type: 'directory',
        children: [
          {
            name: 'Kicks_128BPM',
            path: '/output/Library/Kicks_128BPM',
            type: 'directory',
            children: []
          },
          {
            name: 'Kicks_140BPM',
            path: '/output/Library/Kicks_140BPM',
            type: 'directory',
            children: []
          }
        ]
      };

      const results = await matchAudioFiles([bpmFile], bpmStructure);
      
      expect(results).toHaveLength(1);
      expect(results[0].matched).toBe(true);
      expect(results[0].destinationFolder).toContain('Kicks_128BPM');
      expect(results[0].reasons).toContain('BPM match: 128 BPM');
    });

    it('should handle musical key matching', async () => {
      const keyFile: AudioFile = {
        name: 'Lead_Am.wav',
        path: '/input/Lead_Am.wav',
        size: 1024000,
        extension: '.wav'
      };

      const keyStructure: DirectoryStructure = {
        name: 'Library',
        path: '/output/Library',
        type: 'directory',
        children: [
          {
            name: 'Leads_Am',
            path: '/output/Library/Leads_Am',
            type: 'directory',
            children: []
          },
          {
            name: 'Leads_Cm',
            path: '/output/Library/Leads_Cm',
            type: 'directory',
            children: []
          }
        ]
      };

      const results = await matchAudioFiles([keyFile], keyStructure);
      
      expect(results).toHaveLength(1);
      expect(results[0].matched).toBe(true);
      expect(results[0].destinationFolder).toContain('Leads_Am');
      expect(results[0].reasons).toContain('Musical key match: am');
    });

    it('should handle empty directory structure', async () => {
      const emptyStructure: DirectoryStructure = {
        name: 'Empty',
        path: '/output/Empty',
        type: 'directory',
        children: []
      };

      const results = await matchAudioFiles([mockAudioFiles[0]], emptyStructure);
      
      expect(results).toHaveLength(1);
      expect(results[0].matched).toBe(false);
      expect(results[0].confidence).toBe(0);
    });

    it('should handle empty file list', async () => {
      const results = await matchAudioFiles([], mockDirectoryStructure);
      
      expect(results).toHaveLength(0);
    });
  });

  describe('confidence scoring', () => {
    it('should assign high confidence for exact matches', async () => {
      const exactFile: AudioFile = {
        name: 'kick.wav',
        path: '/input/kick.wav',
        size: 1024000,
        extension: '.wav'
      };

      const results = await matchAudioFiles([exactFile], mockDirectoryStructure);
      
      expect(results[0].confidence).toBeGreaterThan(0.9);
    });

    it('should assign medium confidence for partial matches', async () => {
      const partialFile: AudioFile = {
        name: 'drum_sample.wav',
        path: '/input/drum_sample.wav',
        size: 1024000,
        extension: '.wav'
      };

      const results = await matchAudioFiles([partialFile], mockDirectoryStructure);
      
      expect(results[0].confidence).toBeGreaterThan(0.3);
      expect(results[0].confidence).toBeLessThan(0.8);
    });

    it('should assign low confidence for weak matches', async () => {
      const weakFile: AudioFile = {
        name: 'audio.wav',
        path: '/input/audio.wav',
        size: 1024000,
        extension: '.wav'
      };

      const results = await matchAudioFiles([weakFile], mockDirectoryStructure);
      
      expect(results[0].confidence).toBeLessThan(0.3);
    });
  });

  describe('edge cases', () => {
    it('should handle files with special characters', async () => {
      const specialFile: AudioFile = {
        name: 'Kick-Drum_001_(C).wav',
        path: '/input/Kick-Drum_001_(C).wav',
        size: 1024000,
        extension: '.wav'
      };

      const results = await matchAudioFiles([specialFile], mockDirectoryStructure);
      
      expect(results).toHaveLength(1);
      expect(results[0].matched).toBe(true);
      expect(results[0].destinationFolder).toContain('Kicks');
    });

    it('should handle case insensitive matching', async () => {
      const caseFile: AudioFile = {
        name: 'KICK_DRUM.WAV',
        path: '/input/KICK_DRUM.WAV',
        size: 1024000,
        extension: '.wav'
      };

      const results = await matchAudioFiles([caseFile], mockDirectoryStructure);
      
      expect(results).toHaveLength(1);
      expect(results[0].matched).toBe(true);
      expect(results[0].destinationFolder).toContain('Kicks');
    });

    it('should handle very long file names', async () => {
      const longFile: AudioFile = {
        name: 'Very_Long_Kick_Drum_Sample_With_Many_Words_And_Details_C_Major_128_BPM_Processed_With_EQ_And_Compression.wav',
        path: '/input/Very_Long_Kick_Drum_Sample_With_Many_Words_And_Details_C_Major_128_BPM_Processed_With_EQ_And_Compression.wav',
        size: 1024000,
        extension: '.wav'
      };

      const results = await matchAudioFiles([longFile], mockDirectoryStructure);
      
      expect(results).toHaveLength(1);
      expect(results[0].matched).toBe(true);
      expect(results[0].destinationFolder).toContain('Kicks');
    });
  });
});