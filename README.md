## Root Cause of Echo/Bleed-in
Echo/bleed-in occurs when the system audio (e.g - a video or music playing through speakers) is picked up by the microphone.

Why this happens:
 - Physical feedback loop: The microphone captures sound from speakers.
 - Lack of isolation: In laptop devices or open-air audio setups, mic and speaker are physically close.
 - Software routing: On some OS configurations, virtual audio paths may route system sound into mic input.

## Concrete Algorithmic Approach
We evaluated various techniques and opted for a simplified simulation using frequency spectrum overlap.

  1. Cross-Correlation Echo Cancellation (CCEC)
  How it works:
    - Measure time delay between system audio and mic input using cross-correlation.
    - Subtract system audio from mic audio using the measured delay.
    - Pros: Works in real-time, good for linear echo.
    - Cons: Needs low-latency access to audio buffers (hard in browser).


  2. Adaptive Filtering (LMS/ANC)
  How it works:
    - Use a system like the Least Mean Squares (LMS) adaptive filter to “learn” and subtract echo from the mic.
    - Pros: Can handle complex echo paths.
    - Cons: Needs lots of samples and tuning; computationally expensive in JS.


  3. Spectral Subtraction
  How it works:
    - Convert audio to frequency domain (FFT), then subtract known system audio from mic spectrum.
    - Pros: Simple conceptually.
    - Cons: Introduces artifacts (e.g., musical noise), works better in non-real-time.



  4. Noise Gating
  How it works:
    - If mic volume is below a threshold, suppress it — assuming it's echo.
    - Pros: Lightweight.
    - Cons: Not true echo cancellation, just silencing.


### What We Used in Demo
 Echo Overlap Simulation via Spectrum Analysis
    - Captured both mic and system streams
    - Routed through AnalyserNode in Web Audio API
    - Compared frequency bin values using Euclidean distance
    - If similarity crosses threshold → flagged as echo overlap



### Decisions Made
  - Chosen JavaScript, since the task requires running inside a browser environment and directly uses Chrome MediaStream APIs.
  - getUserMedia({ audio: true }) – to capture microphone input.

    getDisplayMedia({ audio: true }) – to capture system audio via screen sharing.

    Web Audio API – for routing, analyzing, and simulating overlap between both streams.

  - To detect echo/bleed-in, we used the AnalyserNode to extract real-time frequency data from both mic and system audio.
  - Due to browser constraints (no direct access to raw PCM or DSP libraries), we simulated the separation rather than actually removing echo.


### Trade-offs
  - Simpler but less precise than real DSP echo cancellation
  - True separation would require native modules or WebAssembly


### Limitations
  - No True Echo Cancellation:
      - This implementation detects potential echo but does not remove it. Actual removal would need adaptive filters like LMS or Kalman filters.
   
  - Browser Permissions Required:
      - System audio capture needs user to manually approve screen sharing each time.

  - Performance & CPU Load
      - Analyzing frequency in real-time is lightweight, but a full DSP approach could introduce CPU overhead in the browser.

  - Platform-Specific Audio Behavior
      - System audio capture works best on macOS with screen sharing. Windows/Linux behavior varies.


Not done (requires advanced DSP / WebAssembly)

