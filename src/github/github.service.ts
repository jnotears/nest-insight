import { Injectable } from "@nestjs/common";
import { GithubApi } from "./github.api";
import { User } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RepositoryEntity } from "./entities/repository.entity";

@Injectable()
export class GithubService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(RepositoryEntity)
    private repoRepo: Repository<RepositoryEntity>,
    private githubApi: GithubApi,
  ) {}

  async login(token: string): Promise<User> {
    const profile = await this.githubApi.getUsername(token);
    let user = await this.userRepo.findOne({
      where: {
        username: profile.username,
      },
    });
    if (!user) {
      user = User.from(profile);
    }

    user.external_token = token;

    await this.userRepo.save(user);

    this.fetchReposity(user);

    return user;
  }

  async fetchReposity(user: User) {
    const repos = await this.githubApi.getRepositories(
      user.username,
      user.external_token,
    );
    const repoEntities = repos.map(repo => ({
      ...RepositoryEntity.from(repo),
      user_id: user.id,
    }));

    await this.repoRepo.save(repoEntities);
  }

  getAllRepos(user_id: string): Promise<RepositoryEntity[]> {
    return this.repoRepo.find({
        where: {
            user_id
        }
    })
  }
}