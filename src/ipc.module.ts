import { Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { IpcService } from "./ipc.service";
import { ConfigurableModuleClass } from "./ipc.module-definition";
import { IpcServer } from "./ipc.server";

@Module({
  imports: [DiscoveryModule],
  providers: [IpcService, IpcServer],
  exports: [IpcService, IpcServer],
})
export class IpcModule extends ConfigurableModuleClass {}
