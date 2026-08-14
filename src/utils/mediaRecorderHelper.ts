/**
 * Client-Side Media Processing Helper
 * Creates MP4 / WebM video streams using HTML5 Canvas, Web Audio API, and MediaRecorder
 */

export interface AudioToVideoOptions {
  visualizerType: 'bars' | 'wave' | 'circle' | 'artwork';
  backgroundImage?: HTMLImageElement | null;
  backgroundColor: string;
  accentColor: string;
  title: string;
  fps: number;
  width: number;
  height: number;
}

export async function convertAudioToVideo(
  audioFile: File,
  options: AudioToVideoOptions,
  onProgress?: (percent: number, message: string) => void
): Promise<Blob> {
  onProgress?.(10, 'Decoding audio track...');
  const arrayBuffer = await audioFile.arrayBuffer();
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  const duration = audioBuffer.duration;
  const { width, height, fps, backgroundColor, accentColor, visualizerType, backgroundImage } = options;

  onProgress?.(30, 'Setting up video canvas & renderer...');

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Create offline source / analyser
  const offlineCtx = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);

  // Setup live audio for recording
  const dest = audioCtx.createMediaStreamDestination();
  const liveSource = audioCtx.createBufferSource();
  liveSource.buffer = audioBuffer;

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  liveSource.connect(analyser);
  analyser.connect(dest);

  // Canvas stream
  const canvasStream = canvas.captureStream(fps);
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...dest.stream.getAudioTracks()
  ]);

  // Determine supported mime type for video
  const mimeTypes = [
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm'
  ];

  let selectedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';

  const recorder = new MediaRecorder(combinedStream, {
    mimeType: selectedMimeType,
    videoBitsPerSecond: 3000000 // 3 Mbps
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      audioCtx.close();
      const outputBlob = new Blob(chunks, { type: selectedMimeType.includes('mp4') ? 'video/mp4' : 'video/mp4' });
      onProgress?.(100, 'Video generated successfully!');
      resolve(outputBlob);
    };

    recorder.onerror = (err) => {
      audioCtx.close();
      reject(err);
    };

    recorder.start(100);
    liveSource.start(0);

    const startTime = performance.now();
    const totalDurationMs = duration * 1000;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      const elapsed = performance.now() - startTime;
      const progressPercent = Math.min(100, Math.round((elapsed / totalDurationMs) * 100));
      onProgress?.(30 + Math.round(progressPercent * 0.65), `Rendering video frame (${Math.round(elapsed / 1000)}s / ${Math.round(duration)}s)...`);

      // Clear Canvas
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      // Draw custom background image if provided
      if (backgroundImage) {
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.drawImage(backgroundImage, 0, 0, width, height);
        ctx.restore();
      }

      // Draw Title and metadata
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${Math.round(width * 0.035)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(options.title || audioFile.name.replace(/\.[^/.]+$/, ''), width / 2, height * 0.25);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = `${Math.round(width * 0.02)}px sans-serif`;
      ctx.fillText('All-In-One Converter • Audio Visualizer', width / 2, height * 0.3);

      analyser.getByteFrequencyData(dataArray);

      // Render selected visualizer style
      if (visualizerType === 'wave') {
        ctx.beginPath();
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 4;
        const sliceWidth = width / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * (height * 0.2)) + (height * 0.55);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.stroke();
      } else if (visualizerType === 'circle') {
        const centerX = width / 2;
        const centerY = height * 0.6;
        const radius = Math.min(width, height) * 0.18;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();

        for (let i = 0; i < bufferLength; i += 2) {
          const rad = (i / bufferLength) * 2 * Math.PI;
          const barHeight = (dataArray[i] / 255) * 60;
          const x1 = centerX + Math.cos(rad) * radius;
          const y1 = centerY + Math.sin(rad) * radius;
          const x2 = centerX + Math.cos(rad) * (radius + barHeight);
          const y2 = centerY + Math.sin(rad) * (radius + barHeight);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      } else {
        // Bars visualizer (default)
        const barWidth = (width * 0.8) / bufferLength;
        const startX = width * 0.1;
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * (height * 0.35);
          ctx.fillStyle = accentColor;
          ctx.fillRect(startX + i * barWidth, height * 0.75 - barHeight, barWidth - 2, barHeight);
        }
      }

      if (elapsed < totalDurationMs) {
        requestAnimationFrame(draw);
      } else {
        setTimeout(() => {
          if (recorder.state !== 'inactive') {
            recorder.stop();
          }
        }, 500);
      }
    };

    draw();
  });
}

/**
 * Transcodes MOV or any browser-playable video into universal MP4/WebM
 */
export async function transcodeMovToMp4(
  videoFile: File,
  targetWidth: number = 1280,
  targetHeight: number = 720,
  onProgress?: (percent: number, message: string) => void
): Promise<Blob> {
  onProgress?.(10, 'Loading QuickTime MOV video stream...');
  const videoUrl = URL.createObjectURL(videoFile);
  const video = document.createElement('video');
  video.muted = false;
  video.playsInline = true;
  video.src = videoUrl;

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error('Failed to parse MOV video. The codec or container is unsupported by the browser.'));
  });

  const duration = video.duration || 1;
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d')!;

  onProgress?.(25, 'Configuring MP4 encoder...');

  const canvasStream = canvas.captureStream(30);

  // Audio track extraction
  let audioTracks: MediaStreamTrack[] = [];
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const sourceNode = audioCtx.createMediaElementSource(video);
    const dest = audioCtx.createMediaStreamDestination();
    sourceNode.connect(dest);
    sourceNode.connect(audioCtx.destination);
    audioTracks = dest.stream.getAudioTracks();
  } catch (e) {
    // Audio might not be available or cross-origin
  }

  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...audioTracks
  ]);

  const mimeTypes = [
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm'
  ];
  const selectedMime = mimeTypes.find(t => MediaRecorder.isTypeSupported(t)) || 'video/webm';

  const recorder = new MediaRecorder(combinedStream, {
    mimeType: selectedMime,
    videoBitsPerSecond: 3500000
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      URL.revokeObjectURL(videoUrl);
      const outBlob = new Blob(chunks, { type: selectedMime.includes('mp4') ? 'video/mp4' : 'video/mp4' });
      onProgress?.(100, 'MOV to MP4 transcoding complete!');
      resolve(outBlob);
    };

    recorder.onerror = (e) => {
      URL.revokeObjectURL(videoUrl);
      reject(e);
    };

    recorder.start(100);
    video.currentTime = 0;
    video.play();

    const updateFrame = () => {
      if (video.ended || video.currentTime >= duration) {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
        return;
      }

      ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
      const percent = Math.min(99, Math.round(25 + (video.currentTime / duration) * 70));
      onProgress?.(percent, `Transcoding video frame (${Math.round(video.currentTime)}s / ${Math.round(duration)}s)...`);

      requestAnimationFrame(updateFrame);
    };

    updateFrame();
  });
}
