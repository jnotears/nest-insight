import { IssueColumnService } from './issueColumn.service';
import { IssueColumnController } from './issueColumn.controller';
import { GIssueColumn} from './issueColumn.entity';
import { Module, HttpModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([GIssueColumn])
    ],
    controllers:[IssueColumnController],
    providers: [IssueColumnService]
})
export class IssueColumnModule { }