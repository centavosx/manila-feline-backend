import { TokenService } from '../services/token.service';
import { Controller, Get, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '../../decorators/user.decorator';
import { User as UserEntity } from '../../entities';

@ApiTags('Refresh')
@Controller()
export class RefreshController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('/refresh')
  public async refreshToken(@User() user: UserEntity | undefined) {
    if (!user) throw new UnauthorizedException('Unauthorized');
    return this.tokenService.generateTokens(user);
  }
}
