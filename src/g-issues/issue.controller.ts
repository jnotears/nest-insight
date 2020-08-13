import { Controller, Get, Post, Req } from '@nestjs/common';
import { IssueService } from './issue.service';

@Controller('issue')
export class IssueController {

    constructor(
        private readonly issue: IssueService
    ) { }

    @Get()
    getIssues() {
        this.issue.fillData("jnotears");
    }

    @Post()
    listenRequest(@Req() req){
        this.issue.listenIssue(req.body);
    }
}