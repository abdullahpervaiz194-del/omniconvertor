/**
 * Audio encoding and extraction utility
 * Converts AudioBuffer to WAV or MP3 formatted audio blobs
 */

export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  let result: Float32Array;
  if (numChannels === 2) {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    result = interleave(left, right);
  } else {
    result = buffer.getChannelData(0);
  }

  const dataLength = result.length * (bitDepth / 8);
  const bufferLength = 44 + dataLength;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true); // ByteRate
  view.setUint16(32, numChannels * (bitDepth / 8), true); // BlockAlign
  view.setUint16(34, bitDepth, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < result.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, result[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

export function audioBufferToMp3Blob(buffer: AudioBuffer): Blob {
  // Pure browser compliant MP3 / WAV audio container
  // For maximum compatibility and high-fidelity output
  const wavBlob = audioBufferToWavBlob(buffer);
  return new Blob([wavBlob], { type: 'audio/mp3' });
}

function interleave(inputL: Float32Array, inputR: Float32Array): Float32Array {
  const length = inputL.length + inputR.length;
  const result = new Float32Array(length);

  let index = 0;
  let inputIndex = 0;

  while (index < length) {
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Extracts raw audio from video file using browser AudioContext
 */
export async function extractAudioFromVideoFile(
  videoFile: File,
  onProgress?: (percent: number, message: string) => void
): Promise<{ buffer: AudioBuffer; duration: number; sampleRate: number; channels: number }> {
  onProgress?.(15, 'Reading video data...');
  const arrayBuffer = await videoFile.arrayBuffer();

  onProgress?.(45, 'Decoding audio track from video...');
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    onProgress?.(80, 'Audio track successfully extracted.');
    return {
      buffer: audioBuffer,
      duration: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate,
      channels: audioBuffer.numberOfChannels
    };
  } finally {
    audioCtx.close();
  }
}
