# Nest IPC
Communicate over IPC using NestJS, server and client support. 

Uses the custom transports API, so it can be registered as a microservice in NestJS.

## Install
```shell
npm i nest-ipc
```

## Getting started
Import the `IpcModule` in your `AppModule`.
The only required config property is `id`.

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IpcModule } from "nest-ipc";

@Module({
  imports: [IpcModule.register({ id: 'world' })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```
### Client
Use the IPC client service in your application using dependency injection.

```ts
import { IpcService } from "nest-ipc";
import { firstValueFrom } from "rxjs";

@Controller()
export class AppController {
  constructor(private readonly ipcService: IpcService) {}

  @Post()
  broadcastHello(): void {
    this.ipcService.emit('message', 'hello');
  }
  
  @Get()
  getOverIpc(): Promise<string> {
    return firstValueFrom(this.ipcService.send('message', 'ping'));
  }
}
```

### Server
Register the IPC server as a microservice in your `main.ts`.
We get the IpcServer from the IpcModule, this is why we do `app.get(IpcServer)`.

```ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from './app.module';
import { MicroserviceOptions } from "@nestjs/microservices";
import { IpcServer } from "nest-ipc";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    strategy: app.get(IpcServer),
  });
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
```

Listen for messages in your controller.

```ts
import { Controller } from "@nestjs/common";
import { Payload } from "@nestjs/microservices";
import { SubscribeIpcMessage } from "nest-ipc";

@Controller()
export class AppController {
  
  @SubscribeIpcMessage('world')
  handleWorldMessage(@Payload() data: string) {
    console.log(data);
  }
}
```

Or hook into lifecycle events of the IPC server.

```ts
import { Controller } from "@nestjs/common";
import { NestIpcServer, OnIpcDisconnect, OnIpcInit } from "nest-ipc";
import { Socket } from "net";

@Controller()
export class AppController implements OnIpcInit, OnIpcDisconnect{

  onIpcDisconnect(socket: Socket): void {
    console.log('IPC client disconnected');
  }

  onIpcInit(server: NestIpcServer): any {
    console.log('IPC server started');
    server.broadcast('message', 'server started');
  }
}
```

## Options
The `IpcModule` accepts lots of options to customize the client or server.
For more information about the configuration options, please see [node-ipc](https://github.com/RIAEvangelist/node-ipc#ipc-config).

```ts
export interface IpcModuleOptions {
  id: string;
  appspace?: string;
  socketRoot?: string;
  networkHost?: string;
  networkPort?: number;
  readableAll?: boolean;
  writableAll?: boolean;
  maxConnections?: number;
  encoding?: 'ascii' | 'utf8' | 'utf16le' | 'ucs2' | 'base64' | 'hex',
  rawBuffer?: boolean;
  delimiter?: string;
  silent?: boolean;
  unlink?: boolean;
  retry?: number;
  maxRetries?: boolean | number;
  stopRetrying?: boolean;
  interfaces?: {
    localAddress?: boolean | undefined;
    localPort?: boolean | undefined;
    family?: boolean | undefined;
    hints?: boolean | undefined;
    lookup?: boolean | undefined;
  };
}
```

## Security notice
This package uses RIAEvangelist's `node-ipc` as dependency. The `node-ipc` package includes protestware in its recent versions. This protestware will add a file to your desktop and print a heart in the console.

The version of `node-ipc` that this package uses is locked to a non-impacted version and overriden in package.json to prevent any accidents.
