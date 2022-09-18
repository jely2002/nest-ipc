import { applyDecorators } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";

export function SubscribeIpcMessage(messageChannel: string) {
  return applyDecorators(
    MessagePattern(messageChannel),
  );
}
