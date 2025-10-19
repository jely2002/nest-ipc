import { isFunction } from "@nestjs/common/utils/shared.utils";
import { OnIpcInit } from "./on-ipc-init.interface";
import { IpcServer } from "../types";

function hasOnIpcInitHook(
  instance: unknown,
): instance is OnIpcInit {
  return isFunction((instance as OnIpcInit).onIpcInit);
}

export async function callIpcInitHook(
  instances: unknown[],
  server?: IpcServer,
): Promise<void> {
  for (const instance of instances) {
    if (hasOnIpcInitHook(instance)) {
      await instance.onIpcInit(
        server,
      );
    }
  }
}
