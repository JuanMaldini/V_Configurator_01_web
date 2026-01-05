export type E3dsIncomingCommand = {
  cmd: string;
  [key: string]: unknown;
};

export type E3dsCommandHandler = (
  message: E3dsIncomingCommand
) => void | Promise<void>;

export type E3dsCommandHandlers = Record<string, E3dsCommandHandler>;

export function createE3dsCommandRouter(handlers: E3dsCommandHandlers) {
  return async function routeE3dsCommand(message: E3dsIncomingCommand) {
    if (!message || typeof message.cmd !== "string") return;

    const handler = handlers[message.cmd];
    if (!handler) return;

    await handler(message);
  };
}
