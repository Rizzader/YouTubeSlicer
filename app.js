let player;
let videoLength = 0;

function onYouTubeIframeAPIReady() {
    console.log("YouTube API is ready!");
    // YouTube API is ready for initialization, we will wait for the user to input a valid URL
}

function getYouTubeVideoId(url) {
    console.log("Extracting video ID from URL:", url);
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[7].length === 11) {
        console.log("Video ID found:", match[7]);
        return match[7];
    } else {
        console.log("Invalid YouTube URL, no video ID found.");
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
    console.log("DOM Loaded and Ready");

    const form = document.getElementById('youtube-form');
    const urlInput = document.getElementById('youtube-url');
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const videoPreview = document.getElementById('video-preview');
    const timeSlider = document.getElementById('time-slider');

    // When the YouTube URL input changes
    urlInput.addEventListener('input', function() {
        const videoId = getYouTubeVideoId(this.value);
        if (videoId) {
            console.log("Loading video:", videoId);
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

    // When the player is ready (i.e., the video has loaded)
    function onPlayerReady(event) {
        console.log("Player is ready");
        videoLength = player.getDuration();
        console.log("Video length (seconds):", videoLength);
        startTimeInput.value = '00:00:00';
        endTimeInput.value = formatTime(videoLength);
    }

    // Form submission event (to download)
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log("Form submitted");

        const startTime = timeToSeconds(startTimeInput.value);
        const endTime = timeToSeconds(endTimeInput.value);

        if (startTime >= endTime) {
            alert('Start time must be before end time.');
            return;
        }

        // Handle downloading the video clip (you can add this functionality later)
        console.log(`Download from ${startTimeInput.value} to ${endTimeInput.value}`);
    });
});
