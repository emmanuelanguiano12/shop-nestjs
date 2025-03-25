import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService

  ){}

  async create(createUserDto: CreateUserDto) {

    try {
      const {password, ...rest} = createUserDto; 

      const user = this.userRepository.create({
        ...rest,
        password: bcrypt.hashSync(password, 10)
      });

      await this.userRepository.save(user);
      // delete user.password;

      return {
        ...user,
        token: this.getJWT({id: user.id})
      };
      
    } catch (error) {
      this.handleDBErrors(error)
    }

  }

  async login(loginUserDto: LoginUserDto){

    const {password, email} = loginUserDto

    const user = await this.userRepository.findOne({
      where: { email: email },
      select: {email: true, password: true, id: true} //! Lo que se va a pedir de la query
    }) // Solo mostrar el email y password

    if(!user) throw new UnauthorizedException('Credentials are not valid (email)')

    if(!bcrypt.compareSync(password, user.password)) throw new UnauthorizedException('Credentials are not valid (password)')

    return {
      ...user,
      token: this.getJWT({id: user.id})
    };

  }

  private getJWT(payload: JwtPayload){

    const token = this.jwtService.sign(payload);
    return token;

  }

  private handleDBErrors(error: any): never{
    if(error.code === '23505'){
      throw new BadRequestException(error.detail)
    }

    console.log(error)
    throw new BadRequestException('Please check server logs')
  }

  async checkAuthStatus(user: User){
    return {
      ...user,
      token: this.getJWT({id: user.id})
    };
  }
}
