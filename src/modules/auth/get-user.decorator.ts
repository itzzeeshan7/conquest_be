import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Users } from "../users/entities/Users.entity";

export const GetUser = createParamDecorator((data, context: ExecutionContext): Users => {
    const user = context.switchToHttp().getRequest().user;
    return user;
});