import { Socket } from "net";

export interface OnIpcDisconnect {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onIpcDisconnect(socket: Socket): any;
}
