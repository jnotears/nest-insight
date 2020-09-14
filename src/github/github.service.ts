import { Injectable } from "@nestjs/common";
import { GithubApi } from "./github.api";
import { User } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RepositoryEntity } from "./entities/repository.entity";
import { JwtService } from "@nestjs/jwt";
import { ProfileResponse, GitRepositoryAPIResponse, GitIssueAPIResponse, 
GitProjectAPIResponse, GitColumnAPIResponse, GitCommentAPIResponse, 
GitMilestoneAPIResponse, GithubProfileAPIResponse, GitLabelAPIResponse, 
GitIssueColumnAPIResponse } from "./dtos/github.api.dto";
import { ProjectEntity } from "./entities/project.entity";
import { IssueEntity } from "./entities/issue.entity";
import { ColumnEntity } from "./entities/column.entity";
import { CommentEntity } from "./entities/comment.entity";
import { MilestoneEntity } from "./entities/milestone.entity";
import { Assignee } from "./entities/assignee.entity";
import { Hook } from "./entities/hook.entity";
import { LabelEntity } from "./entities/label.entity";
import { IssueColumnEntity } from "./entities/issue.column.entity";
import { AssigneeResponse, RepositoryExtendedResponse } from './dtos/github.ctrl.dto';

@Injectable()
export class GithubService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(RepositoryEntity) private repoRepo: Repository<RepositoryEntity>,
    @InjectRepository(ProjectEntity) private projRepo: Repository<ProjectEntity>,
    @InjectRepository(IssueEntity) private issueRepo: Repository<IssueEntity>,
    @InjectRepository(ColumnEntity) private columnRepo: Repository<ColumnEntity>,
    @InjectRepository(CommentEntity) private commentRepo: Repository<CommentEntity>,
    @InjectRepository(MilestoneEntity) private milestoneRepo: Repository<MilestoneEntity>,
    @InjectRepository(Assignee) private assigneeRepo: Repository<Assignee>,
    @InjectRepository(Hook) private hookRepo: Repository<Hook>,
    @InjectRepository(LabelEntity) private labelRepo: Repository<LabelEntity>,
    @InjectRepository(IssueColumnEntity) private issueColumnRepo: Repository<IssueColumnEntity>,

    private githubApi: GithubApi,
    private jwtService: JwtService
  ) { }

  getGithubAccessToken(code: string): Promise<object> {
    return this.githubApi.getGithubToken(code);
  }

  async login(token: string): Promise<{ access_token; username }> {
    const profile = await this.githubApi.getUser(token);
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

    this.fetchRepositories(user.external_token, user.id, user.username);

    const payload = { sub: user.id, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
      username: user.username
    };
  }

  async findUserByUsername(username: string): Promise<User> {
    return this.userRepo.findOne({
      where: {
        username: username
      }
    })
  }

  async fetchUser(token: string, username: string): Promise<User> {
    const gUser = await this.githubApi.getUser(token, username);
    if (gUser) {
      await this.createOrUpdateUser(User.from(gUser));
    }
    return this.findUserByUsername(username);
  }

  async remapDbUsers(users: User[]): Promise<User[]> {
    const dbUsers = await this.userRepo.find();
    users.forEach(user => {
      const dbUser = dbUsers.find(i => i.username == user.username);
      if (dbUser) {
        user.id = dbUser.id;
      }
    })
    return users;
  }

  private async createOrUpdateUsers(datas: GithubProfileAPIResponse[]): Promise<User[]> {
    let users = datas.map(user => ({
      ...new User(),
      ...user
    }));
    users = await this.remapDbUsers(users);
    return await this.userRepo.save(users);
  }

  private async createOrUpdateUser(user: User): Promise<User> {
    let dbUser = await this.userRepo.findOne({
      where: { username: user.username }
    })
    if (!dbUser) {
      dbUser = {
        ...new User(),
        ...user
      };
    }
    Object.assign(dbUser, user);
    return await this.userRepo.save(dbUser);
  }

  async remapDbRepositories(repositoryEntities: RepositoryEntity[]): Promise<RepositoryEntity[]> {
    const dbRepos = await this.repoRepo.find();
    repositoryEntities.forEach(repo => {
      const dbRepo = dbRepos.find(i => i.external_id == repo.external_id && i.user_id == repo.user_id);
      if (dbRepo) {
        repo.id = dbRepo.id;
      }
    })
    return repositoryEntities;
  }

  private async createOrUpdateRepositories(user_id: string, datas: GitRepositoryAPIResponse[]): Promise<RepositoryEntity[]> {
    let repositoryEntities = datas.map(repo => ({
      ...RepositoryEntity.from(repo),
      user_id: user_id
    }));
    repositoryEntities = await this.remapDbRepositories(repositoryEntities);
    return await this.repoRepo.save(repositoryEntities);
  }

  async fetchRepositories(token: string, user_id: string, username: string): Promise<RepositoryEntity[]> {
    const allRepositories = await this.githubApi.getAllRepositories(token, username);
    return await this.createOrUpdateRepositories(user_id, allRepositories);
  }

  async fetchProjects(token: string, repo_id: number, repo_name: string, repo_owner: string): Promise<ProjectEntity[]> {
    const allProjetcs = await this.githubApi.getAllProjects(token, repo_name, repo_owner);
    return await this.createOrUpdateProjects(repo_id, allProjetcs);
  }

  private async createOrUpdateProjects(repo_id: number, datas: GitProjectAPIResponse[]): Promise<ProjectEntity[]> {
    let projectEntities = datas.map(proj => ({
      ...ProjectEntity.from(proj),
      repo_id: repo_id
    }));
    projectEntities = await this.remapDbProjects(projectEntities);
    return await this.projRepo.save(projectEntities);
  }

  async remapDbProjects(projectEntities: ProjectEntity[]): Promise<ProjectEntity[]> {
    const dbProjects = await this.projRepo.find();
    projectEntities.forEach(proj => {
      const dbProject = dbProjects.find(i => i.external_id == proj.external_id && i.repo_id == proj.repo_id);
      if (dbProject) {
        proj.id = dbProject.id;
      }
    })
    return projectEntities;
  }

  async createOrUpdateIssue(Issue: IssueEntity) {

  }

  // get all raw data <= github api
  // convert data 
  // save data to database
  async fetchIssues(token: string, repo_id: number, repo_name: string, repo_owner: string): Promise<IssueEntity[]> {
    const allIssue = await this.githubApi.getAllIssues(token, repo_name, repo_owner);
    return await this.createOrUpdateIssues(repo_id, allIssue);
  }

  async fetchIssue(token, repo_id, repo_name, issue_id): Promise<IssueEntity[]> {
    const issue: GitIssueAPIResponse = await this.githubApi.getIssueById(token, issue_id);
    return await this.createOrUpdateIssues(repo_id, [issue]);
  }

  private async createOrUpdateIssues(repo_id: number, datas: Array<GitIssueAPIResponse>): Promise<IssueEntity[]> {
    let issueEntities = datas.map(issue => ({
      ...IssueEntity.from(issue),
      repo_id: repo_id
    }));
    issueEntities = await this.remapDbIssues(issueEntities);
    return await this.issueRepo.save(issueEntities);
  }

  async remapDbIssues(issueEntities: IssueEntity[]): Promise<IssueEntity[]> {
    const dbIssues = await this.issueRepo.find();
    issueEntities.forEach(issue => {
      const dbIssue = dbIssues.find(i => i.external_id == issue.external_id && i.repo_id == issue.repo_id);
      if (dbIssue) {
        issue.id = dbIssue.id;
      }
    })
    return issueEntities;
  }

  async fetchColumns(token: string, repo_name: string, repo_owner, proj_id: number, proj_number: number): Promise<ColumnEntity[]> {
    const allColumns = await this.githubApi.getAllColumns(token, repo_name, repo_owner, proj_number);
    return await this.createOrUpdateColumns(proj_id, allColumns);
  }

  async remapDbColumns(columnEntities: ColumnEntity[]): Promise<ColumnEntity[]> {
    const dbColumns = await this.columnRepo.find();
    columnEntities.forEach(col => {
      const dbCol = dbColumns.find(i => i.external_id == col.external_id && i.proj_id == col.proj_id);
      if (dbCol) {
        col.id = dbCol.id;
      }
    })
    return columnEntities;
  }

  private async createOrUpdateColumns(proj_id: number, datas: GitColumnAPIResponse[]): Promise<ColumnEntity[]> {
    let columnEntities = datas.map(col => ({
      ...ColumnEntity.from(col),
      proj_id: proj_id
    }));
    columnEntities = await this.remapDbColumns(columnEntities);
    return await this.columnRepo.save(columnEntities);
  }

  async fetchComments(token: string, repo_name: string, repo_owner, issue_id: number, issue_number: number): Promise<CommentEntity[]> {
    const allComments = await this.githubApi.getAllComments(token, repo_name, repo_owner, issue_number);
    return await this.createOrUpdateComments(issue_id, allComments);
  }

  async remapDbComments(commentEntities: CommentEntity[]): Promise<CommentEntity[]> {
    const dbCmts = await this.commentRepo.find();
    commentEntities.forEach(cmt => {
      const dbCmt = dbCmts.find(i => i.external_id == cmt.external_id && i.issue_id == cmt.issue_id);
      if (dbCmt) {
        cmt.id = dbCmt.id;
      }
    })
    return commentEntities;
  }

  private async createOrUpdateComments(issue_id: number, datas: GitCommentAPIResponse[]): Promise<CommentEntity[]> {
    let commentEntities = datas.map(cmt => ({
      ...CommentEntity.from(cmt),
      issue_id: issue_id
    }));
    commentEntities = await this.remapDbComments(commentEntities);
    return await this.commentRepo.save(commentEntities);
  }

  async fetchMilestones(token: string, repo_name: string, repo_owner, repo_id: number,): Promise<MilestoneEntity[]> {
    const allMilestones = await this.githubApi.getAllMilestones(token, repo_name, repo_owner);
    return await this.createOrUpdateMilestones(repo_id, allMilestones);
  }

  async remapDbMilestones(milestoneEntities: MilestoneEntity[]): Promise<MilestoneEntity[]> {
    const dbMilestones = await this.milestoneRepo.find();
    milestoneEntities.forEach(mile => {
      const dbMilestone = dbMilestones.find(i => i.repo_id == mile.repo_id && i.name == mile.name);
      if (dbMilestone) {
        mile.id = dbMilestone.id;
      }
    })
    return milestoneEntities;
  }

  private async createOrUpdateMilestones(repo_id: number, datas: GitMilestoneAPIResponse[]): Promise<MilestoneEntity[]> {
    let milestoneEntities: MilestoneEntity[] = datas.map(mile => ({
      ...MilestoneEntity.from(mile),
      repo_id: repo_id
    }));
    milestoneEntities = await this.remapDbMilestones(milestoneEntities);
    return await this.milestoneRepo.save(milestoneEntities);
  }

  async fetchAssignees(token: string, repo_name: string, repo_owner, issue_id: number, issue_number: number,): Promise<User[]> {
    const allAssignees = await this.githubApi.getAllAssignees(token, repo_name, repo_owner, issue_number);
    return await this.createOrUpdateAssignees(issue_id, allAssignees);
  }

  private async createOrUpdateAssignees(issue_id: number, datas: GithubProfileAPIResponse[]): Promise<User[]> {
    const users = await this.createOrUpdateUsers(datas);
    let assignees: Assignee[] = users.map(user => ({
      ...new Assignee(),
      user_id: user.id,
      issue_id: issue_id
    }));
    await this.assigneeRepo.save(assignees);
    return users;
  }

  async fetchLabels(token: string, repo_name: string, repo_owner, repo_id: number): Promise<LabelEntity[]> {
    const allLabels = await this.githubApi.getAllLabels(token, repo_name, repo_owner);
    return await this.createOrUpdateLabels(repo_id, allLabels);
  }

  async remapDbLabels(labelEntities: LabelEntity[]): Promise<LabelEntity[]> {
    const dbLabels = await this.labelRepo.find();
    labelEntities.forEach(label => {
      const dbLabel = dbLabels.find(i => i.name == label.name && i.repo_id == label.repo_id);
      if (dbLabel) {
        label.id = dbLabel.id;
      }
    })
    return labelEntities;
  }

  private async createOrUpdateLabels(repo_id: number, datas: GitLabelAPIResponse[]): Promise<LabelEntity[]> {
    let labelEntities = datas.map(label => ({
      ...LabelEntity.from(label),
      repo_id: repo_id
    }));
    labelEntities = await this.remapDbLabels(labelEntities);
    return await this.labelRepo.save(labelEntities);
  }

  async fetchIssueColumns(token: string, repo_id: number, repo_name: string, repo_owner, issue_id: number, issue_number: number): Promise<IssueColumnEntity[]> {
    const allIssueColumns = await this.githubApi.getAllIssueColumns(token, repo_name, repo_owner, issue_number);
    return await this.createOrUpdateIssueColumns(repo_id, issue_id, allIssueColumns);
  }

  async remapIssueColumns(repo_id: number, issue_id: number, datas: GitIssueColumnAPIResponse[]): Promise<IssueColumnEntity[]> {
    const dbProjs = await this.projRepo.find({ where: { repo_id: repo_id } });
    const dbCols = await this.columnRepo.find();
    const issueColEntities = datas.map(issueCol => {
      const dbProj = dbProjs.find(i => i.external_id == issueCol.proj_external_id);
      const dbCol = dbCols.find(i => i.proj_id == dbProj.id && i.external_id == issueCol.col_external_id);
      return {
        ...new IssueColumnEntity(),
        col_id: dbCol.id,
        proj_id: dbProj.id,
        issue_id: issue_id
      }
    });
    return issueColEntities;
  }

  private async createOrUpdateIssueColumns(repo_id: number, issue_id: number, datas: GitIssueColumnAPIResponse[]): Promise<IssueColumnEntity[]> {
    let issueColEntities = await this.remapIssueColumns(repo_id, issue_id, datas);
    return await this.issueColumnRepo.save(issueColEntities);
  }

  async getRepos(username: string): Promise<RepositoryEntity[]> {
    const user: User = await this.userRepo.findOne({ where: { username: username } });
    const user_id = user.id;
    return this.repoRepo.find({
      where: {
        user_id
      }
    })
  }

  async getRepoExtended(repo_id: number): Promise<RepositoryExtendedResponse> {
    let { created_at, external_id, ...repo } = await this.repoRepo.findOne(repo_id);
    let user = await this.getUserResponse(repo.user_id, null);
    return {
      ...repo,
      user_name: user.name,
      user_avatar: user.avatar_url,
      user_email: user.email
    }
  }

  async getAllRepos(username: string): Promise<RepositoryExtendedResponse[]> {
    return Promise.all((await this.getRepos(username)).map(repo => {
      return this.getRepoExtended(repo.id);
    }));
  }

  async getUserResponse(user_id?: string, user_name?: string): Promise<ProfileResponse> {
    if (user_name) {
      let { created_at, updated_at, id, username, external_token, ...user } = await this.userRepo.findOne({ where: { username: user_name } });
      return user;
    } else {
      if (user_id) {
        let { created_at, updated_at, id, username, external_token, ...user } = await this.userRepo.findOne(user_id);
        return user;
      }
    }
    return null;
  }

  private async createOrUpdateHook(repo_id: number, req: object): Promise<Hook> {
    let hook = {
      ...Hook.from(req),
      repo_id: repo_id
    }
    return
  }

  async registerHook(req: object): Promise<any> {
    const user: User = await this.userRepo.findOne({ where: { username: req['username'] } });
    if (req['repo_name']) {
      const repo: RepositoryEntity = await this.repoRepo.findOne({ where: { name: req['repo_name'] } })
      return this.githubApi.registerHook(user.username, user.external_token, req['repo_name']).then(
        response => {
          if (response.status == 201) {
            const hook = {
              ...Hook.from(response),
              repo_id: repo.id
            };
            this.hookRepo.findOne({
              where: {
                external_id: hook.external_id,
                repo_id: hook.repo_id
              }
            }).then(val => {
              if (!val) {
                this.hookRepo.save(hook).then(() => {
                  this.fetchDatas(user, repo);
                });
              }
            });
            repo.sync = true;
            this.repoRepo.save(repo);
          }
        }
      );
    }
  }

  async fetchDatas(user: User, repo: RepositoryEntity) {
    const fetchProjects = await this.fetchProjects(user.external_token, repo.id, repo.name, repo.owner);
    fetchProjects.forEach(async i => {
      const fetchColumns = await this.fetchColumns(user.external_token, repo.name, repo.owner, i.id, i.number);
    });

    const fetchIssues = await this.fetchIssues(user.external_token, repo.id, repo.name, repo.owner);
    fetchIssues.forEach(async i => {
      const fetchAssignees = await this.fetchAssignees(user.external_token, repo.name, repo.owner, i.id, i.number);
      const fetchComments = await this.fetchComments(user.external_token, repo.name, repo.owner, i.id, i.number);
      const fetchIssueColumns = await this.fetchIssueColumns(user.external_token, repo.id, repo.name, repo.owner, i.id, i.number);
    });

    const fetchMilestones = await this.fetchMilestones(user.external_token, repo.name, repo.owner, repo.id);
    const fetchLabels = await this.fetchLabels(user.external_token, repo.name, repo.owner, repo.id);

  }

  async getSyncRepos(username: string): Promise<RepositoryEntity[]> {
    return new Promise(async resovle => {
      try {
        const user = await this.userRepo.findOne({ where: { username: username } })
        const repos = await this.repoRepo.find({
          where: { user_id: user.id, sync: true }
        })
        resovle(repos)
      } catch (err) {
        console.log(err)
      }
    })
  }

  async getSyncIssues(username: string): Promise<IssueEntity[]> {
    try {
      const repos = await this.getSyncRepos(username);
      let issues: IssueEntity[] = [];
      await Promise.all(repos.map(async repo => {
        const issueList = await this.issueRepo.find({ where: { repo_id: repo.id } });
        if (issueList && issueList.length > 0) {
          issues = issues.concat(issueList);
        }
      }));
      return issues;
    } catch (e) {
      console.log(e)
    }
  }

  async getSyncProjects(username: string): Promise<ProjectEntity[]> {
    try {
      const repos = await this.getSyncRepos(username);
      let projects: ProjectEntity[] = [];
      await Promise.all(repos.map(async repo => {
        const projs = await this.projRepo.find({ where: { repo_id: repo.id } });
        if (projs && projs.length > 0) {
          projects = projects.concat(projs);
        }
      }));
      return projects;
    } catch (error) {
      console.log(error)
    }
  }

  async remapAssigneeResponse(assignees: Assignee[]): Promise<AssigneeResponse[]> {
    try {
      const assigns = await Promise.all(assignees.map(async assign => {
        const user = await this.userRepo.findOne(assign.user_id);
        return {
          user_id: user.id,
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url,
          issue_id: assign.issue_id
        }
      }));
      return assigns;
    } catch (error) {

    }
    return
  }

  async getSyncAssignees(username: string): Promise<AssigneeResponse[]> {
    try {
      const issues = await this.getSyncIssues(username);
      let assignees: AssigneeResponse[] = [];
      await Promise.all(issues.map(async issue => {
        let assigns = await this.assigneeRepo.find({ where: { issue_id: issue.id } });
        if (assigns && assigns.length > 0) {
          assignees = assignees.concat(await this.remapAssigneeResponse(assigns));
        }
      }));
      return assignees;
    } catch (error) {
      console.log(error);
    }
  }

  async payloadsGitHookHandler(req: any) {
    if (req === null || req === undefined) {
      return;
    }
    if (req['repository']) {
      const user = await this.userRepo.findOne({ where: { username: req['sender'].login } });
      const repo = await this.repoRepo.findOne({
        where: {
          external_id: req['repository'].id,
          user_id: user.id
        }
      });
      this.fetchDatas(user, repo);
    }
  }
}