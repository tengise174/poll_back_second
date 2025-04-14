import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User, UserType } from './user.entity';
import {
  SignInCredentialsDto,
  SignUpCredentialsDto,
} from './dto/auth-credentials.dto';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './dto/jwt-payload.interface';
import { CreateEmployeeDto } from './dto/add-employee.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(
    signUpCredentialsDto: SignUpCredentialsDto,
  ): Promise<{ accessToken: string }> {
    const { username, password, lastname, firstname, companyname, usertype } =
      signUpCredentialsDto;

    // hash then store it
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      firstname,
      lastname,
      companyname,
      usertype,
    });

    try {
      await this.userRepository.save(user);

      // Generate JWT token
      const payload: JwtPayload = { username };
      const accessToken = await this.jwtService.sign(payload);

      return { accessToken };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Username already exist');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async signIn(
    signInCredentialsDto: SignInCredentialsDto,
  ): Promise<{ accessToken: string }> {
    const { username, password } = signInCredentialsDto;

    // Find user by username
    const user = await this.userRepository.findOne({
      where: { username },
      relations: [],
    });

    // Check if user exists and password is valid
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    // Generate JWT token
    const payload: JwtPayload = { username };
    const accessToken = await this.jwtService.sign(payload);
    return { accessToken };
  }

  async createEmployee(
    companyUser: User,
    createEmployeeDto: CreateEmployeeDto,
  ) {
    const { username, password, firstname, lastname } = createEmployeeDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // create the new employee as a PERSON user
    const employee = this.userRepository.create({
      username,
      password: hashedPassword,
      firstname,
      lastname,
      usertype: UserType.PERSON,
      companyname: '',
      employer: companyUser,
    });

    try {
      await this.userRepository.save(employee);
      return {
        message: `Employee "${username}" successfully created and added to "${companyUser.username}"`,
      };
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Username "${username}" already exist`);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async getEmployees(companyUser: User) {
    const employees = await this.userRepository.find({
      where: { employer: { id: companyUser.id } },
    });
    return employees;
  }

  async removeEmployee(companyUser: User, removeEmployeeDto: any) {
    const { employeeUsername } = removeEmployeeDto;

    const employee = await this.userRepository.findOne({
      where: { username: employeeUsername },
      relations: ['employer'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee "${employeeUsername}" not found`);
    }

    if (!employee.employer || employee.employer.id !== companyUser.id) {
      throw new ForbiddenException(
        `${employeeUsername} is not a employee of ${companyUser.username}`,
      );
    }

    employee.employer = null;
    await this.userRepository.save(employee);

    return {
      message: `Employee "${employeeUsername}" successfully removed from "${companyUser.username}"`,
    };
  }

  async changePassword(
    user: User,
    changePasswordDto: { currentPassword: string; newPassword: string },
  ) {
    const { currentPassword, newPassword } = changePasswordDto;

    // Ensure the user is fetched from the database to avoid stale entity issues
    const dbUser = await this.userRepository.findOne({
      where: { id: user.id },
    });
    if (!dbUser) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      dbUser.password,
    );
    if (!isCurrentPasswordValid) {
      return { message: "Current password doesn't match" };
    }

    // Hash new password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    dbUser.password = hashedPassword;

    // Save to database
    try {
      await this.userRepository.save(dbUser);
      return { message: 'Password changed successfully' };
    } catch (err: any) {
      throw new InternalServerErrorException('Failed to update password', err);
    }
  }

  async updateProfile(user: User, updateProfileDto: UpdateProfileDto) {
    const { username, firstname, lastname, usertype } = updateProfileDto;

    if (username !== undefined && username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username },
      });
      if (existingUser) {
        throw new ConflictException('Username already exist');
      }
      user.username = username;
    }

    if (firstname !== undefined) user.firstname = firstname;
    if (lastname !== undefined) user.lastname = lastname;
    if (usertype !== undefined) user.usertype = usertype;

    await this.userRepository.save(user);
    return { message: 'Profile successfully updated' };
  }

  async checkUserExists(username: string): Promise<{ exists: boolean }> {
    const user = await this.userRepository.findOne({
      where: { username },
      select: ['id'],
    });

    return { exists: !!user };
  }

  async deleteAccount(user: User): Promise<{ message: string }> {
    try {
      // Check if user exists
      const dbUser = await this.userRepository.findOne({
        where: { id: user.id },
        relations: ['employer', 'employees'],
      });

      if (!dbUser) {
        throw new NotFoundException('User not found');
      }

      // Prevent company accounts with active employees from being deleted
      if (
        dbUser.usertype === UserType.COMPANY &&
        dbUser.employees?.length > 0
      ) {
        throw new ForbiddenException(
          'Cannot delete company account with active employees',
        );
      }

      // If user is an employee, remove employer association
      if (dbUser.employer) {
        dbUser.employer = null;
        await this.userRepository.save(dbUser);
      }

      // Delete the user
      await this.userRepository.remove(dbUser);

      return { message: 'Account successfully deleted' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete account');
    }
  }
}
