export type E3dsDescriptor = string | Record<string, unknown>;

export type E3dsIncomingEvent = {
  type: string;
  [key: string]: unknown;
};

export type E3dsIncomingUeMessage = {
  cmd: string;
  [key: string]: unknown;
};

type BridgeConfig = {
  iframeId: string;
  iframeSrc?: string;
  targetOrigin?: string;
};

let configuredIframeId: string | null = null;
let configuredTargetOrigin: string = "*";
let listenerInstalled = false;

const eventListeners = new Set<(event: E3dsIncomingEvent) => void>();
const ueMessageListeners = new Set<(message: E3dsIncomingUeMessage) => void>();

function inferOriginFromUrl(maybeUrl: unknown): string | null {
  if (typeof maybeUrl !== "string" || maybeUrl.trim().length === 0) return null;
  try {
    return new URL(maybeUrl).origin;
  } catch {
    return null;
  }
}

function getIframeElement(): HTMLIFrameElement | null {
  if (!configuredIframeId) return null;
  const el = document.getElementById(configuredIframeId);
  if (!el) return null;
  if (!(el instanceof HTMLIFrameElement)) return null;
  return el;
}

function postToIframe(payload: unknown, originOverride?: string) {
  const iframeEl = getIframeElement();
  if (!iframeEl || !iframeEl.contentWindow) {
    return;
  }

  const target = originOverride ?? configuredTargetOrigin ?? "*";
  const message =
    typeof payload === "string" ? payload : JSON.stringify(payload);
  iframeEl.contentWindow.postMessage(message, target);
}

function shouldAcceptMessage(event: MessageEvent): boolean {
  if (configuredTargetOrigin === "*") return true;
  if (typeof event.origin !== "string" || event.origin.length === 0)
    return false;
  return event.origin === configuredTargetOrigin;
}

function handleWindowMessage(event: MessageEvent) {
  if (!shouldAcceptMessage(event)) return;

  // E3DS connector emits structured objects with a `type` field.
  if (
    event.data &&
    typeof event.data === "object" &&
    "type" in (event.data as any)
  ) {
    const typed = event.data as E3dsIncomingEvent;

    if (typed.type === "isIframe") {
      try {
        (event.source as Window | null)?.postMessage(
          JSON.stringify({ cmd: "isIframe", value: true }),
          event.origin || configuredTargetOrigin || "*"
        );
      } catch {
        // ignore
      }
    }

    for (const listener of eventListeners) listener(typed);
    return;
  }

  // Unreal messages typically arrive as JSON strings containing a `cmd`.
  if (typeof event.data === "string") {
    try {
      const parsed = JSON.parse(event.data) as unknown;
      if (parsed && typeof parsed === "object" && "cmd" in (parsed as any)) {
        const msg = parsed as E3dsIncomingUeMessage;
        for (const listener of ueMessageListeners) listener(msg);
      }
    } catch {
      // ignore non-JSON
    }
  }
}

export function configureE3dsBridge(config: BridgeConfig) {
  configuredIframeId = config.iframeId;

  const inferred = inferOriginFromUrl(config.iframeSrc);
  configuredTargetOrigin = config.targetOrigin ?? inferred ?? "*";

  if (!listenerInstalled) {
    window.addEventListener("message", handleWindowMessage);
    listenerInstalled = true;
  }
}

export function emitDescriptor(descriptor: E3dsDescriptor) {
  console.log({ cmd: "sendToUe4", value: descriptor });
  const obj = { cmd: "sendToUe4", value: descriptor };
  const jsonString = JSON.stringify(obj);
  console.log(descriptor);
//   console.log(jsonString);
  postToIframe(jsonString);
}

export function addE3dsEventListener(
  listener: (event: E3dsIncomingEvent) => void
) {
  eventListeners.add(listener);
  return () => eventListeners.delete(listener);
}

export function addE3dsUeMessageListener(
  listener: (message: E3dsIncomingUeMessage) => void
) {
  ueMessageListeners.add(listener);
  return () => ueMessageListeners.delete(listener);
}
