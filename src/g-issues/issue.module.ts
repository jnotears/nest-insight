import { Module, HttpModule } from '@nestjs/common';
import { IssueService } from './issue.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from './issue.entity';
import { Converter } from 'src/helper/converter';
import { IssueController } from './issue.controller';

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([Issue])
    ],
    controllers:[IssueController],
    providers: [
        IssueService,
        Converter
    ]
})
export class IssueModule { }