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