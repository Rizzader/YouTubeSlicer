let player;
let videoLength = 0;

function onYouTubeIframeAPIReady() {
    // Player will be initialized when a valid URL is entered
}

function getYouTubeVideoId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : false;
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
    const audioOnlyCheckbox = document.getElementById('audio-only');
    const formatSelect = document.getElementById('format');
    const themeToggle = document.getElementById('theme-toggle');

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

    function validateYouTubeUrl(url) {
        return getYouTubeVideoId(url) !== false;
    }

    function validateTimeFormat(time) {
        const pattern = /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/;
        return pattern.test(time);
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Reset previous error states
        urlInput.classList.remove('border-red-500');
        startTimeInput.classList.remove('border-red-500');
        endTimeInput.classList.remove('border-red-500');
        
        let hasError = false;

        if (!validateYouTubeUrl(urlInput.value)) {
            urlInput.classList.add('border-red-500');
            alert('Please enter a valid YouTube URL');
            hasError = true;
        }

        if (!validateTimeFormat(startTimeInput.value)) {
            startTimeInput.classList.add('border-red-500');
            alert('Please enter a valid start time in HH:MM:SS format');
            hasError = true;
        }

        if (!validateTimeFormat(endTimeInput.value)) {
            endTimeInput.classList.add('border-red-500');
            alert('Please enter a valid end time in HH:MM:SS format');
            hasError = true;
        }

        if (!hasError) {
            // Handle video download logic here
            const videoId = getYouTubeVideoId(urlInput.value);
            const startTime = timeToSeconds(startTimeInput.value);
            const endTime = timeToSeconds(endTimeInput.value);
            const format = formatSelect.value;
            const isAudioOnly = audioOnlyCheckbox.checked;

            console.log('Downloading video clip...');
            console.log(`Video ID: ${videoId}, Start: ${startTime}, End: ${endTime}, Format: ${format}, Audio Only: ${isAudioOnly}`);
        }
    });

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });
});
