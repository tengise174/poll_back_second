import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { UserType } from "../user.entity";

export class UpdateProfileDto {
    @IsString()
    @MinLength(2)
    @MaxLength(20)
    @IsOptional()
    username?: string

    @IsString()
    @IsOptional()
    @MinLength(2)
    firstname?: string

    @IsString()
    @IsOptional()
    @MinLength(2)
    lastname?: string

    @IsString()
    @IsOptional()
    @MinLength(2)
    companyname?: string

    @IsEnum(UserType)
    @IsOptional()
    usertype?: UserType
}