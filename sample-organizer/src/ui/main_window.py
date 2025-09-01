"""
Main Window - Primary UI for the Sample Organizer application
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import customtkinter as ctk
from pathlib import Path
import threading
from typing import Optional, List, Dict

from core.directory_scanner import DirectoryScanner, DirectoryNode
from core.sample_analyzer import SampleAnalyzer
from ui.directory_tree_widget import DirectoryTreeWidget
from ui.sample_review_dialog import SampleReviewDialog
from ui.progress_dialog import ProgressDialog
from core.sample_organizer import SampleOrganizer


class SampleOrganizerApp:
    """Main application window for the Sample Organizer."""
    
    def __init__(self):
        # Set CustomTkinter appearance
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")
        
        # Initialize main window
        self.root = ctk.CTk()
        self.root.title("Sample Organizer for Mac OS")
        self.root.geometry("1200x800")
        
        # Initialize components
        self.directory_scanner = DirectoryScanner()
        self.sample_analyzer = SampleAnalyzer()
        self.sample_organizer = SampleOrganizer(self.sample_analyzer)
        
        # State variables
        self.input_path: Optional[Path] = None
        self.output_path: Optional[Path] = None
        self.output_structure: Optional[DirectoryNode] = None
        self.analysis_results: List[Dict] = []
        
        # Build UI
        self._build_ui()
        
    def _build_ui(self):
        """Build the main user interface."""
        # Main container
        main_container = ctk.CTkFrame(self.root)
        main_container.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Top section - Directory selection
        self._build_directory_section(main_container)
        
        # Middle section - Directory structure view
        self._build_structure_section(main_container)
        
        # Bottom section - Actions and status
        self._build_action_section(main_container)
        
    def _build_directory_section(self, parent):
        """Build the directory selection section."""
        dir_frame = ctk.CTkFrame(parent)
        dir_frame.pack(fill=tk.X, pady=(0, 20))
        
        # Output directory selection
        output_frame = ctk.CTkFrame(dir_frame)
        output_frame.pack(fill=tk.X, pady=10, padx=10)
        
        ctk.CTkLabel(output_frame, text="Output Directory:", font=("Arial", 14)).pack(side=tk.LEFT, padx=(0, 10))
        
        self.output_label = ctk.CTkLabel(output_frame, text="No directory selected", 
                                         fg_color="gray20", corner_radius=5)
        self.output_label.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=10)
        
        ctk.CTkButton(output_frame, text="Browse", width=100,
                      command=self._select_output_directory).pack(side=tk.RIGHT)
        
        # Input directory selection
        input_frame = ctk.CTkFrame(dir_frame)
        input_frame.pack(fill=tk.X, pady=10, padx=10)
        
        ctk.CTkLabel(input_frame, text="Input Directory:", font=("Arial", 14)).pack(side=tk.LEFT, padx=(0, 10))
        
        self.input_label = ctk.CTkLabel(input_frame, text="No directory selected",
                                        fg_color="gray20", corner_radius=5)
        self.input_label.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=10)
        
        ctk.CTkButton(input_frame, text="Browse", width=100,
                      command=self._select_input_directory).pack(side=tk.RIGHT)
        
    def _build_structure_section(self, parent):
        """Build the directory structure visualization section."""
        structure_frame = ctk.CTkFrame(parent)
        structure_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 20))
        
        # Title
        title_frame = ctk.CTkFrame(structure_frame)
        title_frame.pack(fill=tk.X, padx=10, pady=10)
        
        ctk.CTkLabel(title_frame, text="Output Directory Structure", 
                     font=("Arial", 16, "bold")).pack(side=tk.LEFT)
        
        self.scan_status_label = ctk.CTkLabel(title_frame, text="", font=("Arial", 12))
        self.scan_status_label.pack(side=tk.RIGHT)
        
        # Tree view container
        tree_container = ctk.CTkFrame(structure_frame)
        tree_container.pack(fill=tk.BOTH, expand=True, padx=10, pady=(0, 10))
        
        # Create tree widget
        self.tree_widget = DirectoryTreeWidget(tree_container)
        self.tree_widget.pack(fill=tk.BOTH, expand=True)
        
    def _build_action_section(self, parent):
        """Build the action buttons and status section."""
        action_frame = ctk.CTkFrame(parent)
        action_frame.pack(fill=tk.X)
        
        # Button container
        button_frame = ctk.CTkFrame(action_frame)
        button_frame.pack(pady=10)
        
        # Scan button
        self.scan_button = ctk.CTkButton(
            button_frame, text="Scan Directories", width=150,
            command=self._scan_directories, state=tk.DISABLED
        )
        self.scan_button.pack(side=tk.LEFT, padx=5)
        
        # Analyze button
        self.analyze_button = ctk.CTkButton(
            button_frame, text="Analyze Samples", width=150,
            command=self._analyze_samples, state=tk.DISABLED
        )
        self.analyze_button.pack(side=tk.LEFT, padx=5)
        
        # Organize button
        self.organize_button = ctk.CTkButton(
            button_frame, text="Organize Samples", width=150,
            command=self._organize_samples, state=tk.DISABLED
        )
        self.organize_button.pack(side=tk.LEFT, padx=5)
        
        # Settings button
        self.settings_button = ctk.CTkButton(
            button_frame, text="Settings", width=100,
            command=self._show_settings
        )
        self.settings_button.pack(side=tk.LEFT, padx=5)
        
        # Status bar
        status_frame = ctk.CTkFrame(action_frame)
        status_frame.pack(fill=tk.X, pady=(10, 0))
        
        self.status_label = ctk.CTkLabel(status_frame, text="Ready", font=("Arial", 12))
        self.status_label.pack(side=tk.LEFT, padx=10)
        
        self.progress_bar = ctk.CTkProgressBar(status_frame)
        self.progress_bar.pack(side=tk.RIGHT, padx=10, fill=tk.X, expand=True)
        self.progress_bar.set(0)
        
    def _select_output_directory(self):
        """Handle output directory selection."""
        directory = filedialog.askdirectory(title="Select Output Directory")
        if directory:
            self.output_path = Path(directory)
            self.output_label.configure(text=str(self.output_path))
            self._update_button_states()
            
    def _select_input_directory(self):
        """Handle input directory selection."""
        directory = filedialog.askdirectory(title="Select Input Directory")
        if directory:
            self.input_path = Path(directory)
            self.input_label.configure(text=str(self.input_path))
            self._update_button_states()
            
    def _update_button_states(self):
        """Update button states based on selected directories."""
        if self.output_path:
            self.scan_button.configure(state=tk.NORMAL)
            
        if self.input_path and self.output_path:
            self.analyze_button.configure(state=tk.NORMAL)
            
        if self.analysis_results and self.output_structure:
            self.organize_button.configure(state=tk.NORMAL)
            
    def _scan_directories(self):
        """Scan the output directory structure."""
        if not self.output_path:
            return
            
        self.status_label.configure(text="Scanning output directory...")
        self.progress_bar.set(0)
        
        def scan_task():
            try:
                # Scan the directory
                self.output_structure = self.directory_scanner.scan_directory(self.output_path)
                
                # Update UI in main thread
                self.root.after(0, self._on_scan_complete)
            except Exception as e:
                self.root.after(0, lambda: messagebox.showerror("Scan Error", str(e)))
                
        # Run in background thread
        thread = threading.Thread(target=scan_task)
        thread.start()
        
    def _on_scan_complete(self):
        """Handle scan completion."""
        if self.output_structure:
            self.tree_widget.display_structure(self.output_structure)
            
            # Update status
            total_dirs = len(self.output_structure.get_all_directories())
            self.scan_status_label.configure(
                text=f"Found {total_dirs} directories, {self.output_structure.file_count} files"
            )
            
        self.status_label.configure(text="Scan complete")
        self.progress_bar.set(1)
        self._update_button_states()
        
    def _analyze_samples(self):
        """Analyze samples in the input directory."""
        if not self.input_path:
            return
            
        # Show progress dialog
        progress_dialog = ProgressDialog(self.root, "Analyzing Samples")
        progress_dialog.show()
        
        def analyze_task():
            try:
                # Analyze samples
                self.analysis_results = self.sample_analyzer.scan_directory(self.input_path)
                
                # Update progress
                total = len(self.analysis_results)
                for i, result in enumerate(self.analysis_results):
                    progress = (i + 1) / total
                    status = f"Analyzed {i + 1}/{total} samples"
                    self.root.after(0, lambda p=progress, s=status: progress_dialog.update(p, s))
                
                # Complete
                self.root.after(0, lambda: self._on_analyze_complete(progress_dialog))
                
            except Exception as e:
                self.root.after(0, lambda: messagebox.showerror("Analysis Error", str(e)))
                self.root.after(0, progress_dialog.close)
                
        # Run in background thread
        thread = threading.Thread(target=analyze_task)
        thread.start()
        
    def _on_analyze_complete(self, progress_dialog):
        """Handle analysis completion."""
        progress_dialog.close()
        
        # Show summary
        total = len(self.analysis_results)
        high_confidence = sum(1 for r in self.analysis_results if r['confidence'] > 0.7)
        low_confidence = total - high_confidence
        
        message = f"Analysis complete!\n\n"
        message += f"Total samples: {total}\n"
        message += f"High confidence: {high_confidence}\n"
        message += f"Need review: {low_confidence}"
        
        messagebox.showinfo("Analysis Complete", message)
        
        self.status_label.configure(text="Analysis complete")
        self._update_button_states()
        
    def _organize_samples(self):
        """Start the sample organization process."""
        if not self.analysis_results or not self.output_structure:
            return
            
        # Filter samples that need review
        samples_to_review = [
            r for r in self.analysis_results 
            if r['confidence'] < 0.7 or not r['category_suggestion']
        ]
        
        if samples_to_review:
            # Show review dialog
            review_dialog = SampleReviewDialog(
                self.root, samples_to_review, self.output_structure
            )
            
            if not review_dialog.show():
                return  # User cancelled
                
            # Update analysis results with user choices
            user_mappings = review_dialog.get_mappings()
            for result in self.analysis_results:
                if result['file_path'] in user_mappings:
                    target_dir = user_mappings[result['file_path']]
                    result['target_directory'] = target_dir
                    result['confidence'] = 1.0  # User confirmed
                    
        # Start organization
        self._perform_organization()
        
    def _perform_organization(self):
        """Perform the actual file organization."""
        progress_dialog = ProgressDialog(self.root, "Organizing Samples")
        progress_dialog.show()
        
        def organize_task():
            try:
                # Organize samples
                results = self.sample_organizer.organize_samples(
                    self.analysis_results,
                    self.output_path,
                    self.output_structure,
                    progress_callback=lambda p, s: self.root.after(0, lambda: progress_dialog.update(p, s))
                )
                
                # Complete
                self.root.after(0, lambda: self._on_organize_complete(progress_dialog, results))
                
            except Exception as e:
                self.root.after(0, lambda: messagebox.showerror("Organization Error", str(e)))
                self.root.after(0, progress_dialog.close)
                
        # Run in background thread
        thread = threading.Thread(target=organize_task)
        thread.start()
        
    def _on_organize_complete(self, progress_dialog, results):
        """Handle organization completion."""
        progress_dialog.close()
        
        # Show summary
        total = results['total']
        success = results['success']
        failed = results['failed']
        
        message = f"Organization complete!\n\n"
        message += f"Total samples: {total}\n"
        message += f"Successfully organized: {success}\n"
        message += f"Failed: {failed}"
        
        if failed > 0:
            message += f"\n\nCheck the log for details on failed samples."
            
        messagebox.showinfo("Organization Complete", message)
        
        # Refresh directory structure
        self._scan_directories()
        
    def _show_settings(self):
        """Show settings dialog."""
        # TODO: Implement settings dialog
        messagebox.showinfo("Settings", "Settings dialog coming soon!")
        
    def run(self):
        """Run the application."""
        self.root.mainloop()