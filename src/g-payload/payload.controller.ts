import {Controller, Post, Body, Req} from '@nestjs/common';
import { PayloadService } from './payload.service';

@Controller('payload')
export class PayloadController{

    constructor(
        private readonly payloadService: PayloadService
    ){}

    @Post()
    listenGitEvent(@Req() req){
        //console.log(req," new event: ",Date.now());
        this.payloadService.getAction(req.body);
    }
}

