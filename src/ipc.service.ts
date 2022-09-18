import { Inject, Injectable } from "@nestjs/common";
import { IpcModuleOptions, MODULE_OPTIONS_TOKEN } from "./ipc.module-definition";
import { IpcClient } from "./ipc.client";

@Injectable()
export class IpcService extends IpcClient {
  constructor(@Inject(MODULE_OPTIONS_TOKEN) private moduleOptions: IpcModuleOptions) {
    super(moduleOptions);
  }
}
