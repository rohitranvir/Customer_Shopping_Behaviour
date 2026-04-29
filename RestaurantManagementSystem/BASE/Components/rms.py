"""
Restaurant Management System v0.1.2 NA,
    App is made to facilitate restaurant management processes.

Developed by Rohit Ranvir in Dec 2025
    Last upgrades: Jan 2026
"""

from mainwindow import MainWindow
from ctypes import windll
windll.shcore.SetProcessDpiAwareness(1)

if __name__ == "__main__":
    app = MainWindow()
    app.mainloop()
