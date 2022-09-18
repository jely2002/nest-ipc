import { ConfigurableModuleBuilder } from "@nestjs/common";

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

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } = new ConfigurableModuleBuilder<IpcModuleOptions>().build()
