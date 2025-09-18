
let activeYouTubeTabId = null;

function findYouTubeTabWithRetry(maxRetries = 5, delay = 300) {
    return new Promise((resolve, reject) => {
        let attempts = 0;

        const tryToFind = async () => {
            attempts++;
            console.log(`Attempt #${attempts} to find an active YouTube tab...`);

            const [activeTab] = await chrome.tabs.query({ active: true, url: "*://*.youtube.com/watch?v=*" });

            if (activeTab) {
                console.log(`Success! Found YouTube tab ID: ${activeTab.id}`);
                resolve(activeTab.id);
            } else if (attempts >= maxRetries) {
                console.error("Failed to find an active YouTube tab after max retries.");
                reject("No active YouTube video found. Please ensure a video is playing in your current tab.");
            } else {
                setTimeout(tryToFind, delay);
            }
        };

        tryToFind();
    });
}

async function handleTabUpdate(tabId) {
    try {
        const tab = await chrome.tabs.get(tabId);

        if (tab && tab.url && tab.url.includes("youtube.com/watch")) {
            // Only update and notify if the ID has actually changed.
            if (activeYouTubeTabId !== tab.id) {
                console.log(`Background: Switching control to YouTube tab ID: ${tab.id}`);
                activeYouTubeTabId = tab.id;
            }
            console.log("Notifying sidebar of a new video load.");
            chrome.runtime.sendMessage({ action: 'new_video_loaded' });
        }
        
    } catch (error) {
        console.warn(`Could not get tab details for ID ${tabId}.`, error);
    }
}


chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
        handleTabUpdate(tabs[0].id);
    }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
    handleTabUpdate(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (
        changeInfo.status === 'complete' &&
        tab.url &&
        tab.url.includes("youtube.com/watch")
    ) {
        console.log(`Tab ${tabId} has finished loading a YouTube video.`);
        
        handleTabUpdate(tabId);
    }

});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === activeYouTubeTabId) {
    activeYouTubeTabId = null;
  }
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const handleMessage = async () => {
        if (!activeYouTubeTabId) {
            const [activeTab] = await chrome.tabs.query({ active: true, url: "*://*.youtube.com/watch?v=*"});
            if (activeTab) {
                activeYouTubeTabId = activeTab.id;
            } else {
                sendResponse({ error: "No active YouTube tab found." });
                return;
            }
        }

        chrome.tabs.sendMessage(activeYouTubeTabId, request, async (response) => {
            if (chrome.runtime.lastError && chrome.runtime.lastError.message.includes("Receiving end does not exist")) {
                console.warn("Content script not found. Injecting it now...");
                
                try {
                    // Inject the content script programmatically.
                    await chrome.scripting.executeScript({
                        target: { tabId: activeYouTubeTabId },
                        files: ['content.js'],
                    });
                    
                    console.log("Injection successful. Retrying message...");
                    chrome.tabs.sendMessage(activeYouTubeTabId, request, (finalResponse) => {
                        if (chrome.runtime.lastError) {
                            console.error("Error after retry:", chrome.runtime.lastError.message);
                            sendResponse({ error: "Failed to connect to content script even after injection." });
                        } else {
                            sendResponse(finalResponse);
                        }
                    });
                } catch (e) {
                    console.error("Failed to inject script:", e);
                    sendResponse({ error: "Failed to inject content script." });
                }

            } else {
                sendResponse(response);
            }
        });
    };

    handleMessage();
    return true; 
});





chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));