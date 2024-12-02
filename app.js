let player;
let videoLength = 0;
let isDraggingStart = false;
let isDraggingEnd = false;

function onYouTubeIframeAPIReady() {
    console.log("YouTube API is ready!");
}

function getYouTubeVideoId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[7].length === 11) {
        return match[7];
    } else {
        return false;
    }
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function timeToSeconds(timeStr) {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}

document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('youtube-url');
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const timeSlider = document.getElementById('time-slider');
    const videoPreview = document.getElementById('video-preview');

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
    }

    // Update start time slider
    startTimeInput.addEventListener('input', function() {
        if (!isDraggingStart) {
            player.seekTo(timeToSeconds(startTimeInput.value));
        }
    });

    // Update end time slider
    endTimeInput.addEventListener('input', function() {
        if (!isDraggingEnd) {
            player.seekTo(timeToSeconds(endTimeInput.value));
        }
    });

    // Update sliders when player time changes
    player.addEventListener('onStateChange', function() {
        const currentTime = player.getCurrentTime();
        startTimeInput.value = formatTime(currentTime);
        endTimeInput.value = formatTime(videoLength);
    });

    // Slider change event (to drag the slider)
    timeSlider.addEventListener('input', function() {
        const startSeconds = timeToSeconds(startTimeInput.value);
        const endSeconds = timeToSeconds(endTimeInput.value);

        // Update the video player and sliders when dragging
      
