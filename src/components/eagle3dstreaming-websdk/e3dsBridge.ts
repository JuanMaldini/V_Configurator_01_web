export type E3dsIncomingUeMessage = {
  cmd: string;
  [key: string]: unknown;
};

export type E3dsIncomingCommand = {
  cmd: string;
  [key: string]: unknown;
};

export type E3dsCommandHandler = (
  message: E3dsIncomingCommand
) => void | Promise<void>;

export type E3dsCommandHandlers = Record<string, E3dsCommandHandler>;

export type RouteE3dsCommand = (message: unknown) => boolean | Promise<boolean>;

export function createE3dsCommandRouter(handlers: E3dsCommandHandlers) {
  return async function routeE3dsCommand(message: unknown) {
    if (!message || typeof message !== "object") return false;

    const cmd = (message as { cmd?: unknown }).cmd;
    if (typeof cmd !== "string" || cmd.trim().length === 0) return false;

    const normalizedCmd = cmd.trim();
    const handler =
      handlers[normalizedCmd] ?? handlers[normalizedCmd.toLowerCase()];
    if (!handler) return false;

    await handler(message as E3dsIncomingUeMessage);
    return true;
  };
}

function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function extractCommandObject(value: unknown): unknown {
  if (!value) return value;
  if (typeof value === "string") return tryParseJson(value);
  if (typeof value !== "object") return value;

  const obj = value as Record<string, unknown>;
  if (typeof obj.cmd === "string") return obj;
  if (typeof obj.command === "string") return { ...obj, cmd: obj.command };

  const envelopeKeys = ["payload", "data", "message", "detail", "event"] as const;
  for (const key of envelopeKeys) {
    const inner = obj[key];
    if (!inner || typeof inner !== "object") continue;
    const innerObj = inner as Record<string, unknown>;
    if (typeof innerObj.cmd === "string") return innerObj;
    if (typeof innerObj.command === "string") return { ...innerObj, cmd: innerObj.command };
  }

  return obj;
}

export type ConnectE3dsWindowBridgeOptions = {
  iframe?: HTMLIFrameElement | null;
  routeCommand: RouteE3dsCommand;
  allowedOrigins?: "*" | string[];
  debug?: boolean;
};

/**
 * Connects a `window.message` listener that routes E3DS commands coming from an embedded iframe.
 *
 * This is intentionally tolerant to different envelope formats (stringified JSON, {payload:{cmd}}, etc).
 */
export function connectE3dsWindowBridge(options: ConnectE3dsWindowBridgeOptions) {
  const allowedOrigins = options.allowedOrigins ?? "*";

  const handler = async (event: MessageEvent) => {
    if (allowedOrigins !== "*" && !allowedOrigins.includes(event.origin)) return;

    const iframeWindow = options.iframe?.contentWindow ?? null;
    if (iframeWindow && event.source !== iframeWindow) return;

    const commandCandidate = extractCommandObject(event.data);

    try {
      const handled = await options.routeCommand(commandCandidate);
      if (options.debug && handled) {
        // eslint-disable-next-line no-console
        console.debug("[E3DS] handled command", commandCandidate);
      }
    } catch (err) {
      if (options.debug) {
        // eslint-disable-next-line no-console
        console.warn("[E3DS] command handler error", err);
      }
    }
  };

  window.addEventListener("message", handler);
  return () => window.removeEventListener("message", handler);
}