let player;
let videoLength = 0;

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
    const startSlider = document.getElementById('start-slider');
    const endSlider = document.getElementById('end-slider');
    const timeSliderContainer = document.getElementById('time-slider-container');
    const videoPreview = document.getElementById('video-preview');

    urlInput.addEventListener('input', function() {
        const videoId = getYouTubeVideoId(this.value);
        if (videoId) {
            if (player) {
                player.loadVideoById(videoId);
            } else {
                player = new YT.Player('player', {
                    height: '450',
                    width: '100%',
                    videoId: videoId,
                    events: {
                        'onReady': onPlayerReady
                    }
                });
            }
            videoPreview.classList.remove('hidden');
            timeSliderContainer.classList.remove('hidden');
        } else {
            videoPreview.classList.add('hidden');
            timeSliderContainer.classList.add('hidden');
        }
    });

    function onPlayerReady(event) {
        videoLength = player.getDuration();
        startTimeInput.value = '00:00:00';
        endTimeInput.value = formatTime(videoLength);
        startSlider.max = videoLength;
        endSlider.max = videoLength;
    }

    // Update start time slider
    startSlider.addEventListener('input', function() {
        player.seekTo(startSlider.value);
        startTimeInput.value = formatTime(player.getCurrentTime());
    });

    // Update end time slider
    endSlider.addEventListener('input', function() {
        player.seekTo(endSlider.value);
        endTimeInput.value = formatTime(player.getCurrentTime());
    });

    // Update text inputs based on slider values
    startTimeInput.addEventListener('input', function() {
        startSlider.value = timeToSeconds(startTimeInput.value);
        player.seekTo(startSlider.value);
    });

    endTimeInput.addEventListener('input', function() {
        endSlider.value = timeToSeconds(endTimeInput.value);
        player.seekTo(endSlider.value);
    });

    // Ensure video scales correctly on resize
    window.addEventListener('resize', function() {
        const playerElement = document.getElementById('player');
        playerElement.style.width = '100%'; // Make sure it takes the full width
        const containerWidth = playerElement.offsetWidth;
        playerElement.style.height = `${containerWidth * (9/16)}px`; // Adjust the height based on width (16:9 ratio)
    });
});
