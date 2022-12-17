import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User, UserRole } from '../../../entities';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class BaseService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
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

      Object.assign(newUser, data);

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
}
