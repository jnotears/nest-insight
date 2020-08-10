import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {

    constructor(
        private readonly user: UserService
    ) { }

    @Get()
    fillData() {
        this.user.fillData("jnotears");
    }
}