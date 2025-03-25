import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

export const GetUser = createParamDecorator(
    (data: string, context: ExecutionContext) => {

        const req = context.switchToHttp().getRequest()
        const user = req.user; // aquí se obtiene el usuario

        // Mandar a llamar un usuario que no esté autenticado
        if(!user) throw new InternalServerErrorException('User not found (request)')

        // if(data === 'email'){
        //     return user.email;
        // }
        
        return (!data
            ? user
            : user[data])
    }
);