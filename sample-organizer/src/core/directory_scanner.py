"""
Directory Scanner - Scans and analyzes directory structures
"""

import os
from pathlib import Path
from typing import Dict, List, Optional, Set
from dataclasses import dataclass, field


@dataclass
class DirectoryNode:
    """Represents a node in the directory tree."""
    name: str
    path: Path
    is_directory: bool
    children: List['DirectoryNode'] = field(default_factory=list)
    file_count: int = 0
    total_size: int = 0
    
    def to_dict(self) -> Dict:
        """Convert to dictionary representation."""
        return {
            'name': self.name,
            'path': str(self.path),
            'is_directory': self.is_directory,
            'children': [child.to_dict() for child in self.children],
            'file_count': self.file_count,
            'total_size': self.total_size
        }
    
    def get_all_directories(self) -> List[Path]:
        """Get all directory paths in this tree."""
        dirs = []
        if self.is_directory:
            dirs.append(self.path)
            for child in self.children:
                dirs.extend(child.get_all_directories())
        return dirs
    
    def find_matching_directory(self, keywords: List[str]) -> Optional[Path]:
        """Find a directory that matches any of the given keywords."""
        if self.is_directory:
            name_lower = self.name.lower()
            for keyword in keywords:
                if keyword.lower() in name_lower:
                    return self.path
            
            # Search children
            for child in self.children:
                match = child.find_matching_directory(keywords)
                if match:
                    return match
        return None


class DirectoryScanner:
    """Scans and analyzes directory structures for sample organization."""
    
    def __init__(self):
        self.audio_extensions = {'.wav', '.mp3', '.aif', '.aiff', '.flac', '.ogg', '.m4a'}
        
    def scan_directory(self, root_path: Path, max_depth: int = 10) -> DirectoryNode:
        """
        Scan a directory and build a tree structure.
        
        Args:
            root_path: The root directory to scan
            max_depth: Maximum depth to scan (prevent infinite recursion)
            
        Returns:
            DirectoryNode representing the directory tree
        """
        return self._scan_recursive(root_path, 0, max_depth)
    
    def _scan_recursive(self, path: Path, current_depth: int, max_depth: int) -> DirectoryNode:
        """Recursively scan directory structure."""
        node = DirectoryNode(
            name=path.name,
            path=path,
            is_directory=path.is_dir()
        )
        
        if path.is_dir() and current_depth < max_depth:
            try:
                for item in sorted(path.iterdir()):
                    if item.name.startswith('.'):
                        continue  # Skip hidden files
                        
                    child_node = self._scan_recursive(item, current_depth + 1, max_depth)
                    node.children.append(child_node)
                    
                    # Aggregate statistics
                    if child_node.is_directory:
                        node.file_count += child_node.file_count
                        node.total_size += child_node.total_size
                    else:
                        if item.suffix.lower() in self.audio_extensions:
                            node.file_count += 1
                            try:
                                node.total_size += item.stat().st_size
                            except:
                                pass
                                
            except PermissionError:
                pass  # Skip directories we can't access
                
        return node
    
    def find_sample_categories(self, root_node: DirectoryNode) -> Dict[str, List[Path]]:
        """
        Analyze the directory structure and identify sample categories.
        
        Returns:
            Dictionary mapping category names to directory paths
        """
        categories = {}
        
        # Common music production folder patterns
        category_patterns = {
            'drums': ['drums', 'drum', 'percussion', 'perc', 'beats'],
            'kicks': ['kick', 'kicks', 'bd', 'bass drum', 'bassdrum'],
            'snares': ['snare', 'snares', 'sn', 'clap', 'claps'],
            'hihats': ['hihat', 'hihats', 'hat', 'hats', 'hh', 'closed hat', 'open hat'],
            'cymbals': ['cymbal', 'cymbals', 'crash', 'ride', 'splash'],
            'toms': ['tom', 'toms'],
            'percussion': ['percussion', 'perc', 'shaker', 'tambourine', 'conga', 'bongo'],
            'bass': ['bass', 'sub', 'sub bass', '808', 'low end'],
            'leads': ['lead', 'leads', 'synth', 'melody', 'melodies'],
            'pads': ['pad', 'pads', 'atmosphere', 'ambient', 'texture'],
            'chords': ['chord', 'chords', 'stab', 'stabs'],
            'keys': ['piano', 'keys', 'keyboard', 'rhodes', 'wurlitzer', 'organ'],
            'guitars': ['guitar', 'guitars', 'gtr', 'acoustic', 'electric'],
            'strings': ['strings', 'string', 'violin', 'cello', 'orchestra'],
            'vocals': ['vocal', 'vocals', 'vox', 'voice', 'acapella'],
            'fx': ['fx', 'effects', 'sfx', 'sound effects'],
            'risers': ['riser', 'risers', 'buildup', 'sweep'],
            'impacts': ['impact', 'impacts', 'hit', 'hits', 'slam'],
            'transitions': ['transition', 'transitions', 'woosh', 'swoosh'],
            'loops': ['loop', 'loops'],
            'oneshots': ['one shot', 'oneshot', 'one-shot']
        }
        
        def search_tree(node: DirectoryNode, category: str, patterns: List[str]):
            """Search the tree for directories matching category patterns."""
            if node.is_directory:
                name_lower = node.name.lower()
                for pattern in patterns:
                    if pattern in name_lower:
                        if category not in categories:
                            categories[category] = []
                        categories[category].append(node.path)
                        break
                
                # Continue searching children
                for child in node.children:
                    search_tree(child, category, patterns)
        
        # Search for each category
        for category, patterns in category_patterns.items():
            search_tree(root_node, category, patterns)
        
        return categories
    
    def suggest_directory_structure(self) -> DirectoryNode:
        """
        Create a suggested directory structure for organizing samples.
        
        Returns:
            DirectoryNode representing the suggested structure
        """
        # This creates a virtual directory structure that can be used as a template
        root = DirectoryNode(name="Samples", path=Path("Samples"), is_directory=True)
        
        # Drums category
        drums = DirectoryNode(name="Drums", path=Path("Samples/Drums"), is_directory=True)
        drums.children = [
            DirectoryNode(name="Kicks", path=Path("Samples/Drums/Kicks"), is_directory=True),
            DirectoryNode(name="Snares", path=Path("Samples/Drums/Snares"), is_directory=True),
            DirectoryNode(name="HiHats", path=Path("Samples/Drums/HiHats"), is_directory=True),
            DirectoryNode(name="Cymbals", path=Path("Samples/Drums/Cymbals"), is_directory=True),
            DirectoryNode(name="Toms", path=Path("Samples/Drums/Toms"), is_directory=True),
            DirectoryNode(name="Percussion", path=Path("Samples/Drums/Percussion"), is_directory=True),
        ]
        
        # Melodic category
        melodic = DirectoryNode(name="Melodic", path=Path("Samples/Melodic"), is_directory=True)
        melodic.children = [
            DirectoryNode(name="Bass", path=Path("Samples/Melodic/Bass"), is_directory=True),
            DirectoryNode(name="Leads", path=Path("Samples/Melodic/Leads"), is_directory=True),
            DirectoryNode(name="Pads", path=Path("Samples/Melodic/Pads"), is_directory=True),
            DirectoryNode(name="Chords", path=Path("Samples/Melodic/Chords"), is_directory=True),
            DirectoryNode(name="Keys", path=Path("Samples/Melodic/Keys"), is_directory=True),
            DirectoryNode(name="Guitars", path=Path("Samples/Melodic/Guitars"), is_directory=True),
            DirectoryNode(name="Strings", path=Path("Samples/Melodic/Strings"), is_directory=True),
        ]
        
        # Vocals category
        vocals = DirectoryNode(name="Vocals", path=Path("Samples/Vocals"), is_directory=True)
        vocals.children = [
            DirectoryNode(name="Lead Vocals", path=Path("Samples/Vocals/Lead Vocals"), is_directory=True),
            DirectoryNode(name="Backing Vocals", path=Path("Samples/Vocals/Backing Vocals"), is_directory=True),
            DirectoryNode(name="Vocal Chops", path=Path("Samples/Vocals/Vocal Chops"), is_directory=True),
            DirectoryNode(name="Vocal FX", path=Path("Samples/Vocals/Vocal FX"), is_directory=True),
        ]
        
        # FX category
        fx = DirectoryNode(name="FX", path=Path("Samples/FX"), is_directory=True)
        fx.children = [
            DirectoryNode(name="Risers", path=Path("Samples/FX/Risers"), is_directory=True),
            DirectoryNode(name="Impacts", path=Path("Samples/FX/Impacts"), is_directory=True),
            DirectoryNode(name="Transitions", path=Path("Samples/FX/Transitions"), is_directory=True),
            DirectoryNode(name="Ambience", path=Path("Samples/FX/Ambience"), is_directory=True),
            DirectoryNode(name="Misc", path=Path("Samples/FX/Misc"), is_directory=True),
        ]
        
        # Loops category
        loops = DirectoryNode(name="Loops", path=Path("Samples/Loops"), is_directory=True)
        loops.children = [
            DirectoryNode(name="Drum Loops", path=Path("Samples/Loops/Drum Loops"), is_directory=True),
            DirectoryNode(name="Melodic Loops", path=Path("Samples/Loops/Melodic Loops"), is_directory=True),
            DirectoryNode(name="Bass Loops", path=Path("Samples/Loops/Bass Loops"), is_directory=True),
        ]
        
        root.children = [drums, melodic, vocals, fx, loops]
        
        return root