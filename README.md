# YouTube Study & Annotation Sidebar

A professional browser extension that transforms your YouTube experience, turning passive viewing into an active and productive session for learning, research, and analysis.

![Screenshot](image.png)

---

## About The Project

In an age of online learning and video content, simply watching is not enough. This tool was built for students, professionals, and lifelong learners who need to engage deeply with video content. Whether you're studying a lecture, following a complex tutorial, or analyzing media, this sidebar provides the integrated tools you need, right where you need them.

The sidebar automatically attaches to your active YouTube video, providing a dedicated workspace for playback control, free-form summaries, and precise, timestamped annotations. All notes are saved per video and automatically loaded when you return, creating a persistent, organized library of your insights.

## Core Features

- ✅ **Seamless Integration:** A sleek, dark-themed sidebar that feels like a native part of your browser.
- 🧠 **Smart Video Tracking:** Intelligently finds and stays synced with the active YouTube video, even as you navigate or switch tabs.
- ⏯️ **Advanced Playback Controls:** A clean, icon-based "remote control" to play/pause, rewind, and fast-forward content from anywhere.
- 📊 **At-a-Glance UI:** Displays the video's thumbnail, full title, and a real-time progress bar.
- 📝 **Persistent General Notes:** A dedicated space for summaries and thoughts that are saved automatically.
- 📌 **Timestamped Highlights:** Instantly bookmark key moments with a custom note.
- 🖱️ **Clickable Navigation:** Jump directly to any bookmarked moment in the video by clicking on your highlight.
- 💾 **Automatic Cloud Sync:** Utilizes `chrome.storage` to automatically save and sync all your notes and highlights across your devices (if Chrome sync is enabled).

## Tech Stack

- **Platform:** Chrome Browser Extension
- **Manifest:** Manifest V3 (with a Service Worker for the background script)
- **Core Logic:** Modern JavaScript (ES6+ `async/await`)
- **User Interface:** HTML5 & CSS3
- **Icons:** [Font Awesome](https://fontawesome.com/)

## Getting Started

This is an unpacked developer extension. To install and run it locally, follow these steps:

1.  **Download the Code:**

    - Clone this repository: `git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git`
    - Alternatively, download the project as a ZIP and extract it.

2.  **Install in Chrome:**

    - Open Chrome and navigate to `chrome://extensions`.
    - Enable **"Developer mode"** using the toggle in the top-right corner.
    - Click the **"Load unpacked"** button.
    - Select the project folder you downloaded.

3.  **Done!**
    - The extension icon will appear in your browser's toolbar. Pin it for easy access.

## How to Use

1.  Navigate to any YouTube video page.
2.  Click the extension's icon to open the sidebar. It will automatically load the video's info.
3.  Use the controls to manage playback.
4.  Type in the "General Notes" section; your work is saved as you type.
5.  To create a highlight, type a note in the input box and click "Add Timestamp Highlight".
6.  Click any highlight to jump the video to that exact time.

## Roadmap & Future Enhancements

The core application is complete, stable, and polished. The following features are planned to further enhance its functionality:

- [ ] **Export Functionality:** The highest priority next step. Implement a feature to export all notes and highlights for a video into a clean, portable format like Markdown (`.md`).
- [ ] **Editable Highlights:** Allow users to edit the text of a highlight after it has been created.
- [ ] **Delete & Clear Options:** Add controls to remove individual highlights or clear all notes for a video.
- [ ] **Search & Filter:** For videos with many highlights, add a search bar to filter notes.
- [ ] **Settings Page:** Create an options page to configure settings (e.g., light/dark theme, rewind/forward duration).

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

---
