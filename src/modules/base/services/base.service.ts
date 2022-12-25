import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from '../../../entities';
import { DataSource, Repository } from 'typeorm';

import {
  LoginDto,
  CreateUserDto,
  SearchUserDto,
  ResponseDto,
  SearchSingle,
  DeleteRoleDto,
} from '../dto';
import { ifMatched, hashPassword } from '../../../helpers/hash.helper';
import { TokenService } from '../../../authentication/services/token.service';

@Injectable()
export class BaseService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly tokenService: TokenService,
  ) {}

  public async getAll(query: SearchUserDto): Promise<ResponseDto> {
    const data = await this.userRepository.find({
      where: {
        roles: !!query.role
          ? {
              name: query.role,
            }
          : undefined,
      },
      skip: (query.page ?? 0) * (query.limit ?? 20),
      take: query.limit ?? 20,
      relations: ['roles'],
    });

    const total = await this.userRepository.count({
      where: {
        roles: !!query.role
          ? {
              name: query.role,
            }
          : undefined,
      },

      relations: ['roles'],
    });
    return {
      data,
      total,
    };
  }

  public async getUser(id: string | undefined, email?: string) {
    const data = await this.userRepository.findOne({
      where: {
        id: id,
        email,
      },
    });
    if (!!data) return data;
    throw new NotFoundException();
  }

  public async addUser(data: CreateUserDto, role: Role) {
    let user: User;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newUser = new User();

      Object.assign(newUser, {
        ...data,
        password: !!data.password
          ? await hashPassword(data.password)
          : undefined,
        roles: [
          {
            id: role.id,
            name: role.name,
          },
        ],
      });

      user = await this.userRepository.save(newUser);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
    return user;
  }

  public async createUser(data: CreateUserDto) {
    const isUserExist = await this.userRepository.findOne({
      where: {
        email: data.email,
      },
    });

    if (!!isUserExist) throw new ConflictException('User already exist');
    const role = await this.roleRepository.findOne({
      where: {
        name: data.role,
      },
    });

    if (!role) throw new NotFoundException('Role not found');
    return await this.addUser(data, role);
  }

  public async loginUser(data: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (!user) throw new NotFoundException('User not found');
    if (!(await ifMatched(data.password, user.password)))
      throw new BadRequestException('Wrong password');

    const tokens = await this.tokenService.generateTokens(user);
    await this.tokenService.whitelistToken(tokens.refreshToken, user.id);
    return tokens;
  }

  public async updateRole(data: CreateUserDto) {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });
    const role = await this.roleRepository.findOne({
      where: {
        name: data.role,
      },
    });

    if (!role) throw new NotFoundException('Role not found');

    if (!!user) {
      user.roles.push(role);
      return await this.userRepository.save(user);
    }

    return await this.addUser(data, role);
  }

  public async removeRole(data: DeleteRoleDto, query: SearchUserDto) {
    const users = await this.userRepository.find({
      where: data.ids.map((d) => ({ id: d })),
    });

    if (!!query.role)
      for (const v in users) {
        users[v].roles = users[v].roles.filter((d) => d.name !== query.role);
      }

    return await this.userRepository.save(users);
  }
}
