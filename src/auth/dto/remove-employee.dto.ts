import { IsString } from "class-validator";

export class RemoveEmployeeDto {
    @IsString()
    employeeUsername: string
}