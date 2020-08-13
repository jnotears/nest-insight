import { IssueAssigneeService } from './issueAssignee.service';
import { IssueAssigneeController } from './issueAssignee.controller';
import { GIssueAssignee } from './issueAssignee.entity';
import { Module, HttpModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([GIssueAssignee])
    ],
    controllers:[IssueAssigneeController],
    providers: [IssueAssigneeService]
})
export class IssueAssigneeModule { }