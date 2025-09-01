"""
Sample Organizer - Core logic for organizing samples into directories
"""

import shutil
from pathlib import Path
from typing import List, Dict, Optional, Callable
import os

from core.directory_scanner import DirectoryNode
from core.sample_analyzer import SampleAnalyzer


class SampleOrganizer:
    """Handles the organization of samples into the target directory structure."""
    
    def __init__(self, analyzer: SampleAnalyzer):
        self.analyzer = analyzer
        
    def organize_samples(self, 
                        analysis_results: List[Dict],
                        output_root: Path,
                        directory_structure: DirectoryNode,
                        copy_files: bool = True,
                        progress_callback: Optional[Callable[[float, str], None]] = None) -> Dict:
        """
        Organize samples based on analysis results.
        
        Args:
            analysis_results: List of analysis results from SampleAnalyzer
            output_root: Root output directory
            directory_structure: Directory structure to organize into
            copy_files: If True, copy files. If False, move files.
            progress_callback: Callback for progress updates (progress, status)
            
        Returns:
            Dictionary with organization statistics
        """
        results = {
            'total': len(analysis_results),
            'success': 0,
            'failed': 0,
            'skipped': 0,
            'errors': []
        }
        
        for i, result in enumerate(analysis_results):
            try:
                # Update progress
                if progress_callback:
                    progress = (i + 1) / len(analysis_results)
                    status = f"Processing {Path(result['file_path']).name}"
                    progress_callback(progress, status)
                
                # Skip if no category suggestion and no manual mapping
                if not result.get('category_suggestion') and not result.get('target_directory'):
                    results['skipped'] += 1
                    continue
                
                # Determine target directory
                target_dir = self._determine_target_directory(
                    result, output_root, directory_structure
                )
                
                if not target_dir:
                    results['skipped'] += 1
                    continue
                
                # Ensure target directory exists
                target_dir.mkdir(parents=True, exist_ok=True)
                
                # Copy or move file
                source_path = Path(result['file_path'])
                target_path = target_dir / source_path.name
                
                # Handle filename conflicts
                target_path = self._handle_filename_conflict(target_path)
                
                if copy_files:
                    shutil.copy2(str(source_path), str(target_path))
                else:
                    shutil.move(str(source_path), str(target_path))
                
                results['success'] += 1
                
            except Exception as e:
                results['failed'] += 1
                results['errors'].append({
                    'file': result['file_path'],
                    'error': str(e)
                })
                
        return results
    
    def _determine_target_directory(self, 
                                   result: Dict,
                                   output_root: Path,
                                   directory_structure: DirectoryNode) -> Optional[Path]:
        """Determine the target directory for a sample."""
        # First check if user manually specified a target
        if result.get('target_directory'):
            return Path(result['target_directory'])
        
        # Otherwise use automatic categorization
        category = result.get('category_suggestion')
        subcategory = result.get('subcategory_suggestion')
        
        if not category:
            return None
        
        # Try to find matching directory in existing structure
        target_keywords = []
        
        if subcategory:
            target_keywords.append(subcategory)
        target_keywords.append(category)
        
        # Search for matching directory
        matching_dir = directory_structure.find_matching_directory(target_keywords)
        
        if matching_dir:
            return matching_dir
        
        # If no match found, create new directory structure
        if category == 'drums':
            base_dir = output_root / 'Drums'
            if subcategory:
                return base_dir / self._format_directory_name(subcategory)
            return base_dir
            
        elif category == 'melodic':
            base_dir = output_root / 'Melodic'
            if subcategory:
                return base_dir / self._format_directory_name(subcategory)
            return base_dir
            
        elif category == 'vocals':
            return output_root / 'Vocals'
            
        elif category == 'fx':
            base_dir = output_root / 'FX'
            if subcategory:
                return base_dir / self._format_directory_name(subcategory)
            return base_dir
            
        else:
            return output_root / 'Uncategorized' / category
    
    def _format_directory_name(self, name: str) -> str:
        """Format a directory name to be consistent."""
        # Capitalize first letter of each word
        formatted = name.replace('_', ' ').title()
        
        # Special cases
        replacements = {
            'Hihat': 'HiHats',
            'Hi Hat': 'HiHats',
            'Fx': 'FX',
            'Sfx': 'SFX'
        }
        
        for old, new in replacements.items():
            if old in formatted:
                formatted = formatted.replace(old, new)
                
        return formatted
    
    def _handle_filename_conflict(self, target_path: Path) -> Path:
        """Handle filename conflicts by appending a number."""
        if not target_path.exists():
            return target_path
            
        # Find a unique filename
        base = target_path.stem
        extension = target_path.suffix
        counter = 1
        
        while True:
            new_path = target_path.parent / f"{base}_{counter}{extension}"
            if not new_path.exists():
                return new_path
            counter += 1
            
    def create_directory_structure(self, root_path: Path, structure: DirectoryNode):
        """Create a directory structure based on a DirectoryNode template."""
        def create_recursive(parent_path: Path, node: DirectoryNode):
            if node.is_directory:
                dir_path = parent_path / node.name
                dir_path.mkdir(parents=True, exist_ok=True)
                
                for child in node.children:
                    create_recursive(dir_path, child)
                    
        # Create the structure
        create_recursive(root_path.parent, structure)