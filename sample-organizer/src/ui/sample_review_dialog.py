"""
Sample Review Dialog - UI for manually categorizing uncertain samples
"""

import tkinter as tk
from tkinter import ttk
import customtkinter as ctk
from pathlib import Path
from typing import List, Dict, Optional
import pygame
import threading

from core.directory_scanner import DirectoryNode
from ui.directory_tree_widget import DirectoryTreeWidget


class SampleReviewDialog:
    """Dialog for reviewing and manually categorizing samples."""
    
    def __init__(self, parent, samples: List[Dict], directory_structure: DirectoryNode):
        self.parent = parent
        self.samples = samples
        self.directory_structure = directory_structure
        self.current_index = 0
        self.mappings: Dict[str, Path] = {}
        self.result = False
        
        # Initialize pygame for audio playback
        pygame.mixer.init()
        
        # Create dialog window
        self.dialog = ctk.CTkToplevel(parent)
        self.dialog.title("Review Samples")
        self.dialog.geometry("1000x700")
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        # Build UI
        self._build_ui()
        
        # Load first sample
        self._load_sample(0)
        
    def _build_ui(self):
        """Build the dialog UI."""
        # Main container
        main_frame = ctk.CTkFrame(self.dialog)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # Top section - Sample info and controls
        top_frame = ctk.CTkFrame(main_frame)
        top_frame.pack(fill=tk.X, pady=(0, 20))
        
        # Sample counter
        self.counter_label = ctk.CTkLabel(top_frame, text="", font=("Arial", 14))
        self.counter_label.pack(pady=10)
        
        # Sample name
        self.sample_name_label = ctk.CTkLabel(top_frame, text="", font=("Arial", 16, "bold"))
        self.sample_name_label.pack(pady=5)
        
        # Confidence info
        self.confidence_label = ctk.CTkLabel(top_frame, text="", font=("Arial", 12))
        self.confidence_label.pack(pady=5)
        
        # Suggested category
        self.suggestion_label = ctk.CTkLabel(top_frame, text="", font=("Arial", 12))
        self.suggestion_label.pack(pady=5)
        
        # Audio controls
        audio_frame = ctk.CTkFrame(top_frame)
        audio_frame.pack(pady=10)
        
        self.play_button = ctk.CTkButton(audio_frame, text="▶ Play", width=100,
                                         command=self._play_sample)
        self.play_button.pack(side=tk.LEFT, padx=5)
        
        self.stop_button = ctk.CTkButton(audio_frame, text="⬛ Stop", width=100,
                                         command=self._stop_sample)
        self.stop_button.pack(side=tk.LEFT, padx=5)
        
        # Middle section - Directory selection
        middle_frame = ctk.CTkFrame(main_frame)
        middle_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 20))
        
        ctk.CTkLabel(middle_frame, text="Select destination folder:",
                     font=("Arial", 14)).pack(pady=10)
        
        # Directory tree
        tree_frame = ctk.CTkFrame(middle_frame)
        tree_frame.pack(fill=tk.BOTH, expand=True, padx=20)
        
        self.dir_tree = DirectoryTreeWidget(tree_frame)
        self.dir_tree.pack(fill=tk.BOTH, expand=True)
        self.dir_tree.display_structure(self.directory_structure)
        
        # Selected directory label
        self.selected_dir_label = ctk.CTkLabel(middle_frame, text="No directory selected",
                                               fg_color="gray20", corner_radius=5)
        self.selected_dir_label.pack(fill=tk.X, padx=20, pady=10)
        
        # Bind tree selection
        self.dir_tree.tree.bind('<<TreeviewSelect>>', self._on_directory_select)
        
        # Bottom section - Navigation buttons
        bottom_frame = ctk.CTkFrame(main_frame)
        bottom_frame.pack(fill=tk.X)
        
        # Quick category buttons
        quick_frame = ctk.CTkFrame(bottom_frame)
        quick_frame.pack(pady=10)
        
        ctk.CTkLabel(quick_frame, text="Quick select:").pack(side=tk.LEFT, padx=(0, 10))
        
        # Common categories
        categories = ["Kicks", "Snares", "HiHats", "Bass", "Leads", "FX"]
        for category in categories:
            ctk.CTkButton(
                quick_frame, text=category, width=80,
                command=lambda c=category: self._quick_select_category(c)
            ).pack(side=tk.LEFT, padx=2)
        
        # Navigation buttons
        nav_frame = ctk.CTkFrame(bottom_frame)
        nav_frame.pack(pady=10)
        
        self.prev_button = ctk.CTkButton(nav_frame, text="← Previous", width=120,
                                         command=self._previous_sample)
        self.prev_button.pack(side=tk.LEFT, padx=5)
        
        self.skip_button = ctk.CTkButton(nav_frame, text="Skip", width=120,
                                         command=self._skip_sample)
        self.skip_button.pack(side=tk.LEFT, padx=5)
        
        self.next_button = ctk.CTkButton(nav_frame, text="Next →", width=120,
                                         command=self._next_sample)
        self.next_button.pack(side=tk.LEFT, padx=5)
        
        # Action buttons
        action_frame = ctk.CTkFrame(bottom_frame)
        action_frame.pack(pady=(20, 0))
        
        cancel_button = ctk.CTkButton(action_frame, text="Cancel", width=120,
                                      command=self._cancel)
        cancel_button.pack(side=tk.LEFT, padx=10)
        
        self.finish_button = ctk.CTkButton(action_frame, text="Finish", width=120,
                                           command=self._finish)
        self.finish_button.pack(side=tk.LEFT, padx=10)
        
    def _load_sample(self, index: int):
        """Load a sample for review."""
        if 0 <= index < len(self.samples):
            self.current_index = index
            sample = self.samples[index]
            
            # Update counter
            self.counter_label.configure(
                text=f"Sample {index + 1} of {len(self.samples)}"
            )
            
            # Update sample info
            self.sample_name_label.configure(text=Path(sample['filename']).name)
            
            # Update confidence
            confidence = sample.get('confidence', 0)
            confidence_text = f"Confidence: {confidence:.0%}"
            if confidence < 0.3:
                confidence_text += " (Low)"
            elif confidence < 0.7:
                confidence_text += " (Medium)"
            else:
                confidence_text += " (High)"
            self.confidence_label.configure(text=confidence_text)
            
            # Update suggestion
            category = sample.get('category_suggestion', 'Unknown')
            subcategory = sample.get('subcategory_suggestion', '')
            if subcategory:
                suggestion = f"Suggested: {category} → {subcategory}"
            else:
                suggestion = f"Suggested: {category}"
            self.suggestion_label.configure(text=suggestion)
            
            # Check if already mapped
            if sample['file_path'] in self.mappings:
                self.selected_dir_label.configure(
                    text=f"Selected: {self.mappings[sample['file_path']]}"
                )
            else:
                self.selected_dir_label.configure(text="No directory selected")
                
            # Update button states
            self.prev_button.configure(state=tk.NORMAL if index > 0 else tk.DISABLED)
            self.next_button.configure(state=tk.NORMAL if index < len(self.samples) - 1 else tk.DISABLED)
            
            # Stop any playing audio
            self._stop_sample()
            
    def _on_directory_select(self, event):
        """Handle directory selection."""
        selected_dir = self.dir_tree.get_selected_directory()
        if selected_dir:
            self.selected_dir_label.configure(text=f"Selected: {selected_dir}")
            # Save mapping
            current_sample = self.samples[self.current_index]
            self.mappings[current_sample['file_path']] = selected_dir
            
    def _quick_select_category(self, category: str):
        """Quick select a common category."""
        # Find matching directory in structure
        for node in self.directory_structure.get_all_directories():
            if category.lower() in str(node).lower():
                self.dir_tree.expand_to_path(node)
                self.selected_dir_label.configure(text=f"Selected: {node}")
                # Save mapping
                current_sample = self.samples[self.current_index]
                self.mappings[current_sample['file_path']] = node
                break
                
    def _play_sample(self):
        """Play the current sample."""
        try:
            sample = self.samples[self.current_index]
            pygame.mixer.music.load(sample['file_path'])
            pygame.mixer.music.play()
        except Exception as e:
            print(f"Error playing sample: {e}")
            
    def _stop_sample(self):
        """Stop playing audio."""
        pygame.mixer.music.stop()
        
    def _previous_sample(self):
        """Go to previous sample."""
        if self.current_index > 0:
            self._load_sample(self.current_index - 1)
            
    def _next_sample(self):
        """Go to next sample."""
        if self.current_index < len(self.samples) - 1:
            self._load_sample(self.current_index + 1)
            
    def _skip_sample(self):
        """Skip current sample without mapping."""
        current_sample = self.samples[self.current_index]
        if current_sample['file_path'] in self.mappings:
            del self.mappings[current_sample['file_path']]
        self._next_sample()
        
    def _cancel(self):
        """Cancel the review process."""
        self._stop_sample()
        self.result = False
        self.dialog.destroy()
        
    def _finish(self):
        """Finish the review process."""
        # Check if all samples have been mapped
        unmapped = [s for s in self.samples if s['file_path'] not in self.mappings]
        
        if unmapped:
            response = tk.messagebox.askyesno(
                "Unmapped Samples",
                f"{len(unmapped)} samples have not been mapped. "
                "They will be skipped. Continue?"
            )
            if not response:
                return
                
        self._stop_sample()
        self.result = True
        self.dialog.destroy()
        
    def show(self) -> bool:
        """Show the dialog and return result."""
        self.dialog.wait_window()
        return self.result
        
    def get_mappings(self) -> Dict[str, Path]:
        """Get the user-defined mappings."""
        return self.mappings