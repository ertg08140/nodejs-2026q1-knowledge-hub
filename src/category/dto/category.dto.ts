import { PartialType } from "@nestjs/mapped-types";
import { IsString } from "class-validator";

export class CategoryDto {
    @IsString()
    readonly name: string;

    @IsString()
    readonly description: string;


}

export class UpdateCategoryDto extends PartialType(CategoryDto) { }