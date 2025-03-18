import { IsString, MaxLength, MinLength } from "class-validator";

export class ChangePasswordDto {
    @IsString()
    currentPassword: string;
    
    @IsString()
    @MinLength(8)
    @MaxLength(32)
    newPassword: string
}