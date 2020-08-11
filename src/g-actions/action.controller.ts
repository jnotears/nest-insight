import {Controller, Post, Req } from '@nestjs/common';
import { ActionService } from './action.service';

@Controller('payload')
export class ActionController{
    
    constructor(
        private readonly actionService: ActionService
    ){}

    @Post()
    listenGitWebHook(@Req() req){
        console.log(req);
        return this.actionService.getAction(req.body);
    }
}