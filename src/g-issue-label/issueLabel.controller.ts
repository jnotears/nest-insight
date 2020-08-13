import { IssueLabelService } from './issueLabel.service';
import {Controller, Get} from '@nestjs/common';

@Controller('issue-label')
export class IssueLabelController{

    constructor(private label: IssueLabelService){}

    @Get()
    getLabels(){
        this.label.insertIssueLabels("thoaduong");
    }
}