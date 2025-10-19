import {CustomTransportStrategy, MessageHandler, Server} from "@nestjs/microservices";
import ipc from 'node-ipc';
import { Inject, Injectable, Logger } from "@nestjs/common";
import { Socket } from "net";
import { callIpcDisconnectHook } from "./hooks/on-ipc-disconnect.hook";
import { DiscoveryService } from "@nestjs/core";
import { InstanceWrapper } from "@nestjs/core/injector/instance-wrapper";
import { callIpcInitHook } from "./hooks/on-ipc-init.hook";
import { IpcModuleOptions, MODULE_OPTIONS_TOKEN } from "./ipc.module-definition";

@Injectable()
export class IpcServer extends Server implements CustomTransportStrategy {
  constructor(
    private readonly discoveryService: DiscoveryService,
    @Inject(MODULE_OPTIONS_TOKEN) private moduleOptions: IpcModuleOptions
  ) {
    super();
  }

  protected logger = new Logger(IpcServer.name);

  on(): void {
   throw new Error('The IPC server does not emit internal events.');
  }

  unwrap<IpcServer>(): IpcServer {
    return ipc.server as IpcServer;
  }

  listen(callback: () => void): void {
    ipc.config = {
      ...ipc.config,
      ...this.moduleOptions,
      logger: (data) => {
        this.logger.debug(data);
      }
    }

    ipc.serve((): void => {
        ipc.server.on('start', async (): Promise<void> => {
          await callIpcInitHook(this.getInstances(), ipc.server);
          callback();
        });
        this.messageHandlers.forEach((handler: MessageHandler, message) => {
          ipc.server.on(message, async (data: unknown, socket: Socket): Promise<void> => {
            const returnValue: MessageHandler = await handler(data);
            ipc.server.emit(socket, 'message', returnValue);
          });
        });
        ipc.server.on(
          'socket.disconnected',
          async (socket: Socket): Promise<void> => {
            ipc.log('client ' + socket.remoteAddress + ' has disconnected!');
            await callIpcDisconnectHook(this.getInstances(), socket);
          }
        );
      }
    );

    ipc.server.start();
  }

  close(): void {
    ipc.server.stop();
  }

  getInstances() {
    const instanceWrappers: InstanceWrapper[] = [
      ...this.discoveryService.getControllers(),
      ...this.discoveryService.getProviders(),
    ];
    return instanceWrappers.filter(wrapper => {
      const {instance} = wrapper;
      if (!instance || !Object.getPrototypeOf(instance)) {
        return;
      }
      return wrapper.isDependencyTreeStatic();
    }).map(wrapper => wrapper.instance)
  }

}
