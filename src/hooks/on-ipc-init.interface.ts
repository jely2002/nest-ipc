import { NestIpcServer } from "../types";

export interface OnIpcInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onIpcInit(server: NestIpcServer): any;
}
