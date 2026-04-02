import { IsArray, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateCommentDto {


    @IsString()
    readonly content: string;

    @IsString()
    @IsUUID(4)
    readonly articleId: string;

    @IsOptional()
    @IsString()
    readonly authorId: string | null;

}

