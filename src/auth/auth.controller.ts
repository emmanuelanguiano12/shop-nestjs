import { Controller, Get, Post, Body, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { User } from './entities/user.entity';
import { Auth, GetUser, RawHeaders } from './decorators';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';

@Controller('auth') // ruta (dominio/api/auth)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')// ruta (dominio/api/auth/register)
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')// ruta (dominio/api/auth/register)
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-auth-status')
  @Auth() // Ruta protegida (autenticación)
  @UseGuards( AuthGuard() )
  checkAuthStatus(@GetUser() user: User,) {
    return this.authService.checkAuthStatus(user)
  }

  @Get('private')
  @UseGuards( AuthGuard() ) // Este guard establece el usario en los headers
  testingPrivatingRoute(
    // @Req() request: Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
  ) {


    
    return {
      ok: true,
      msg: 'Hola mundo private',
      user,
      userEmail,
      rawHeaders
    }

  }
  
  // @SetMetadata('roles', ['admin', 'super-user'])
  @Get('private2')
  @RoleProtected(ValidRoles.superUser)
  @UseGuards( AuthGuard(), UserRoleGuard ) // autenticación - autorización
  privateRoute2(
    @GetUser() user: User,
  ){

    return {
      ok: true,
      user
    }
  }


  @Get('private3')
  @Auth(ValidRoles.admin, ValidRoles.superUser)
  privateRoute3(
    @GetUser() user: User,
  ){

    return {
      ok: true,
      user
    }
  }


}
