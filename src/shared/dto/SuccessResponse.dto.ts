import {ApiProperty} from "@nestjs/swagger";

export class SuccessResponseDto {
    @ApiProperty()
    public message: string | boolean;

    constructor(data: any = {message: true}) {
        Object.assign(this, data);
    }
}