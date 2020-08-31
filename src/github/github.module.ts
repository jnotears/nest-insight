import { CommentEntity } from './entities/comment.entity';
import { IssueAssigneeEntity } from './entities/issueassignee.entity';
import { IssueColumnEntity } from './entities/issuecolumn.entity';
import { IssueLabelEntity } from './entities/issuelabel.entity';
import { ColumnEntity } from './entities/column.entity';
import { MilestoneEntity } from './entities/milestone.entity';
import { ProjectEntity } from './entities/project.entity';
import { LabelEntity } from './entities/label.entity';
import { IssueEntity } from './entities/issue.entity';
import { Module, HttpModule } from "@nestjs/common";
import { GithubController } from "./github.controller";
import { GithubApi } from "./github.api";
import { GithubService } from "./github.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { RepositoryEntity } from "./entities/repository.entity";

const entities = [
  User, 
  RepositoryEntity, 
  IssueEntity, 
  LabelEntity,
  ProjectEntity,
  MilestoneEntity,
  ColumnEntity,
  IssueLabelEntity,
  IssueColumnEntity,
  IssueAssigneeEntity,
  CommentEntity,
];

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature(entities)],
  controllers: [GithubController],
  providers: [GithubApi, GithubService],
})
export class GithubModule {
    static entities() {
        return entities;
    }
}