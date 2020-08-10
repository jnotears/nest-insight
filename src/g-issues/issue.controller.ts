import {Controller, Get} from '@nestjs/common';
import { IssueService } from './issue.service';

@Controller('issue')
export class IssueController{

    constructor(
        private readonly issue: IssueService
    ){}

    @Get()
    getIssues(){
        //this.issue.getIssues("jnotears","angular-shopping-app").subscribe(val => console.log(JSON.stringify(val.data,null,2)));
        this.issue.fillData("jnotears","angular-shopping-app");
    }
}