const screens = document.querySelectorAll('.screen');
const navButtons = document.querySelectorAll('[data-target]');
const backButton = document.querySelector('.back');
const carbonCount = document.getElementById('carbonCount');
const cameraButton = document.getElementById('cameraButton');
const demoScanButton = document.getElementById('demoScanButton');
const scanner = document.getElementById('scanner');
const camera = document.getElementById('camera');
const cameraStatus = document.getElementById('cameraStatus');
const gearResult = document.getElementById('gearResult');
let stream;
let detectionTimer;

function showScreen(id) {
  screens.forEach(screen => screen.classList.toggle('active', screen.id === id));
  document.querySelectorAll('.bottom-nav button').forEach(button => button.classList.toggle('nav-active', button.dataset.target === id));
  backButton.style.visibility = id === 'home' ? 'hidden' : 'visible';
  if (id !== 'gear') stopCamera();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navButtons.forEach(button => button.addEventListener('click', () => showScreen(button.dataset.target)));
backButton.addEventListener('click', () => showScreen('home'));

function revealGear() {
  gearResult.classList.remove('hidden');
  cameraStatus.textContent = 'QR코드를 인식했어요. 등록된 어구 정보를 확인하세요.';
  stopCamera();
  gearResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function stopCamera() {
  clearInterval(detectionTimer);
  detectionTimer = null;
  if (stream) stream.getTracks().forEach(track => track.stop());
  stream = null;
  scanner.classList.remove('camera-on');
  camera.srcObject = null;
  cameraButton.textContent = '카메라로 인식하기';
}

function startQrDetection() {
  if (!('BarcodeDetector' in window)) {
    cameraStatus.textContent = '카메라 화면을 켰습니다. 이 브라우저에서는 체험용 인식 버튼을 이용해 주세요.';
    return;
  }
  const detector = new BarcodeDetector({ formats: ['qr_code'] });
  detectionTimer = setInterval(async () => {
    if (!stream || camera.readyState < 2) return;
    try {
      const codes = await detector.detect(camera);
      if (codes.length) revealGear();
    } catch (_) {
      // A new camera frame can be unavailable briefly; keep scanning the next one.
    }
  }, 500);
}

cameraButton.addEventListener('click', async () => {
  if (stream) return stopCamera();
  if (!navigator.mediaDevices?.getUserMedia) {
    cameraStatus.textContent = '이 브라우저에서는 카메라를 지원하지 않습니다. 체험용 인식을 이용해 주세요.';
    return;
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
    camera.srcObject = stream;
    scanner.classList.add('camera-on');
    cameraButton.textContent = '카메라 끄기';
    cameraStatus.textContent = 'QR코드를 네모 안에 맞춰주세요.';
    startQrDetection();
  } catch (error) {
    cameraStatus.textContent = '카메라 권한이 필요합니다. 권한을 허용하거나 체험용 인식을 이용해 주세요.';
  }
});
demoScanButton.addEventListener('click', revealGear);

let carbon = 0;
const targetCarbon = 2846;
function countCarbon() {
  carbon = Math.min(targetCarbon, carbon + 47);
  carbonCount.textContent = carbon.toLocaleString('ko-KR');
  if (carbon < targetCarbon) requestAnimationFrame(countCarbon);
}
countCarbon();
