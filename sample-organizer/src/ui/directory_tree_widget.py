"""
Directory Tree Widget - Visual representation of directory structure
"""

import tkinter as tk
from tkinter import ttk
import customtkinter as ctk
from pathlib import Path
from typing import Optional, Dict, List

from core.directory_scanner import DirectoryNode


class DirectoryTreeWidget(ctk.CTkFrame):
    """Widget for displaying directory structure as a tree."""
    
    def __init__(self, parent, **kwargs):
        super().__init__(parent, **kwargs)
        
        # Create tree view with scrollbars
        self._create_tree_view()
        
        # Store node mappings
        self.node_map: Dict[str, DirectoryNode] = {}
        self.item_map: Dict[str, str] = {}  # Maps DirectoryNode paths to tree item IDs
        
    def _create_tree_view(self):
        """Create the tree view widget with scrollbars."""
        # Create frame for tree and scrollbars
        tree_frame = ctk.CTkFrame(self)
        tree_frame.pack(fill=tk.BOTH, expand=True)
        
        # Create scrollbars
        v_scrollbar = ttk.Scrollbar(tree_frame, orient=tk.VERTICAL)
        h_scrollbar = ttk.Scrollbar(tree_frame, orient=tk.HORIZONTAL)
        
        # Create tree view
        self.tree = ttk.Treeview(
            tree_frame,
            yscrollcommand=v_scrollbar.set,
            xscrollcommand=h_scrollbar.set,
            show='tree',
            selectmode='browse'
        )
        
        # Configure scrollbars
        v_scrollbar.config(command=self.tree.yview)
        h_scrollbar.config(command=self.tree.xview)
        
        # Style configuration
        style = ttk.Style()
        style.configure("Treeview", 
                       background="#212121",
                       foreground="white",
                       fieldbackground="#212121",
                       borderwidth=0)
        style.map('Treeview', background=[('selected', '#1f538d')])
        
        # Configure tree columns
        self.tree.heading('#0', text='Directory Structure')
        
        # Bind events
        self.tree.bind('<Double-Button-1>', self._on_double_click)
        self.tree.bind('<<TreeviewSelect>>', self._on_select)
        
        # Pack components
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        v_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        h_scrollbar.pack(side=tk.BOTTOM, fill=tk.X)
        
    def display_structure(self, root_node: DirectoryNode):
        """Display a directory structure in the tree view."""
        # Clear existing items
        self.tree.delete(*self.tree.get_children())
        self.node_map.clear()
        self.item_map.clear()
        
        # Add root node
        root_item = self._add_node(None, root_node)
        
        # Expand root
        self.tree.item(root_item, open=True)
        
    def _add_node(self, parent_item: Optional[str], node: DirectoryNode) -> str:
        """Add a node to the tree view."""
        # Determine display text
        display_text = node.name
        if node.is_directory and node.file_count > 0:
            display_text += f" ({node.file_count} files)"
            
        # Determine icon based on node type
        if node.is_directory:
            if any(child.is_directory for child in node.children):
                icon = "📁"  # Folder with subfolders
            else:
                icon = "📂"  # Folder with only files
        else:
            icon = "🎵"  # Audio file
            
        # Add to tree
        item_id = self.tree.insert(
            parent_item or '',
            'end',
            text=f"{icon} {display_text}",
            tags=('directory' if node.is_directory else 'file',)
        )
        
        # Store mappings
        path_str = str(node.path)
        self.node_map[item_id] = node
        self.item_map[path_str] = item_id
        
        # Add children
        if node.is_directory:
            for child in node.children:
                self._add_node(item_id, child)
                
        return item_id
    
    def _on_double_click(self, event):
        """Handle double-click on tree item."""
        item = self.tree.selection()[0]
        if self.tree.item(item, 'open'):
            self.tree.item(item, open=False)
        else:
            self.tree.item(item, open=True)
            
    def _on_select(self, event):
        """Handle selection change."""
        selection = self.tree.selection()
        if selection:
            item = selection[0]
            node = self.node_map.get(item)
            if node:
                # Could emit a signal or callback here
                pass
                
    def get_selected_directory(self) -> Optional[Path]:
        """Get the currently selected directory path."""
        selection = self.tree.selection()
        if selection:
            item = selection[0]
            node = self.node_map.get(item)
            if node and node.is_directory:
                return node.path
        return None
    
    def find_directory_item(self, path: Path) -> Optional[str]:
        """Find the tree item ID for a given directory path."""
        return self.item_map.get(str(path))
    
    def expand_to_path(self, path: Path):
        """Expand the tree to show a specific path."""
        item_id = self.find_directory_item(path)
        if item_id:
            # Expand all parents
            parent = self.tree.parent(item_id)
            while parent:
                self.tree.item(parent, open=True)
                parent = self.tree.parent(parent)
                
            # Select and show the item
            self.tree.selection_set(item_id)
            self.tree.see(item_id)
            
    def get_all_directory_paths(self) -> List[Path]:
        """Get all directory paths in the tree."""
        paths = []
        for node in self.node_map.values():
            if node.is_directory:
                paths.append(node.path)
        return sorted(paths)