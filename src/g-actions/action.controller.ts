import { Controller, Post, Req } from '@nestjs/common';
import { ActionService } from './action.service';

@Controller('action')
export class ActionController {

    constructor(
        private readonly actionService: ActionService
    ) { }

    @Post()
    listenGitWebHook(@Req() req) {
        console.log(req.body);
        console.log(Object.keys(req.body));
        return this.actionService.getAction(req.headers['x-github-event'], req.body);
    }
}