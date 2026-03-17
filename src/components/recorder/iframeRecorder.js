const RECORDING_FRAME_RATE = 30;
const DISPLAY_MEDIA_OPTIONS = {
  video: {
    displaySurface: "browser",
    frameRate: { ideal: RECORDING_FRAME_RATE, max: RECORDING_FRAME_RATE },
  },
  audio: false,
  preferCurrentTab: true,
  selfBrowserSurface: "include",
  surfaceSwitching: "exclude",
  systemAudio: "exclude",
  monitorTypeSurfaces: "exclude",
};

let recorderModulesPromise;

function waitForVideoFrame(video) {
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const handleLoadedData = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error("No se pudo preparar la previsualizacion de captura."));
    };
    const cleanup = () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("error", handleError);
    };

    video.addEventListener("loadeddata", handleLoadedData, { once: true });
    video.addEventListener("error", handleError, { once: true });
  });
}

function evenSize(value) {
  const rounded = Math.max(2, Math.round(value));
  return rounded % 2 === 0 ? rounded : rounded + 1;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getCropRect({ iframe, sourceWidth, sourceHeight }) {
  const rect = iframe.getBoundingClientRect();
  const viewportWidth = Math.max(window.innerWidth, 1);
  const viewportHeight = Math.max(window.innerHeight, 1);
  const scaleX = sourceWidth / viewportWidth;
  const scaleY = sourceHeight / viewportHeight;

  const x = clamp(rect.left * scaleX, 0, sourceWidth);
  const y = clamp(rect.top * scaleY, 0, sourceHeight);
  const width = clamp(rect.width * scaleX, 1, sourceWidth - x);
  const height = clamp(rect.height * scaleY, 1, sourceHeight - y);

  return {
    x,
    y,
    width,
    height,
    outputWidth: evenSize(width),
    outputHeight: evenSize(height),
  };
}

function buildFileName(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  const stamp = [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "_",
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");

  return `vprecord_${stamp}.mp4`;
}

export function downloadBlob(blob, fileName) {
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = fileName;
  anchor.rel = "noopener";
  anchor.click();

  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
}

function toMp4Blob(buffer) {
  if (buffer instanceof Blob) {
    return buffer;
  }

  return new Blob([buffer], { type: "video/mp4" });
}

function estimateVideoBitrate(width, height, frameRate = RECORDING_FRAME_RATE) {
  const bitrate = width * height * frameRate * 4 * 0.07 * 0.75;
  const roundingFactor = bitrate < 1_000_000 ? 1000 : 1_000_000;
  return Math.round(bitrate / roundingFactor) * roundingFactor;
}

async function loadRecorderModules() {
  if (!recorderModulesPromise) {
    recorderModulesPromise = Promise.all([
      import("mediabunny"),
      import("media-codecs"),
    ]).then(([mediabunny, mediaCodecs]) => ({
      ...mediabunny,
      ...mediaCodecs,
    }));
  }

  return recorderModulesPromise;
}

function createCodecCandidates(AVC) {
  return [
    AVC.getCodec({ profile: "High", level: "5.2" }),
    AVC.getCodec({ profile: "Main", level: "5.2" }),
    AVC.getCodec({ profile: "Main", level: "4.2" }),
    AVC.getCodec({ profile: "Baseline", level: "4.2" }),
  ];
}

async function createMp4Recorder(canvas) {
  if (typeof window.VideoEncoder !== "function" || typeof window.VideoFrame !== "function") {
    throw new Error("Este navegador no soporta la grabacion MP4 directa requerida.");
  }

  const { Output, Mp4OutputFormat, BufferTarget, EncodedVideoPacketSource, EncodedPacket, AVC } =
    await loadRecorderModules();

  const codecCandidates = createCodecCandidates(AVC);
  let lastError;

  for (const codec of codecCandidates) {
    const output = new Output({
      format: new Mp4OutputFormat({ fastStart: "in-memory" }),
      target: new BufferTarget(),
    });

    const videoSource = new EncodedVideoPacketSource("avc");
    output.addVideoTrack(videoSource, { frameRate: RECORDING_FRAME_RATE });

    let encoderError;
    const encoder = new VideoEncoder({
      output: async (chunk, meta) => {
        await videoSource.add(EncodedPacket.fromEncodedChunk(chunk), meta);
      },
      error: (error) => {
        encoderError = error;
      },
    });

    try {
      const config = {
        codec,
        width: canvas.width,
        height: canvas.height,
        framerate: RECORDING_FRAME_RATE,
        bitrate: estimateVideoBitrate(canvas.width, canvas.height),
        bitrateMode: "variable",
        latencyMode: "realtime",
        hardwareAcceleration: "prefer-hardware",
      };

      const support = await VideoEncoder.isConfigSupported(config);
      if (!support.supported) {
        encoder.close();
        continue;
      }

      encoder.configure(support.config);

      let frameNumber = 0;
      let outputStarted = false;

      return {
        async step() {
          if (!outputStarted) {
            await output.start();
            outputStarted = true;
          }

          const frame = new VideoFrame(canvas, {
            timestamp: Math.round((frameNumber * 1_000_000) / RECORDING_FRAME_RATE),
            duration: Math.round(1_000_000 / RECORDING_FRAME_RATE),
          });

          encoder.encode(frame, {
            keyFrame: frameNumber % 60 === 0,
          });
          frame.close();
          frameNumber += 1;

          if (encoderError) {
            throw encoderError;
          }

          if (frameNumber % 15 === 0) {
            await encoder.flush();
          }
        },
        async stop() {
          await encoder.flush();
          if (encoderError) {
            throw encoderError;
          }

          await output.finalize();
          return output.target.buffer;
        },
        async dispose() {
          encoder.close();
        },
      };
    } catch (error) {
      lastError = error;
      try {
        encoder.close();
      } catch {
        // ignore encoder cleanup failures during codec probing
      }
    }
  }

  throw lastError ?? new Error("No se pudo inicializar el encoder MP4.");
}

function stopTracks(stream) {
  stream?.getTracks().forEach((track) => track.stop());
}

export async function createIframeRecorderSession({ iframe }) {
  if (!iframe) {
    throw new Error("No se encontro el iframe a grabar.");
  }

  if (!window.isSecureContext || !navigator.mediaDevices?.getDisplayMedia) {
    throw new Error("La grabacion requiere HTTPS y un navegador con getDisplayMedia.");
  }

  const captureStream = await navigator.mediaDevices.getDisplayMedia(DISPLAY_MEDIA_OPTIONS);
  const sourceVideoTrack = captureStream.getVideoTracks()[0];
  if (!sourceVideoTrack) {
    stopTracks(captureStream);
    throw new Error("No se obtuvo video desde la captura de pantalla.");
  }

  const previewVideo = document.createElement("video");
  previewVideo.srcObject = captureStream;
  previewVideo.muted = true;
  previewVideo.playsInline = true;
  await previewVideo.play();
  await waitForVideoFrame(previewVideo);

  const initialCrop = getCropRect({
    iframe,
    sourceWidth: previewVideo.videoWidth,
    sourceHeight: previewVideo.videoHeight,
  });

  const canvas = document.createElement("canvas");
  canvas.width = initialCrop.outputWidth;
  canvas.height = initialCrop.outputHeight;

  const context = canvas.getContext("2d", {
    alpha: false,
    desynchronized: true,
  });

  if (!context) {
    stopTracks(captureStream);
    throw new Error("No se pudo inicializar el canvas de grabacion.");
  }

  const fileName = buildFileName();
  let recorder;
  try {
    recorder = await createMp4Recorder(canvas);
  } catch (error) {
    stopTracks(captureStream);
    previewVideo.pause();
    previewVideo.srcObject = null;
    throw error;
  }

  let frameHandle = 0;
  let stoppingPromise;
  let stopped = false;
  let settled = false;
  let cleanedUp = false;
  let activeStepPromise = Promise.resolve();
  let resolveResult;
  let rejectResult;

  const settleFailure = (error) => {
    if (settled) return;
    settled = true;
    rejectResult(error instanceof Error ? error : new Error("La grabacion ha fallado."));
  };

  const settleSuccess = (value) => {
    if (settled) return;
    settled = true;
    resolveResult(value);
  };

  const cleanup = async () => {
    if (cleanedUp) return;
    cleanedUp = true;
    window.cancelAnimationFrame(frameHandle);
    stopTracks(captureStream);
    previewVideo.pause();
    previewVideo.srcObject = null;
    await recorder.dispose().catch(() => undefined);
  };

  const drawFrame = () => {
    const crop = getCropRect({
      iframe,
      sourceWidth: previewVideo.videoWidth,
      sourceHeight: previewVideo.videoHeight,
    });

    context.drawImage(
      previewVideo,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
  };

  const queueNextFrame = () => {
    if (stopped) return;

    frameHandle = window.requestAnimationFrame(() => {
      activeStepPromise = (async () => {
        drawFrame();
        await recorder.step();
      })();

      activeStepPromise
        .then(() => {
          queueNextFrame();
        })
        .catch(async (error) => {
          stopped = true;
          settleFailure(error);
          await cleanup();
        });
    });
  };

  const result = new Promise((resolve, reject) => {
    resolveResult = resolve;
    rejectResult = reject;
    drawFrame();

    activeStepPromise = recorder
      .step()
      .then(() => {
        queueNextFrame();
      })
      .catch(async (error) => {
        stopped = true;
        settleFailure(error);
        await cleanup();
      });
  });

  const stop = () => {
    if (!stoppingPromise) {
      stoppingPromise = (async () => {
        if (stopped) {
          return result;
        }

        stopped = true;
        window.cancelAnimationFrame(frameHandle);

        try {
          await activeStepPromise;
          const buffer = await recorder.stop();
          if (!buffer) {
            throw new Error("No se pudo generar el MP4.");
          }

          const payload = {
            blob: toMp4Blob(buffer),
            fileName,
          };
          settleSuccess(payload);
          return payload;
        } catch (error) {
          settleFailure(error);
          throw error;
        } finally {
          await cleanup();
        }
      })();
    }

    return stoppingPromise;
  };

  sourceVideoTrack.addEventListener("ended", () => {
    void stop();
  });

  return {
    stop,
    result,
  };
}
