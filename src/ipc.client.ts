import { ClientProxy, ReadPacket, WritePacket } from "@nestjs/microservices";
import ipc from "node-ipc";
import { IpcModuleOptions } from "./ipc.module-definition";
import { Logger } from "@nestjs/common";

export class IpcClient extends ClientProxy {
  constructor(private options: IpcModuleOptions) {
    super();
    this.id = options.id;
  }

  private readonly id: string;
  private logger = new Logger(IpcClient.name);

  unwrap<IpcClient>(): IpcClient {
    return ipc.of[this.id] as IpcClient;
  }

  async connect(): Promise<void> {
    ipc.config = {
      ...ipc.config,
      ...this.options,
      logger: (data) => {
        this.logger.debug(data);
      },
    };

    ipc.connectTo(
      this.id,
      () => {
        ipc.of[this.id].on(
          "connect",
          () => {
            ipc.log(`Connected to ${this.id}`);
          },
        );
        ipc.of[this.id].on(
          "disconnect",
          () => {
            ipc.log(`Disconnected from ${this.id}`);
          },
        );
      },
    );
  }

  async close() {
    ipc.disconnect(this.id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async dispatchEvent(packet: ReadPacket): Promise<any> {
    ipc.of[this.id].emit(packet.pattern, packet.data);
    return packet;
  }

  publish(
    packet: ReadPacket,
    callback: (packet: WritePacket) => void,
  ): () => void {
    ipc.of[this.id].emit(packet.pattern, packet.data);
    const responseHandler = (data) => {
      ipc.of[this.id].off(packet.pattern, responseHandler);
      callback({ response: data });
    };
    const errorHandler = (err) => {
      ipc.of[this.id].off("err", responseHandler);
      callback({ err, response: undefined });
    };
    ipc.of[this.id].on(packet.pattern, responseHandler);
    ipc.of[this.id].on("error", errorHandler);

    return () => this.teardown(packet, responseHandler, errorHandler);
  }

  private teardown(packet: ReadPacket, handler: (data: unknown) => void, errorHandler: (err: unknown) => void): void {
    ipc.of[this.id].off(packet.pattern, handler);
    ipc.of[this.id].off("error", errorHandler);
  }
}
