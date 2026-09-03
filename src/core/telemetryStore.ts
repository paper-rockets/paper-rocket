/**
 * High-Frequency Telemetry Store
 *
 * The render loop produces camera pose and FPS updates every single frame. Feeding
 * those into React state re-renders the whole application tree 60-120 times a
 * second, which on a low-power tablet costs more than the 3D rendering itself.
 *
 * This module is a tiny synchronous pub/sub: the engine writes into a mutable
 * snapshot, and only components that actually display the value subscribe. Leaf
 * components read it with useSyncExternalStore or write straight to a DOM node,
 * so nothing above them re-renders.
 */

export interface CameraPose {
  radius: number;
  theta: number;
  phi: number;
}

type Listener = () => void;

/** Live camera pose. Mutated in place by the engine - never store the object itself. */
const cameraPose: CameraPose = { radius: 3.5, theta: Math.PI / 4, phi: Math.PI / 3 };
const cameraListeners = new Set<Listener>();

let fps = 60;
const fpsListeners = new Set<Listener>();

function notify(listeners: Set<Listener>): void {
  for (const listener of listeners) {
    try {
      listener();
    } catch (e) {
      console.warn('Telemetry listener error:', e);
    }
  }
}

// --- Camera pose --------------------------------------------------------

/** Called by the engine's render loop. Allocation-free. */
export function publishCameraPose(radius: number, theta: number, phi: number): void {
  if (cameraPose.radius === radius && cameraPose.theta === theta && cameraPose.phi === phi) {
    return;
  }
  cameraPose.radius = radius;
  cameraPose.theta = theta;
  cameraPose.phi = phi;
  notify(cameraListeners);
}

/**
 * Reads the live pose. The returned object is shared and mutable, so copy the
 * fields you need rather than retaining the reference.
 */
export function getCameraPose(): Readonly<CameraPose> {
  return cameraPose;
}

export function subscribeCameraPose(listener: Listener): () => void {
  cameraListeners.add(listener);
  return () => {
    cameraListeners.delete(listener);
  };
}

// --- Frame rate & Input Lag Telemetry -----------------------------------

export interface InputTelemetry {
  /** Input queue delay in ms: performance.now() - event.timeStamp */
  inputLagMs: number;
  /** JavaScript stroke computation & geometry update time in ms */
  strokeProcessMs: number;
  /** Current frame duration in ms */
  frameTimeMs: number;
  /** Estimated total event-to-render latency in ms */
  eventToRenderMs: number;
  /** Number of coalesced sub-pixel hardware samples */
  coalescedCount: number;
  /** Active pointer device: 'pen' | 'touch' | 'mouse' */
  pointerType: string;
  /** Peak input lag recorded (ms) */
  peakLagMs: number;
  /** Recent history for sparkline graph (fixed 32 points) */
  history: number[];
}

const inputTelemetry: InputTelemetry = {
  inputLagMs: 0,
  strokeProcessMs: 0,
  frameTimeMs: 16.6,
  eventToRenderMs: 0,
  coalescedCount: 1,
  pointerType: 'mouse',
  peakLagMs: 0,
  history: new Array(32).fill(0),
};

const inputListeners = new Set<Listener>();
let lastInputNotifyTime = 0;

/** Throttled input telemetry publisher (max 15Hz to keep React overhead at 0) */
export function recordInputTelemetry(
  queueLagMs: number,
  processMs: number,
  coalesced: number = 1,
  pointerType: string = 'mouse'
): void {
  const cleanQueueLag = Math.min(500, Math.max(0, queueLagMs));
  const cleanProcess = Math.min(200, Math.max(0, processMs));
  
  inputTelemetry.inputLagMs = cleanQueueLag;
  inputTelemetry.strokeProcessMs = cleanProcess;
  inputTelemetry.eventToRenderMs = cleanQueueLag + cleanProcess + (inputTelemetry.frameTimeMs * 0.5);
  inputTelemetry.coalescedCount = Math.max(1, coalesced);
  inputTelemetry.pointerType = pointerType;

  if (cleanQueueLag > inputTelemetry.peakLagMs) {
    inputTelemetry.peakLagMs = cleanQueueLag;
  }

  // Push to circular history
  inputTelemetry.history.shift();
  inputTelemetry.history.push(cleanQueueLag);

  const now = performance.now();
  if (now - lastInputNotifyTime > 66) { // ~15 FPS UI update
    lastInputNotifyTime = now;
    notify(inputListeners);
  }
}

export function recordFrameDuration(durationMs: number): void {
  inputTelemetry.frameTimeMs = Math.max(1, durationMs);
}

export function resetPeakLag(): void {
  inputTelemetry.peakLagMs = 0;
  inputTelemetry.history.fill(0);
  notify(inputListeners);
}

export function getInputTelemetry(): Readonly<InputTelemetry> {
  return inputTelemetry;
}

export function subscribeInputTelemetry(listener: Listener): () => void {
  inputListeners.add(listener);
  return () => {
    inputListeners.delete(listener);
  };
}

/** Called roughly twice a second by the engine's FPS sampler. */
export function publishFps(value: number): void {
  if (fps === value) return;
  fps = value;
  notify(fpsListeners);
}

export function getFps(): number {
  return fps;
}

export function subscribeFps(listener: Listener): () => void {
  fpsListeners.add(listener);
  return () => {
    fpsListeners.delete(listener);
  };
}

