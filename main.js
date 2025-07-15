let micStream = null;
let displayStream = null;
let audioContext = null;
let isCapturing = false;

function simulateEchoCancellation(micAnalyser, sysAnalyser) {
  const micData = new Uint8Array(micAnalyser.frequencyBinCount);
  const sysData = new Uint8Array(sysAnalyser.frequencyBinCount);

  function loop() {
    if (!isCapturing) return;

    micAnalyser.getByteFrequencyData(micData);
    sysAnalyser.getByteFrequencyData(sysData);

    let overlap = 0;
    for (let i = 0; i < micData.length; i++) {
      if (Math.abs(micData[i] - sysData[i]) < 10) {
        overlap++;
      }
    }

    if (overlap > 50) {
      console.log("⚠️ Echo overlap detected between mic and system audio");
    }

    requestAnimationFrame(loop);
  }

  loop();
}

async function startCapture() {
  document.getElementById("status").textContent = "🔄 Capturing...";
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  isCapturing = true;

  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const micSource = audioContext.createMediaStreamSource(micStream);

    displayStream = await navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: true,
    });

    const sysAudioTrack = displayStream.getAudioTracks().find(t => t.kind === 'audio');
    if (!sysAudioTrack) {
      throw new Error("❌ No system audio track found.");
    }

    const systemStream = new MediaStream([sysAudioTrack]);
    const systemSource = audioContext.createMediaStreamSource(systemStream);

    const micAnalyser = audioContext.createAnalyser();
    const sysAnalyser = audioContext.createAnalyser();

    micSource.connect(micAnalyser);
    systemSource.connect(sysAnalyser);

    const output = audioContext.createGain();
    micSource.connect(output);
    systemSource.connect(output);
    output.connect(audioContext.destination);

    simulateEchoCancellation(micAnalyser, sysAnalyser);

    document.getElementById("status").textContent = "✅ Capturing mic + system audio";
  } catch (err) {
    console.error("Capture failed:", err);
    document.getElementById("status").textContent = "❌ Capture failed: " + err.message;
    isCapturing = false;
  }
}

function stopCapture() {
  isCapturing = false;

  if (micStream) {
    micStream.getTracks().forEach(track => track.stop());
    micStream = null;
  }

  if (displayStream) {
    displayStream.getTracks().forEach(track => track.stop());
    displayStream = null;
  }

  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }

  document.getElementById("status").textContent = "⏹️ Capture stopped";
  console.log("🛑 All streams and context stopped");
}
