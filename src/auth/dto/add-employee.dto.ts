import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateEmployeeDto {
    @IsString()
    @MinLength(2)
    @MaxLength(20)
    username: string

    @IsString()
    @MinLength(8)
    @MaxLength(32)
    password: string

    @IsString()
    @MinLength(2)
    @MaxLength(20)
    firstname: string

    @IsString() 
    @MinLength(2)
    @MaxLength(20)
    lastname: string
}