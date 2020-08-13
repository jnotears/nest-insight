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
        try {
            return this.actionRepository.save(action);    
        } catch (error) {
            console.log("Cant save action: ",error);
            return;
        }
    }

    getAction(gitEvent: string, body: any){
        try {
            switch (gitEvent) {
                case 'issue_comment':
                    this.getIssueCommentEvent(body);
                    break;

                case 'commit_comment':
                    this.getIssueCommentEvent(body);
                    break;
            
                case 'issues':
                    this.getIssuesEvent(body);
                    break;

                case 'label':
                    this.getLabelEvent(body);
                    break;

                case 'project_card':
                    this.getProjectCardEvent(body);
                    break;

                case 'project_column':
                    this.getProjectColumnEvent(body);
                    break;

                case 'project':
                    this.getProjectEvent(body);
                    break;

                default:
                    break;
            }
        } catch (error) {
            return;
        }  
    }

    getIssueCommentEvent(body: any){
        const action = new ActionDTO();
        action.act = body.action;
        action.actor = body.comment.user.login;
        if(body.comment.created_at){
            action.createdAt = body.comment.created_at;
        }
        if(body.comment.updated_at){
            action.updatedAt = body.comment.updated_at;
        }
        action.event = 'comment';
        action.fromLocation = body.issue.id;
        action.content = `${action.actor} ${action.act} ${action.event} at ${action.fromLocation}`;
        action.actionUrl = body.comment.html_url;
        console.log(action);
        return this.create(action);
    }

    getCommitCommentEvent(body: any){
        const action = new ActionDTO();
        action.act = body.action;
        action.actor = body.comment.user.login;
        if(body.comment.created_at){
            action.createdAt = body.comment.created_at;
        }
        action.event = 'comment';
        action.fromLocation = body.repository.id;
        action.content = `${action.actor} ${action.act} ${action.event}`;
        action.actionUrl = body.comment.html_url;
        console.log(action);
        return this.create(action);
    }

    getIssuesEvent(body: any){
        const action = new ActionDTO();
        action.act = body.action;
        action.actor = body.issue.user.login;
        if(body.issue.created_at){
            action.createdAt = body.issue.created_at;
        }
        if(body.issue.updated_at){
            action.updatedAt = body.issue.updated_at;
        }
        if(body.issue.closed_at){
            action.closedAt = body.issue.closed_at;
        }
        action.event = 'issue';
        action.fromLocation = body.issue.id;
        action.content = `${action.actor} ${action.act} ${action.event}`
        action.actionUrl = body.issue.html_url;
        console.log(action);
        return this.create(action);
    }
    
    getLabelEvent(body: any){
        const action = new ActionDTO();
        action.act = body.action;
        action.actor = body.sender.login;
        action.event = 'label';
        action.content = `${action.actor} ${action.act} ${action.event}`
        action.actionUrl = body.label.url;
        console.log(action);
        return this.create(action);
    }

    getProjectCardEvent(body: any){
        const action = new ActionDTO();
        action.act = body.action;
        action.actor = body.sender.login;
        if(body.project_card.created_at){
            action.createdAt = body.project_card.created_at;
        };
        if(body.project_card.updated_at){
            action.updatedAt = body.project_card.updated_at;
        };
        if(body.project_card.closed_at){
            action.closedAt = body.project_card.closed_at;
        };
        action.event = 'card';
        if(body.changes.column_id.from)
        {
            action.fromLocation = body.changes.column_id.from;
        }
        if(body.project_card.column_id){
            action.toLocation = body.project_card.column_id;
        }
        action.content = `${action.actor} ${action.act} ${action.event}`
        action.actionUrl = body.project_card.project_url;
        console.log(action);
        return this.create(action);
    }

    getProjectColumnEvent(body: any){
        const action = new ActionDTO();
        action.act = body.action;
        action.actor = body.sender.login;
        action.createdAt = body.project_column.created_at;
        action.event = 'column';
        action.content = `${action.actor} ${action.act} ${action.event}`
        action.actionUrl = body.project_column.project_url;
        console.log(action);
        return this.create(action);
    }

    getProjectEvent(body){
        const action = new ActionDTO();
        action.act = body.action;
        action.actor = body.sender.login;
        action.createdAt = body.project.created_at;
        action.event = 'project';
        action.content = `${action.actor} ${action.act} ${action.event}`
        action.actionUrl = body.project.html_url;
        console.log(action);
        return this.create(action);
    }

}