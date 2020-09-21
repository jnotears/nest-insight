export const jwtConstant = {
    secret: 'gfgh',
}

import {ConfigService} from '@nestjs/config';

export class JWTConstant{
    static getSecret(){
        const config = new ConfigService();
        return config.get<string>('JWT_SECRET');
    }
}