const titleElement = document.getElementById('video-title');
const thumbnailElement = document.getElementById('video-thumbnail');
const timeDisplay = document.getElementById('time-display');
const progressBar = document.getElementById('progress-bar');

const playPauseBtn = document.getElementById('play-pause-btn');
const rewindBtn = document.getElementById('rewind-btn');
const forwardBtn = document.getElementById('forward-btn');

const addTimestampBtn = document.getElementById('add-timestamp-btn');
const highlightsList = document.getElementById('highlights-list');
const highlightNoteInput = document.getElementById('highlight-note-input'); 
const generalNotes = document.getElementById('general-notes'); 

let updateInterval; // To hold our interval timer
let currentVideoId = null; 

// --- Communication with Background Script ---
async function sendMessageToBackground(message) {
  try {
    const response = await chrome.runtime.sendMessage(message);
    return response;
  } catch (e) {
    console.error("Sidebar Error:", e);
    titleElement.textContent = "Error communicating with the page. Try refreshing the YouTube tab.";
    clearInterval(updateInterval); 
    return null;
  }
}

// --- UI Update Functions ---

// Formats seconds into MM:SS or HH:MM:SS
function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const date = new Date(null);
    date.setSeconds(seconds);
    const timeString = date.toISOString().substr(11, 8);
    return timeString.startsWith('00:') ? timeString.substr(3) : timeString;
}

async function updateFullUI(maxRetries = 5, delay = 300) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const response = await sendMessageToBackground({ action: 'get_video_details' });

        if (response && response.videoId) {
            currentVideoId = response.videoId; 

            titleElement.textContent = response.title;
            thumbnailElement.src = `https://i.ytimg.com/vi/${currentVideoId}/mqdefault.jpg`;
            
            await loadData(currentVideoId);
            
            updatePlaybackUI(response);
            
            if (updateInterval) clearInterval(updateInterval);
            updateInterval = setInterval(updateProgress, 1000);
            return; 
        }

        console.warn(`Attempt #${attempt} failed. Retrying in ${delay}ms...`);
        if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    console.error("All retries failed. Displaying final error message.");
    titleElement.textContent = "No active YouTube video found. Please focus a YouTube tab and reopen the sidebar.";
    currentVideoId = null; // Clear the ID on failure
}

const manualRefreshBtn = document.getElementById('manual-refresh-btn');
if (manualRefreshBtn) {
    manualRefreshBtn.addEventListener('click', async () => {
        console.clear(); // Clear the console for a clean log
        console.log("%c--- MANUAL REFRESH INITIATED ---", "color: #ffc107; font-weight: bold;");

        // We will now directly ask the content script for the details
        const details = await sendMessageToBackground({ action: 'get_video_details' });

        console.log("%cReceived Details Object:", "color: #ffc107; font-weight: bold;", details);

        if (details && details.title) {
            titleElement.textContent = details.title;
            alert(`Manual refresh successful! New Title: "${details.title}"`);
        } else {
            alert("Manual refresh failed. Check the sidebar console for details.");
        }
    });
}

// Lightweight UI update for progress and play/pause state
function updatePlaybackUI(data) {
    const { currentTime, duration, isPaused } = data;
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
    
    const playPauseIcon = playPauseBtn.querySelector('i');
    if (isPaused) {
        // Change icon to 'play'
        playPauseIcon.classList.remove('fa-pause');
        playPauseIcon.classList.add('fa-play');
    } else {
        // Change icon to 'pause'
        playPauseIcon.classList.remove('fa-play');
        playPauseIcon.classList.add('fa-pause');
    }
}

async function updateProgress() {
    const response = await sendMessageToBackground({ action: 'get_current_time' });
    if (response && response.duration) {
        updatePlaybackUI(response);
    }
}


async function saveData() {
    if (!currentVideoId) return; // Can't save if we don't know the video ID

    // 1. Gather all the data from the UI
    const highlights = [];
    document.querySelectorAll('#highlights-list li').forEach(item => {
        highlights.push({
            time: item.dataset.time,
            note: item.dataset.note
        });
    });

    const dataToSave = {
        generalNotes: generalNotes.value,
        highlights: highlights
    };

    // 2. Save it to chrome.storage using the video ID as the key
    await chrome.storage.local.set({ [currentVideoId]: dataToSave });
    console.log(`Data saved for video ${currentVideoId}:`, dataToSave);
}


async function loadData(videoId) {
    // 1. Clear any existing data from the UI
    generalNotes.value = '';
    highlightsList.innerHTML = '';

    // 2. Get data from storage for the specific video ID
    const data = await chrome.storage.local.get(videoId);
    
    if (data && data[videoId]) {
        const savedData = data[videoId];
        console.log(`Data loaded for video ${videoId}:`, savedData);

        // 3. Populate the UI with the loaded data
        generalNotes.value = savedData.generalNotes || '';
        
        if (savedData.highlights) {
            savedData.highlights.forEach(highlight => {
                const newHighlight = document.createElement('li');
                newHighlight.dataset.time = highlight.time;
                newHighlight.dataset.note = highlight.note;
                newHighlight.innerHTML = `
                    <span class="highlight-time">${formatTime(highlight.time)}</span>
                    <span class="highlight-note">${highlight.note}</span>
                `;
                newHighlight.addEventListener('click', () => {
                    sendMessageToBackground({ action: 'seek_to_time', time: newHighlight.dataset.time });
                });
                highlightsList.appendChild(newHighlight);
            });
        }
    } else {
        console.log(`No data found for video ${videoId}.`);
    }
}

// --- Event Handlers ---
playPauseBtn.addEventListener('click', async () => {
  const response = await sendMessageToBackground({ action: 'play_pause' });
  if (response) {
      playPauseBtn.textContent = response.status === 'paused' ? 'Play' : 'Pause';
  }
});

rewindBtn.addEventListener('click', () => {
  sendMessageToBackground({ action: 'rewind' });
});

forwardBtn.addEventListener('click', () => {
  sendMessageToBackground({ action: 'forward' });
});

addTimestampBtn.addEventListener('click', async () => {
    // 1. Get the current time from the video
    const timeResponse = await sendMessageToBackground({ action: 'get_current_time' });
    if (!timeResponse) return;
    const currentTime = timeResponse.currentTime;

    // 2. Get the note text from the input field
    const noteText = highlightNoteInput.value.trim();
    if (noteText === "") {
        // Optional: You could show an alert or just do nothing
        highlightNoteInput.placeholder = "Please enter a note first!";
        return;
    }

    // 3. Create the new list item element
    const newHighlight = document.createElement('li');
    
    // Store the data in the element for later use (like saving)
    newHighlight.dataset.time = currentTime;
    newHighlight.dataset.note = noteText;

    // 4. Create the inner structure with styled spans
    newHighlight.innerHTML = `
        <span class="highlight-time">${formatTime(currentTime)}</span>
        <span class="highlight-note">${noteText}</span>
    `;

    // 5. Add a click listener to the whole item to seek the video
    newHighlight.addEventListener('click', () => {
        sendMessageToBackground({ action: 'seek_to_time', time: newHighlight.dataset.time });
    });
    
    // 6. Add the new highlight to the list and clear the input
    highlightsList.appendChild(newHighlight);
    highlightNoteInput.value = ''; // Clear the input for the next note
    highlightNoteInput.placeholder = "Type your note for the timestamp..."; // Reset placeholder
    saveData(); 
});

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     // Listen for the "new video" message from the background script
//     if (request.action === 'new_video_loaded') {
//         console.log("Sidebar: Received 'new_video_loaded' message. Updating UI.");
//         updateFullUI();
//     }
// });

updateFullUI();

// Listen for when the sidebar itself becomes visible/focused by the user
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'new_video_loaded') {
        
        console.log("Sidebar: Received 'new_video_loaded' signal. WAITING before updating UI...");

        setTimeout(() => {
            console.log("Sidebar: Wait is over. Calling updateFullUI now.");
            updateFullUI();
        }, 750); 
    }
    
});

generalNotes.addEventListener('input', saveData);
