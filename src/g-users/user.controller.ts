import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {

    constructor(
        private readonly user: UserService
    ) { }

    @Get()
    getUser() {
        this.user.getUser().subscribe(val => console.log(val.data));
    }
}