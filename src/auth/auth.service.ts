import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>,
              private jwtService: JwtService) {
  }

  async createUser(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = authCredentialsDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);



    const user = this.userRepository.create({ username, password: hashedPassword });
    try {
      await this.userRepository.save(user);
    } catch (e) {
      if (e.code === '23505') // duplicate username
      {
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{accessToken: string}> {
    const { username, password } = authCredentialsDto;
    const user = await this.userRepository.findOneBy({username});
    const result = await bcrypt.compare(password, user.password);
    if (user && result) {
      const payload: JwtPayload = {username};
      const accessToken = this.jwtService.sign(payload);
      return {accessToken}
    } else {
      throw new UnauthorizedException('Please check your login credentials')
    }
  }
}
