chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const video = document.querySelector('video');

    if (!video) {
        sendResponse({ error: "No video element found." });
        return true; 
    }

    if (request.action === 'get_video_details') {
        const videoId = new URLSearchParams(window.location.search).get('v');
        let videoTitle = '';

        try {
            videoTitle = document.querySelector("#info-contents h1.title").innerText;
        } catch (error) {
            console.warn("Could not find the primary title element, falling back to document.title.");
            videoTitle = document.title.replace(' - YouTube', '');
        }

        sendResponse({
            title: videoTitle,
            isPaused: video.paused,
            currentTime: video.currentTime,
            duration: video.duration,
            videoId: videoId
        });
    }if (request.action === 'get_video_details') {
    // Add a simple delay to give YouTube's page scripts time to update the title.
    setTimeout(() => {
        const video = document.querySelector('video');
        const videoId = new URLSearchParams(window.location.search).get('v');
        let videoTitle = '';

        try {
            // Try to get the title from the reliable <h1> element.
            videoTitle = document.querySelector("#info-contents h1.title").innerText;
        } catch (error) {
            // Fallback for safety.
            videoTitle = document.title.replace(' - YouTube', '');
        }

        sendResponse({
            title: videoTitle,
            isPaused: video ? video.paused : true,
            currentTime: video ? video.currentTime : 0,
            duration: video ? video.duration : 0,
            videoId: videoId
        });

    }, 500); 

    return true; 
}

    else if (request.action === 'get_current_time') {
        sendResponse({
            currentTime: video.currentTime,
            isPaused: video.paused,
            duration: video.duration
        });
    }
    else if (request.action === 'seek_to_time') {
        video.currentTime = request.time;
        sendResponse({ status: 'seeked' });
    }
    else if (request.action === 'play_pause') {
        video.paused ? video.play() : video.pause();
        sendResponse({ status: video.paused ? "paused" : "playing" });
    } else if (request.action === 'rewind') {
        video.currentTime -= 10;
        sendResponse({ currentTime: video.currentTime });
    } else if (request.action === 'forward') {
        video.currentTime += 10;
        sendResponse({ currentTime: video.currentTime });
    }

    return true; 
});