"""
Sample Analyzer - Audio analysis and categorization logic
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import numpy as np
import librosa
import soundfile as sf
from sklearn.preprocessing import StandardScaler


class SampleAnalyzer:
    """Analyzes audio samples and suggests categories based on content and metadata."""
    
    # Common sample categories and their keywords
    CATEGORY_KEYWORDS = {
        'drums': {
            'kick': ['kick', 'bd', 'bass drum', 'bassdrum', 'kik'],
            'snare': ['snare', 'sn', 'snr', 'clap', 'cp'],
            'hihat': ['hihat', 'hh', 'hat', 'closed hat', 'open hat', 'ch', 'oh'],
            'cymbal': ['cymbal', 'crash', 'ride', 'splash', 'china'],
            'tom': ['tom', 'high tom', 'mid tom', 'low tom', 'floor tom'],
            'percussion': ['perc', 'percussion', 'shaker', 'tamb', 'conga', 'bongo']
        },
        'melodic': {
            'bass': ['bass', 'sub', 'low', '808'],
            'lead': ['lead', 'synth', 'melody', 'arp'],
            'pad': ['pad', 'atmosphere', 'ambient', 'texture'],
            'chord': ['chord', 'stab', 'chrd'],
            'piano': ['piano', 'keys', 'rhodes', 'wurli'],
            'guitar': ['guitar', 'gtr', 'acoustic', 'electric'],
            'strings': ['strings', 'violin', 'cello', 'orchestra']
        },
        'vocals': {
            'vocal': ['vocal', 'vox', 'voice', 'acapella'],
            'chop': ['chop', 'cut', 'slice'],
            'fx': ['fx', 'effect', 'processed']
        },
        'fx': {
            'riser': ['riser', 'rise', 'buildup', 'sweep up'],
            'impact': ['impact', 'hit', 'slam', 'punch'],
            'transition': ['transition', 'woosh', 'swoosh', 'sweep'],
            'noise': ['noise', 'white', 'pink', 'texture']
        }
    }
    
    def __init__(self):
        self.scaler = StandardScaler()
        
    def analyze_sample(self, file_path: Path) -> Dict:
        """
        Analyze a single audio sample and return its characteristics.
        
        Args:
            file_path: Path to the audio file
            
        Returns:
            Dictionary containing analysis results
        """
        result = {
            'file_path': str(file_path),
            'filename': file_path.name,
            'category_suggestion': None,
            'subcategory_suggestion': None,
            'confidence': 0.0,
            'audio_features': {},
            'error': None
        }
        
        try:
            # Extract features from filename
            filename_category, filename_subcategory = self._analyze_filename(file_path.name)
            
            # Load and analyze audio
            audio_features = self._extract_audio_features(file_path)
            result['audio_features'] = audio_features
            
            # Combine filename and audio analysis
            category, subcategory, confidence = self._determine_category(
                filename_category, filename_subcategory, audio_features
            )
            
            result['category_suggestion'] = category
            result['subcategory_suggestion'] = subcategory
            result['confidence'] = confidence
            
        except Exception as e:
            result['error'] = str(e)
            
        return result
    
    def _analyze_filename(self, filename: str) -> Tuple[Optional[str], Optional[str]]:
        """Extract category hints from filename."""
        filename_lower = filename.lower()
        
        for category, subcategories in self.CATEGORY_KEYWORDS.items():
            for subcategory, keywords in subcategories.items():
                for keyword in keywords:
                    if keyword in filename_lower:
                        return category, subcategory
                        
        return None, None
    
    def _extract_audio_features(self, file_path: Path) -> Dict:
        """Extract audio features for categorization."""
        try:
            # Load audio
            y, sr = librosa.load(str(file_path), sr=None, mono=True)
            
            # Basic features
            duration = len(y) / sr
            
            # Spectral features
            spectral_centroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))
            spectral_rolloff = np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr))
            zero_crossing_rate = np.mean(librosa.feature.zero_crossing_rate(y))
            
            # Rhythm features
            tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
            
            # Energy features
            rms = np.mean(librosa.feature.rms(y=y))
            
            # MFCC for timbre
            mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            mfcc_mean = np.mean(mfccs, axis=1)
            
            # Onset detection for percussive content
            onset_envelope = librosa.onset.onset_strength(y=y, sr=sr)
            onset_rate = len(librosa.onset.onset_detect(y=y, sr=sr)) / duration
            
            return {
                'duration': duration,
                'spectral_centroid': spectral_centroid,
                'spectral_rolloff': spectral_rolloff,
                'zero_crossing_rate': zero_crossing_rate,
                'tempo': tempo,
                'rms': rms,
                'mfcc_mean': mfcc_mean.tolist(),
                'onset_rate': onset_rate,
                'is_percussive': onset_rate > 10  # High onset rate indicates drums/percussion
            }
            
        except Exception as e:
            print(f"Error extracting features from {file_path}: {e}")
            return {}
    
    def _determine_category(self, filename_category: Optional[str], 
                          filename_subcategory: Optional[str],
                          audio_features: Dict) -> Tuple[Optional[str], Optional[str], float]:
        """
        Determine the most likely category based on filename and audio analysis.
        
        Returns:
            Tuple of (category, subcategory, confidence)
        """
        confidence = 0.0
        
        # If we have a strong filename match, use it with high confidence
        if filename_category and filename_subcategory:
            confidence = 0.8
            
            # Adjust confidence based on audio features
            if audio_features:
                if filename_category == 'drums' and audio_features.get('is_percussive', False):
                    confidence = 0.95
                elif filename_category == 'melodic' and not audio_features.get('is_percussive', False):
                    confidence = 0.9
                    
            return filename_category, filename_subcategory, confidence
        
        # Otherwise, try to determine from audio features
        if audio_features:
            if audio_features.get('is_percussive', False):
                # Likely a drum sample
                category = 'drums'
                
                # Try to determine drum type based on spectral features
                if audio_features.get('spectral_centroid', 0) < 200:
                    subcategory = 'kick'
                    confidence = 0.6
                elif audio_features.get('spectral_centroid', 0) > 5000:
                    subcategory = 'hihat'
                    confidence = 0.6
                else:
                    subcategory = 'snare'
                    confidence = 0.5
                    
                return category, subcategory, confidence
            else:
                # Likely a melodic sample
                return 'melodic', None, 0.3
        
        return None, None, 0.0
    
    def scan_directory(self, directory: Path) -> List[Dict]:
        """Scan a directory and analyze all audio samples."""
        results = []
        audio_extensions = {'.wav', '.mp3', '.aif', '.aiff', '.flac', '.ogg', '.m4a'}
        
        for file_path in directory.rglob('*'):
            if file_path.is_file() and file_path.suffix.lower() in audio_extensions:
                result = self.analyze_sample(file_path)
                results.append(result)
                
        return results