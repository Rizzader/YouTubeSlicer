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
async function fetchDownloadLink(videoId) {
  const apiUrl = `https://api.y2mate.com/youtube-api/video?id=${videoId}`; // Example API

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Find the highest-quality download link
    const downloadUrl = data.result.video[0].url;
    return downloadUrl;
  } catch (error) {
    alert('Error fetching download link. Please try again.');
    throw error;
  }
}

document.getElementById('downloadVideo').addEventListener('click', async () => {
  const url = document.getElementById('videoURL').value;
  const videoId = new URL(url).searchParams.get('v');

  if (!videoId) {
    alert('Invalid YouTube URL.');
    return;
  }

  try {
    const downloadUrl = await fetchDownloadLink(videoId);
    window.location.href = downloadUrl; // Redirects to the download link
  } catch (error) {
    console.error(error);
  }
});
