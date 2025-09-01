"""
Progress Dialog - Shows progress for long-running operations
"""

import tkinter as tk
import customtkinter as ctk
from typing import Optional


class ProgressDialog:
    """Dialog showing progress for long-running operations."""
    
    def __init__(self, parent, title: str = "Processing"):
        self.parent = parent
        
        # Create dialog window
        self.dialog = ctk.CTkToplevel(parent)
        self.dialog.title(title)
        self.dialog.geometry("500x200")
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        # Center the dialog
        self.dialog.update_idletasks()
        x = (self.dialog.winfo_screenwidth() // 2) - (self.dialog.winfo_width() // 2)
        y = (self.dialog.winfo_screenheight() // 2) - (self.dialog.winfo_height() // 2)
        self.dialog.geometry(f"+{x}+{y}")
        
        # Prevent closing
        self.dialog.protocol("WM_DELETE_WINDOW", lambda: None)
        
        # Build UI
        self._build_ui()
        
    def _build_ui(self):
        """Build the progress dialog UI."""
        # Main container
        main_frame = ctk.CTkFrame(self.dialog)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # Title label
        self.title_label = ctk.CTkLabel(main_frame, text="Processing...",
                                        font=("Arial", 16, "bold"))
        self.title_label.pack(pady=(0, 20))
        
        # Status label
        self.status_label = ctk.CTkLabel(main_frame, text="Please wait...",
                                         font=("Arial", 12))
        self.status_label.pack(pady=(0, 20))
        
        # Progress bar
        self.progress_bar = ctk.CTkProgressBar(main_frame, width=400)
        self.progress_bar.pack(pady=(0, 20))
        self.progress_bar.set(0)
        
        # Percentage label
        self.percentage_label = ctk.CTkLabel(main_frame, text="0%",
                                             font=("Arial", 12))
        self.percentage_label.pack()
        
    def update(self, progress: float, status: Optional[str] = None):
        """Update progress and status."""
        # Ensure progress is between 0 and 1
        progress = max(0, min(1, progress))
        
        # Update progress bar
        self.progress_bar.set(progress)
        
        # Update percentage
        percentage = int(progress * 100)
        self.percentage_label.configure(text=f"{percentage}%")
        
        # Update status if provided
        if status:
            self.status_label.configure(text=status)
            
        # Force update
        self.dialog.update()
        
    def set_title(self, title: str):
        """Update the title text."""
        self.title_label.configure(text=title)
        self.dialog.update()
        
    def show(self):
        """Show the dialog."""
        self.dialog.deiconify()
        self.dialog.update()
        
    def close(self):
        """Close the dialog."""
        self.dialog.destroy()