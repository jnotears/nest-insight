import { IssueColumnService } from './issueColumn.service';
import {Controller, Get} from '@nestjs/common';

@Controller('issue-column')
export class IssueColumnController{

    constructor(private issueColumn: IssueColumnService){}

    @Get()
    getLabels(){
        this.issueColumn.insertIssueColumns("thoaduong");
    }
}