import { IssueLabelEntity } from './entities/issue.label.entity';
import { Module, HttpModule } from "@nestjs/common";
import { GithubController } from "./github.controller";
import { GithubApi } from "./github.api";
import { GithubService } from "./github.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { RepositoryEntity } from "./entities/repository.entity";
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JWTConstant, jwtConstant } from '../auth/constants';
import { JwtStrategy } from "../auth/jwt.strategy";
import { ProjectEntity } from "./entities/project.entity";
import { IssueEntity } from "./entities/issue.entity";
import { ColumnEntity } from "./entities/column.entity";
import { CommentEntity } from "./entities/comment.entity";
import { MilestoneEntity } from "./entities/milestone.entity";
import { Assignee } from "./entities/assignee.entity";
import { Hook } from "./entities/hook.entity";
import { LabelEntity } from "./entities/label.entity";
import { IssueColumnEntity } from "./entities/issue.column.entity";
import { AirTableApi } from './airtable.api';
import { IssueMileStoneEntity } from './entities/issue.milestone.entity';
import { IssueAirTable } from './entities/issue.airtable.entity';
import { UserAirTable } from './entities/user.airtable.entity';
import { config } from 'rxjs';

const entities = [User, RepositoryEntity, ProjectEntity, IssueEntity, IssueLabelEntity, IssueAirTable, UserAirTable,
  ColumnEntity, CommentEntity, MilestoneEntity, Assignee, Hook, LabelEntity, IssueColumnEntity, IssueMileStoneEntity];

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature(entities),
    PassportModule,
    JwtModule.register({
      secret: jwtConstant.secret,
      signOptions: { expiresIn: '30d' }
    })
  ],
  controllers: [GithubController],
  providers: [
    GithubApi,
    GithubService,
    JwtStrategy,
    AirTableApi
  ],

})
export class GithubModule {
  static entities() {
    return entities;
  }
}