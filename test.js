// Select the audio player and background div
const audio = document.getElementById("audio-player");
const background = document.querySelector(".background");

// Create AudioContext and analyzer
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyzer = audioContext.createAnalyser();
analyzer.fftSize = 256;

// Create an audio source from the audio element
const source = audioContext.createMediaElementSource(audio);
source.connect(analyzer);
analyzer.connect(audioContext.destination);

const dataArray = new Uint8Array(analyzer.frequencyBinCount);

// Function to change the background based on music data
function updateBackground() {
  analyzer.getByteFrequencyData(dataArray);

  // Get the average volume from the frequency data
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i];
  }
  const average = sum / dataArray.length;

  // Map the average volume to a color intensity (0 to 255)
  const intensity = Math.min(Math.max(average, 50), 255);
  background.style.backgroundColor = `rgb(${intensity}, 50, 50)`;

  requestAnimationFrame(updateBackground);
}

// Start the audio context when the audio plays
audio.addEventListener("play", () => {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  requestAnimationFrame(updateBackground);
});
