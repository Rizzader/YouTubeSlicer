let player;
let videoLength = 0;

// Function to initialize YouTube player (triggered when API is ready)
function onYouTubeIframeAPIReady() {}

// Extract YouTube Video ID from URL
function getYouTubeVideoId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : false;
}

// Format seconds to HH:MM:SS
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Convert HH:MM:SS to seconds
function timeToSeconds(timeStr) {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}

// Event listener for when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('youtube-form');
    const urlInput = document.getElementById('youtube-url');
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const videoPreview = document.getElementById('video-preview');
    const timeSlider = document.getElementById('time-slider');
    const startHandle = document.getElementById('start-handle');
    const endHandle = document.getElementById('end-handle');
    const sliderTrack = document.getElementById('slider-track');
    const selectedRange = document.getElementById('selected-range');
    const timeTooltip = document.getElementById('time-tooltip');

    let isDragging = false;
    let activeHandle = null;

    urlInput.addEventListener('input', function() {
        const videoId = getYouTubeVideoId(this.value);
        if (videoId) {
            if (player) {
                player.loadVideoById(videoId);
            } else {
                player = new YT.Player('player', {
                    height: '360',
                    width: '640',
                    videoId: videoId,
                    events: {
                        'onStateChange': onPlayerStateChange,
                        'onReady': onPlayerReady
                    }
                });
            }
            videoPreview.classList.remove('hidden');
            timeSlider.classList.remove('hidden');
        } else {
            videoPreview.classList.add('hidden');
            timeSlider.classList.add('hidden');
        }
    });

    function onPlayerReady(event) {
        videoLength = player.getDuration();
        startTimeInput.value = '00:00:00';
        endTimeInput.value = formatTime(videoLength);
        updateSliderPositions();
    }

    function onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.PAUSED) {
            const currentTime = player.getCurrentTime();
            const activeInput = document.activeElement;
            if (activeInput === startTimeInput || activeInput === endTimeInput) {
                activeInput.value = formatTime(currentTime);
                updateSliderPositions();
            }
        }
    }

    function updateSliderPositions() {
        const startTime = timeToSeconds(startTimeInput.value);
        const endTime = timeToSeconds(endTimeInput.value);
        const startPercent = (startTime / videoLength) * 100;
        const endPercent = (endTime / videoLength) * 100;
        
        startHandle.style.left = `${startPercent}%`;
        endHandle.style.left = `${endPercent}%`;
        selectedRange.style.left = `${startPercent}%`;
        selectedRange.style.width = `${endPercent - startPercent}%`;
    }

    // Drag functionality for time handles
    function handleDrag(e) {
        if (!isDragging || !activeHandle) return;
        
        const rect = sliderTrack.getBoundingClientRect();
        let position = (e.clientX - rect.left) / rect.width;
        position = Math.max(0, Math.min(1, position));
        
        const currentTime = position * videoLength;
        const formattedTime = formatTime(currentTime);
        
        if (activeHandle === startHandle) {
            const endTime = timeToSeconds(endTimeInput.value);
            if (currentTime < endTime) {
                startTimeInput.value = formattedTime;
                player.seekTo(currentTime);
            }
        } else {
            const startTime = timeToSeconds(startTimeInput.value);
            if (currentTime > startTime) {
                endTimeInput.value = formattedTime;
                player.seekTo(currentTime);
            }
        }
        
        updateSliderPositions();
        
        // Update tooltip
        timeTooltip.textContent = formattedTime;
        timeTooltip.style.left = `${position * 100}%`;
    }

    startHandle.addEventListener('mousedown', (e) => {
        isDragging = true;
        activeHandle = startHandle;
        timeTooltip.classList.remove('hidden');
    });

    endHandle.addEventListener('mousedown', (e) => {
        isDragging = true;
        activeHandle = endHandle;
        timeTooltip.classList.remove('hidden');
    });

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', () => {
        isDragging = false;
        activeHandle = null;
        timeTooltip.classList.add('hidden');
    });

    // Form validation and download
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validation
        if (!getYouTubeVideoId(urlInput.value)) {
            alert('Please enter a valid YouTube URL.');
            return;
        }

        const videoId = getYouTubeVideoId(urlInput.value);

        // Fetch download link
        fetch(`https://api.y2mate.com/youtube-api/video?id=${videoId}`)
            .then(response => response.json())
            .then(data => {
                const downloadUrl = data.result.video[0].url;
                window.location.href = downloadUrl;
            })
            .catch(error => {
                alert('Error fetching download link.');
                console.error(error);
            });
    });
});
