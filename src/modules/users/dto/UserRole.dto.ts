import {ApiProperty} from "@nestjs/swagger";

export class UserRoleDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;
}
