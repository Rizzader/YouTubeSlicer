// Wait for the document to be ready
document.addEventListener('DOMContentLoaded', function () {
    const urlInput = document.getElementById('youtube-url');
    const loadButton = document.getElementById('load-video');
    const videoPreview = document.getElementById('player');
    const timeSlider = document.getElementById('time-slider');
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const downloadButton = document.getElementById('download-button');

    let player;
    let isDragging = false;
    let activeHandle = null;
    let startTime = 0;
    let endTime = 0;
    let videoDuration = 0;

    // Function to extract YouTube video ID from URL
    function getYouTubeVideoId(url) {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|\S+\/\S+\/|\S+\/\S+\/\S+\/|\S+\S+[\&\?])|youtu\.be\/([a-zA-Z0-9_-]{11}))/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    // Function to load YouTube video using Iframe API
    function onYouTubeIframeAPIReady() {
        loadButton.addEventListener('click', function () {
            const videoId = getYouTubeVideoId(urlInput.value);
            if (videoId) {
                if (player) {
                    player.loadVideoById(videoId);
                } else {
                    player = new YT.Player('player', {
                        height: '360',
                        width: '640',
                        videoId: videoId,
                        events: {
                            'onReady': onPlayerReady,
                            'onStateChange': onPlayerStateChange,
                        }
                    });
                }
                videoPreview.classList.remove('hidden');
                timeSlider.classList.remove('hidden');
            } else {
                alert('Invalid YouTube URL');
            }
        });
    }

    // Function that runs when the player is ready
    function onPlayerReady(event) {
        videoDuration = event.target.getDuration();
        startTimeInput.addEventListener('input', function () {
            startTime = parseFloat(startTimeInput.value) || 0;
        });
        endTimeInput.addEventListener('input', function () {
            endTime = parseFloat(endTimeInput.value) || videoDuration;
        });
    }

    // Function that updates slider and player when video state changes
    function onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.PLAYING) {
            updateSlider();
        }
    }

    // Function to update the slider
    function updateSlider() {
        const sliderTrack = document.getElementById('slider-track');
        const sliderWidth = sliderTrack.offsetWidth;

        const startHandle = document.getElementById('start-handle');
        const endHandle = document.getElementById('end-handle');
        const selectedRange = document.getElementById('selected-range');

        startHandle.style.left = `${(startTime / videoDuration) * 100}%`;
        endHandle.style.left = `${(endTime / videoDuration) * 100}%`;

        selectedRange.style.left = `${(startTime / videoDuration) * 100}%`;
        selectedRange.style.width = `${((endTime - startTime) / videoDuration) * 100}%`;

        updateTimeTooltip();
    }

    // Function to update the time tooltip
    function updateTimeTooltip() {
        const tooltip = document.getElementById('time-tooltip');
        if (isDragging && activeHandle) {
            const currentTime = activeHandle === startHandle ? startTime : endTime;
            tooltip.innerText = currentTime.toFixed(2) + 's';
            tooltip.style.display = 'block';
        } else {
            tooltip.style.display = 'none';
        }
    }

    // Event listeners for handling slider dragging
    const startHandle = document.getElementById('start-handle');
    const endHandle = document.getElementById('end-handle');

    startHandle.addEventListener('mousedown', startDrag);
    endHandle.addEventListener('mousedown', startDrag);

    function startDrag(event) {
        isDragging = true;
        activeHandle = event.target;
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', stopDrag);
    }

    function handleDrag(event) {
        const sliderTrack = document.getElementById('slider-track');
        const sliderRect = sliderTrack.getBoundingClientRect();
        let
