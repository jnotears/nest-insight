import {Injectable} from '@nestjs/common';
import { ColumnService } from '../g-columns/column.service';
import { IssueService } from '../g-issues/issue.service';
import { MilestoneService } from '../g-milestones/milestone.service';
import { ProjectService } from '../g-projects/project.service';
import { RepositoryService } from '../g-repositories/repository.service';

@Injectable()
export class InitDataService{

    constructor(
        private readonly colService: ColumnService,
        private readonly issueService: IssueService,
        private readonly milestoneService: MilestoneService,
        private readonly projService: ProjectService,
        private readonly repoService: RepositoryService,
    ){}

    initData(username: string){
        try {
            this.colService.fillData(username);
            this.issueService.fillData(username);
            this.milestoneService.fillData(username);
            this.projService.fillData(username);
            this.repoService.fillData(username);
            return;
        } catch (error) {
            return;
        }
    }
}
  