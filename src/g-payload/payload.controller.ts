import {Controller, Post, Body, Req} from '@nestjs/common';

@Controller('payload')
export class PayloadController{

    constructor(){}

    @Post()
    listenGitEvent(@Req() req){
        console.log(req);
    }
}

