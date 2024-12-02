document.getElementById('downloadVideo').addEventListener('click', () => {
  const url = document.getElementById('videoURL').value;
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;

  if (!url || !startTime || !endTime) {
    alert('Please provide all inputs.');
    return;
  }

  // Extract video ID from YouTube URL
  const videoId = new URL(url).searchParams.get('v');
  if (!videoId) {
    alert('Invalid YouTube URL.');
    return;
  }

  // Function to download and slice video (needs backend or ffmpeg.js implementation)
  alert(`Downloading video from ${startTime} to ${endTime}. Feature in progress.`);
});

document.getElementById('downloadAudio').addEventListener('click', () => {
  alert('Audio-only download feature in progress.');
});
