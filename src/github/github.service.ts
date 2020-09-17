import { Injectable } from "@nestjs/common";
import { GithubApi } from "./github.api";
import { User } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RepositoryEntity } from "./entities/repository.entity";
import { JwtService } from "@nestjs/jwt";
import {
  GitRepositoryAPIResponse, GitIssueAPIResponse,
  GitProjectAPIResponse, GitColumnAPIResponse, GitCommentAPIResponse,
  GitMilestoneAPIResponse, GithubProfileAPIResponse, GitLabelAPIResponse,
  GitIssueColumnAPIResponse
} from "./dtos/github.api.dto";
import { ProjectEntity } from "./entities/project.entity";
import { IssueEntity } from "./entities/issue.entity";
import { ColumnEntity } from "./entities/column.entity";
import { CommentEntity } from "./entities/comment.entity";
import { MilestoneEntity } from "./entities/milestone.entity";
import { Assignee } from "./entities/assignee.entity";
import { Hook } from "./entities/hook.entity";
import { LabelEntity } from "./entities/label.entity";
import { IssueColumnEntity } from "./entities/issue.column.entity";
import { AssigneeResponse, UserResponse } from './dtos/github.ctrl.dto';
import { IssueMileStoneEntity } from "./entities/issue.milestone.entity";
import { IssueLabelEntity } from "./entities/issue.label.entity";
import { AirTableApi } from "./airtable.api";
import { AirTableIssueHandling } from "./dtos/airtable.api.dto";
import { ConfigService } from "@nestjs/config";
import { IssueAirTable } from "./entities/issue.airtable.entity";
import { UserAirTable } from "./entities/user.airtable.entity";


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
    @InjectRepository(IssueLabelEntity) private issueLabelRepo: Repository<IssueLabelEntity>,
    @InjectRepository(IssueMileStoneEntity) private issueMileRepo: Repository<IssueMileStoneEntity>,
    @InjectRepository(IssueAirTable) private issueAirRepo: Repository<IssueAirTable>,
    @InjectRepository(UserAirTable) private userAirRepo: Repository<UserAirTable>,


    private githubApi: GithubApi,
    private jwtService: JwtService,
    private airTableApi: AirTableApi,
    private config: ConfigService
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

  async fetchIssueMilestones(token: string, repo_id: number, repo_name: string, repo_owner: string, milestone_id: number, milestone_number: number): Promise<IssueMileStoneEntity[]> {
    const allIssueMilestones = await this.githubApi.getAllIssueMilestones(token, repo_name, repo_owner, milestone_number);
    return await this.createOrUpdateIssueMilestones(repo_id, milestone_id, allIssueMilestones);
  }


  async remapIssueMilestones(repo_id: number, milestone_id: number, datas: number[]): Promise<IssueMileStoneEntity[]> {
    try {
      let dbIssues: IssueEntity[] = [];
      await Promise.all(datas.map(async ex_id => {
        const dbIssue = await this.issueRepo.findOne({ where: { external_id: ex_id, repo_id: repo_id } });
        if (dbIssue) {
          dbIssues = dbIssues.concat(dbIssue);
        }
      }));
      let issueMileEntities: IssueMileStoneEntity[] = [];
      dbIssues.forEach(issue => {
        const issueMileEntity = {
          ...new IssueMileStoneEntity(),
          issue_id: issue.id,
          milestone_id: milestone_id
        }
        issueMileEntities = issueMileEntities.concat(issueMileEntity);
      });
      return issueMileEntities;
    } catch (error) {

    }
  }

  private async createOrUpdateIssueMilestones(repo_id: number, milestone_id: number, datas: number[]): Promise<IssueMileStoneEntity[]> {
    let issueMileEntities = await this.remapIssueMilestones(repo_id, milestone_id, datas);
    return await this.issueMileRepo.save(issueMileEntities);
  }

  async fetchIssueLabels(token: string, repo_id: number, repo_name: string, repo_owner: string, issue_id: number, issue_number: number): Promise<IssueLabelEntity[]> {
    const allIssueLabels = await this.githubApi.getAllIssuelabels(token, repo_name, repo_owner, issue_number);
    return await this.createOrUpdateIssueLabels(repo_id, issue_id, allIssueLabels);
  }

  async remapIssueLabels(repo_id: number, issue_id: number, datas: string[]): Promise<IssueLabelEntity[]> {
    try {
      let dbLabels: LabelEntity[] = [];
      await Promise.all(datas.map(async label_name => {
        const dbLabel = await this.labelRepo.findOne({ where: { name: label_name, repo_id: repo_id } });
        if (dbLabel) {
          dbLabels = dbLabels.concat(dbLabel);
        }
      }));
      let issueLabelEntities: IssueLabelEntity[] = [];
      dbLabels.forEach(label => {
        const issueLabelEntity = {
          ...new IssueLabelEntity(),
          issue_id: issue_id,
          label_id: label.id
        }
        issueLabelEntities = issueLabelEntities.concat(issueLabelEntity);
      });
      return issueLabelEntities;
    } catch (error) {

    }
  }

  private async createOrUpdateIssueLabels(repo_id: number, issue_id: number, datas: string[]): Promise<IssueLabelEntity[]> {
    let issueLabelEntities = await this.remapIssueLabels(repo_id, issue_id, datas);
    return await this.issueLabelRepo.save(issueLabelEntities);
  }

  private async createOrUpdateHook(user_id: string, repo_id: number, response: any): Promise<Hook> {
    try {
      let hook = {
        ...Hook.from(response),
        repo_id: repo_id,
        owner: user_id
      }
      const dbHook = await this.hookRepo.findOne({ where: { repo_id: repo_id, owner: user_id } });
      if (dbHook) {
        hook.id = dbHook.id;
      }
      return await this.hookRepo.save(hook);
    } catch (error) {

    }
  }

  async registerHook(req: { repo_id: number }): Promise<Hook> {
    try {
      const repo = await this.repoRepo.findOne(req['repo_id']);
      const user = await this.userRepo.findOne(repo.user_id);
      const response = await this.githubApi.registerHook(user.external_token, repo.user_id, repo.owner, repo.name);
      if (response === undefined || response === null || response['status'] != 201) {
        return;
      }
      repo.sync = true;
      this.repoRepo.save(repo);
      this.fetchDatas(user, repo);
      return await this.createOrUpdateHook(user.id, repo.id, response);
    } catch (error) {
      console.log(error);
    }
  }

  async deleteIssue(external_id: number, repo_id: number) {
    const dbIssue = await this.issueRepo.findOne({ where: { external_id: external_id, repo_id: repo_id } });
    if (dbIssue) {
      return await this.issueRepo.remove(dbIssue);
    }
    return;
  }

  async payloadsGitHookHandler(req: any, user_id: string) {
    if (req === null || req === undefined) {
      return;
    }
    try {
      if (req['repository']) {
        const user = await this.userRepo.findOne(user_id);
        const repo = await this.repoRepo.findOne({
          where: {
            external_id: req['repository'].id,
            user_id: user.id
          }
        });
        if (req['action']) {
          if (req['action'] == 'deleted') {
            if (req['issue']) {
              return await this.deleteIssue(req['issue'].id, repo.id);
            }
          }
        }
        this.fetchDatas(user, repo);
      }
    } catch (error) {
    }
  }

  async getUser(id?: string, username?: string): Promise<UserResponse> {
    try {
      if (id) {
        const { external_token, ...user } = await this.userRepo.findOne(id);
        if (user) {
          return user;
        }
      }
      if (username) {
        const { external_token, ...user } = await this.userRepo.findOne({ where: { username: username } });
        if (user) {
          return user;
        }
      }
      return;
    } catch (error) {

    }
  }

  async getRepos(username: string): Promise<RepositoryEntity[]> {
    const user: User = await this.userRepo.findOne({ where: { username: username } });
    const user_id = user.id;
    return this.repoRepo.find({
      where: {
        user_id
      }
    });
  }

  async fetchDatas(user: User, repo: RepositoryEntity) {
    const air_config = await this.userAirRepo.findOne({ where: { user_id: user.id, active: true } })
    const fetchMilestones = await this.fetchMilestones(user.external_token, repo.name, repo.owner, repo.id);
    const fetchLabels = await this.fetchLabels(user.external_token, repo.name, repo.owner, repo.id);

    const fetchProjects = await this.fetchProjects(user.external_token, repo.id, repo.name, repo.owner);
    fetchProjects.forEach(async i => {
      const fetchColumns = await this.fetchColumns(user.external_token, repo.name, repo.owner, i.id, i.number);
    });

    const fetchIssues = await this.fetchIssues(user.external_token, repo.id, repo.name, repo.owner);
    fetchIssues.forEach(async issue => {
      const fetchAssignees = await this.fetchAssignees(user.external_token, repo.name, repo.owner, issue.id, issue.number);
      const fetchComments = await this.fetchComments(user.external_token, repo.name, repo.owner, issue.id, issue.number);
      const fetchIssueColumns = await this.fetchIssueColumns(user.external_token, repo.id, repo.name, repo.owner, issue.id, issue.number);
      const fetchIssueLabels = await this.fetchIssueLabels(user.external_token, repo.id, repo.name, repo.owner, issue.id, issue.number);
      if (air_config) {
        if (fetchIssueColumns && fetchIssueColumns.length > 0) {
          fetchIssueColumns.forEach(async element => {
            this.fillDataToAirTable(air_config.api_key, air_config.base_id, air_config.table_name, issue, element.proj_id);
          });
        }
      }
    });

    fetchMilestones.forEach(async i => {
      const fetchIssueMilestones = await this.fetchIssueMilestones(user.external_token, repo.id, repo.name, repo.owner, i.id, i.number);
    });
  }

  async remapAirTableHandling(api_key: string, base_id: string, table_name: string, issue: IssueEntity, project_name: string) {
    const data: AirTableIssueHandling = {
      issue: issue,
      project_name: project_name,
      record_id: ''
    }
    const apiData = await this.airTableApi.getIssuesByProjectName(api_key, base_id, table_name, project_name);
    if (apiData && apiData.records.length > 0) {
      apiData.records.forEach(element => {
        if (data.issue.name == element.fields.Name) {
          data.record_id = element.id;
        }
      });
    }
    return data;
  }

  async createOrUpdateIssueAirtable(issue_id: number, issue_name: string, record_id: string, project_name: string) {
    const issueAir: IssueAirTable = {
      ...new IssueAirTable(),
      issue_id: issue_id,
      record_id: record_id,
      project_name: project_name,
      issue_name: issue_name,
    }
    return await this.issueAirRepo.save(issueAir);
  }

  async fillDataToAirTable(api_key: string, base_id: string, table_name: string, issue: IssueEntity, project_id: number) {
    const proj = await this.projRepo.findOne(project_id);
    const data: AirTableIssueHandling = await this.remapAirTableHandling(api_key, base_id, table_name, issue, proj.name);
    this.updateIssueFromAirTableWithInterval(api_key, base_id, table_name);
    const response = await this.airTableApi.createOrUpdateIssueRecord(api_key, base_id, table_name, data);
    if (response && response['id']) {
      return await this.createOrUpdateIssueAirtable(issue.id, issue.name, response['id'], proj.name);
    }
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

  async getSyncMilestones(username: string): Promise<MilestoneEntity[]> {
    try {
      const repos = await this.getSyncRepos(username);
      let milestones: MilestoneEntity[] = [];
      await Promise.all(repos.map(async repo => {
        let miles = await this.milestoneRepo.find({ where: { repo_id: repo.id } });
        if (miles && miles.length > 0) {
          milestones = milestones.concat(miles);
        }
      }));
      return milestones;
    } catch (error) {
      console.log(error);
    }
  }

  private async updateIssue(record_id: string, estimate: number) {
    try {
      const issueAir = await this.issueAirRepo.findOne({ where: { record_id: record_id } });
      if (issueAir) {
        const issue = await this.issueRepo.findOne(issueAir.issue_id);
        issue.estimate = estimate;
        return this.issueRepo.save(issue);
      }
    } catch (error) {

    }
  }

  isInWorkingTime(workTimes: { startTime: number, endTime: number }[]): boolean {
    try {
      if (workTimes || workTimes.length > 0) {
        let boolean = false;
        const now = (new Date).toLocaleString("en-US", { timeZone: "Asia/Ho_chi_minh" });
        const timeNow = (new Date(new Date(now).toISOString())).getHours();
        workTimes.forEach(point => {
          if (timeNow >= point.startTime && timeNow <= point.endTime) {
            boolean = true;
          }
        })
        if(boolean){
          return true;
        }
      }
      return false;
    } catch (error) {

    }
  }

  async updateIssueFromAirTableWithInterval(api_key: string, base_id: string, table_name: string) {
    try {
      setInterval(async () => {
        if (this.isInWorkingTime([{ startTime: 8, endTime: 24 }])) {
          const datas = await this.airTableApi.getAllIssues(api_key, base_id, table_name);
          if (datas && datas['records'].length > 0) {
            const issueAirs = datas['records'];
            issueAirs.forEach(element => {
              const issue = element['fields'];
              if (issue && issue['Estimate Time']) {
                this.updateIssue(element['id'], issue['Estimate Time']);
              }
            });
          }
        }
      }, this.config.get<number>('AIRTABLE_API_TIMEOUT'))
    } catch (error) {

    }
  }

  async createOrUpdateAirTableConfig(req: { user_id: string, api_key: string, base_id: string, table_name: string, connect_name: string, active: boolean }): Promise<UserAirTable> {
    try {
      const config = {
        ...new UserAirTable(),
        user_id: req.user_id,
        api_key: req.api_key,
        base_id: req.base_id,
        table_name: req.table_name,
        connect_name: req.connect_name,
        active: req.active
      }
      return await this.userAirRepo.save(config);
    } catch (error) {

    }
  }

  async getAirConfigs(username: string): Promise<UserAirTable> {
    const user = await this.getUser(null, username);
    return await this.userAirRepo.findOne({ where: { user_id: user.id, active: true } });
  }

  async deteleAirConfig(req: {user_id: string, api_key: string, base_id: string, table_name: string}){
    try {
      const dbAirConfig = await this.userAirRepo.findOne({where: {user_id: req.user_id, api_key: req.api_key, base_id: req.base_id, table_name: req.table_name}});
      if(dbAirConfig){
        return this.userAirRepo.remove(dbAirConfig);
      }
    } catch (error) {
      
    }
  }

}