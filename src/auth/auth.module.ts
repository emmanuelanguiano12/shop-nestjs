import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    TypeOrmModule.forFeature([User]), // Impacto a la base de datos
    PassportModule.register({
      defaultStrategy: 'jwt'
    }),
    ConfigModule,

    // Hacer el modulo asíncrono para siempre tener la variable de entorno simepre que se monta la aplicación
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: ( configService: ConfigService ) => {

        console.log('JWT Secret', configService.get('JWT_SECRET'))
        // console.log('JWT Secret', process.env.JWT_SECRET)
        return {
          // secret: process.env.JWT_SECRET,
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '2h'
          }
        }
      }
    })
  ],

  // Exportaciones a otros modulos
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
