import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  SignInCredentialsDto,
  SignUpCredentialsDto,
} from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './get-user.decorator';
import { User, UserType } from './user.entity';
import { CreateEmployeeDto } from './dto/add-employee.dto';
import { RemoveEmployeeDto } from './dto/remove-employee.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signUp(
    @Body() signUpCredentialsDto: SignUpCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signUp(signUpCredentialsDto);
  }

  @Post('/signin')
  signIn(
    @Body() signInCredentialsDto: SignInCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(signInCredentialsDto);
  }

  @Get('/profile')
  @UseGuards(AuthGuard())
  profile(@GetUser() user: User): User {
    return user;
  }

  @Post('/company/add-employee')
  @UseGuards(AuthGuard())
  async addEmployee(
    @GetUser() companyUser: User,
    @Body() createEmployeeDto: CreateEmployeeDto,
  ) {
    console.log(createEmployeeDto);
    if (companyUser.usertype !== 'COMPANY') {
      throw new Error('Only company can add employee');
    }
    return this.authService.createEmployee(companyUser, createEmployeeDto);
  }

  @Get('/company/employees')
  @UseGuards(AuthGuard())
  async getEmployees(@GetUser() companyUser: User) {
    if (companyUser.usertype !== UserType.COMPANY) {
      throw new ForbiddenException('Only company can get employees');
    }
    return this.authService.getEmployees(companyUser);
  }

  @Post('/company/remove-employee')
  @UseGuards(AuthGuard())
  async removeEmployee(
    @GetUser() companyUser: User,
    @Body() removeEmployeeDto: RemoveEmployeeDto,
  ) {
    if (companyUser.usertype !== UserType.COMPANY) {
      throw new ForbiddenException('Only company can remove employee');
    }
    return this.authService.removeEmployee(companyUser, removeEmployeeDto);
  }

  @Post('/change-password')
  @UseGuards(AuthGuard())
  async changePassword(
    @GetUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user, changePasswordDto);
  }

  @Post('/update-profile')
  @UseGuards(AuthGuard())
  async updateProfile(
    @GetUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user, updateProfileDto);
  }

  @Get('/check-user')
  async checkUser(@Query('username') username: string) {
    if (!username) {
      throw new ForbiddenException('No username provided');
    }
    return this.authService.checkUserExists(username);
  }

  @Post('/delete-account')
  @UseGuards(AuthGuard())
  async deleteAccount(@GetUser() user: User) {
    return this.authService.deleteAccount(user);
  }
}
