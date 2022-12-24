import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User, UserRole } from '../../../entities';
import { DataSource, Repository } from 'typeorm';

import { LoginDto, CreateUserDto } from '../dto';
import { ifMatched, hashPassword } from '../../../helpers/hash.helper';
import { TokenService } from '../../../authentication/services/token.service';

@Injectable()
export class BaseService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly tokenService: TokenService,
  ) {}

  public async createUser(data: CreateUserDto) {
    const isUserExist = await this.userRepository.findOne({
      where: {
        email: data.email,
      },
    });

    if (!!isUserExist) throw new ConflictException('User already exist');

    const queryRunner = this.dataSource.createQueryRunner();
    let user: User;
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newUser = new User();

      Object.assign(newUser, {
        ...data,
        password: !!data.password
          ? await hashPassword(data.password)
          : undefined,
      });

      const user = await this.userRepository.save(newUser);

      const role = await this.roleRepository.findOne({
        where: {
          name: data.role,
        },
      });

      if (!role) throw new NotFoundException('Role not found');

      const userRole = new UserRole();

      Object.assign(userRole, { userId: user.id, roleId: role.id });

      await this.userRoleRepository.save(userRole);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return user;
  }

  public async loginUser(data: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (!user) throw new NotFoundException('User not found');
    if (!(await ifMatched(data.password, user.password)))
      throw new BadRequestException('Wrong password');
    return await this.tokenService.generateTokens(user);
  }
}
