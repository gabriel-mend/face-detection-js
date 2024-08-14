const video = document.getElementById('video')
const toggleButton = document.getElementById('toggle-button')
const videoContainer = document.getElementById('video-container')

async function startVideo() {
  const videoStream = await navigator.mediaDevices.getUserMedia({video: true})
  video.srcObject = videoStream
}


Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./face-api.js/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./face-api.js/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('./face-api.js/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('./face-api.js/models')
])
.then(async () => {
  startVideo()
  console.log('Models Loaded')
})
.catch(error => {
  console.error('Error to load models:', error);
});

function initIntervalDetections(canvas, displaySize) {
  setInterval(async () => {
    const detectionsWithLandmarks = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
    
    const resizedResults = await faceapi.resizeResults(detectionsWithLandmarks, displaySize)
    canvas.getContext("2d", { willReadFrequently: true }).clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedResults)
    faceapi.draw.drawFaceLandmarks(canvas, resizedResults)
    faceapi.draw.drawFaceExpressions(canvas, resizedResults)
  }, 100)
}

toggleButton.addEventListener("click", async function startRecognition() {
  let intervalDetectios = 0
  if(toggleButton.classList.length === 0) {
    toggleButton.textContent = "STOP RECOGNITION"
    toggleButton.style.backgroundColor = "var(--danger)"
    const canvas = faceapi.createCanvasFromMedia(video)
    videoContainer.appendChild(canvas)
    const displaySize = { width: video.clientWidth, height: video.clientHeight }
    faceapi.matchDimensions(canvas, displaySize)
    intervalDetectios = initIntervalDetections(canvas, displaySize)
  } else {
    clearInterval(intervalDetectios)
    toggleButton.textContent = "PLAY RECOGNITION"
    toggleButton.style.backgroundColor = "var(--primary)"
  } 
  toggleButton.classList.toggle('active')
})