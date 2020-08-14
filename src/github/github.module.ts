import { Module, HttpModule } from "@nestjs/common";
import { GithubController } from "./github.controller";
import { GithubApi } from "./github.api";
import { GithubService } from "./github.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { RepositoryEntity } from "./entities/repository.entity";

const entities = [User, RepositoryEntity];

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