import { IssueLabelService } from './issueLabel.service';
import { IssueLabelController } from './issueLabel.controller';
import { GIssueLabel } from './issueLabel.entity';
import { Module, HttpModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([GIssueLabel])
    ],
    controllers:[IssueLabelController],
    providers: [IssueLabelService]
})
export class IssueLabelModule { }