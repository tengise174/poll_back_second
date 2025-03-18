import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
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

    const user = await this.userRepository.findOne({
      where: { username },
      relations: [],
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = { username };
      const accessToken = await this.jwtService.sign(payload);
      return { accessToken };
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }

  async createEmployee(
    companyUser: User,
    createEmployeeDto: CreateEmployeeDto,
  ) {
    const { username, password, firstname, lastname } = createEmployeeDto;

    // hash then store it
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

  async changePassword(user: User, changePasswordDto: any) {
    const { currentPassword, newPassword } = changePasswordDto;

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await this.userRepository.save(user);
    return { message: 'Password successfully changed' };
  }

  async updateProfile(user: User, updateProfileDto: UpdateProfileDto) {
    const { username, firstname, lastname, companyname, usertype } =
      updateProfileDto;

      if(username !== undefined && username !== user.username) {
        const existingUser = await this.userRepository.findOne({
          where: { username },
        });
        if(existingUser) {
          throw new ConflictException('Username already exist');
        }
        user.username = username;
      }

      if(firstname !== undefined) user.firstname = firstname;
      if(lastname !== undefined) user.lastname = lastname;
      if(companyname !== undefined) user.companyname = companyname;
      if(usertype !== undefined) user.usertype = usertype;

      await this.userRepository.save(user);
      return { message: 'Profile successfully updated' };
  }
}
