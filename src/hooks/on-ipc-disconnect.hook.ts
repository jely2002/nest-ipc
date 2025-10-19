import { isFunction } from '@nestjs/common/utils/shared.utils';
import { OnIpcDisconnect } from "./on-ipc-disconnect.interface";
import { Socket } from "net";

function hasOnIpcDisconnectHook(
  instance: unknown,
): instance is OnIpcDisconnect {
  return isFunction((instance as OnIpcDisconnect).onIpcDisconnect);
}

export async function callIpcDisconnectHook(
  instances: unknown[],
  socket?: Socket,
): Promise<void> {
  for (const instance of instances) {
    if (hasOnIpcDisconnectHook(instance)) {
      (instance).onIpcDisconnect(
        socket,
      );
    }
  }
}
