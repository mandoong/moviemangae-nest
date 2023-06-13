import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { AuthCredentialDto } from './dto/user.auth-credential.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async SignUp(authCredentialDto: AuthCredentialDto): Promise<void> {
    const { email, password, name } = authCredentialDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
    });

    try {
      await this.userRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('not');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async SignIn(
    authCredentialDto: AuthCredentialDto,
  ): Promise<{ accessToken: string }> {
    const { email, password } = authCredentialDto;

    const user = await this.userRepository.findOneBy({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { email };

      const accessToken = await this.jwtService.sign(payload);

      return { accessToken: accessToken };
    } else {
      throw new UnauthorizedException('login failed');
    }
  }

  async OAuthLogin(req) {
    const { email } = req.user;
    const isUser = await this.userRepository.findOne({
      where: { email: email },
    });
    console.log(isUser);

    let accessToken;

    if (!isUser) {
      const user = new User();
      user.email = req.user.email;
      user.password = '';
      user.name = req.user.name;

      await this.userRepository.save(user);

      const email = user.email;
      const id = user.id;
      const payload = { email, id };
      accessToken = this.jwtService.sign(payload);
    } else {
      const email = isUser.email;
      const id = isUser.id;
      const payload = { email, id };
      accessToken = this.jwtService.sign(payload);
    }
    return accessToken;
  }
}
