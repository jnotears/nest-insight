import { IssueAssigneeService } from './issueAssignee.service';
import {Controller, Get, Post, Req} from '@nestjs/common';

@Controller('issue-assignee')
export class IssueAssigneeController{

    constructor(private issueAssignee: IssueAssigneeService){}

    @Get()
    getIssueAssignees(){
        this.issueAssignee.insertIssueAssignees("laituanmanh32");
    }

    @Post()
    listenIssueAssignee(@Req() req){
        this.issueAssignee.listenIssueAssignee(req.body);
    }
}