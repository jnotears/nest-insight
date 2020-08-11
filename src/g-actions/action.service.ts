import { Injectable } from '@nestjs/common';
import { ActionDTO } from 'src/dto/action.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GAction } from './action.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ActionService {

    constructor(
        @InjectRepository(GAction) private readonly actionRepository: Repository<GAction>
    ){}

    create(action: ActionDTO){
        return this.actionRepository.save(action);
    }

    getAction(body: any){
        console.log('test',body);
        const action = new ActionDTO();
        action.type = body.action;
        action.actor = body.sender.login;
        action.issueId = body.issue.id || body.project.id;
        
        console.log(action);
    }
}