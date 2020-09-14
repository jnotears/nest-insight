import { Injectable, HttpService } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { GithubProfileAPIResponse, GitRepositoryAPIResponse, 
GitIssueAPIResponse, GitProjectAPIResponse, GitColumnAPIResponse, 
GitCommentAPIResponse, GitMilestoneAPIResponse, GitLabelAPIResponse, 
GitIssueColumnAPIResponse } from './dtos/github.api.dto';
import { hooksConfig } from './webhook.config';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ConfigService } from "@nestjs/config";


@Injectable()
export class GithubApi {
  constructor(
    private http: HttpService,
    private configService: ConfigService
  ) { }

  private createHeaders(token: string): any {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  private createHttpOptions(token: string): AxiosRequestConfig {
    return {
      headers: this.createHeaders(token),
    };
  }

  private escapeQuery(str: string): string {
    const res: string = str.replace(/ /gm, '').replace(/(\r\n|\n|\r)/gm, ' ');
    return res ? res : str;
  }

  private rawQuery<T>(query: string, config?: AxiosRequestConfig): Promise<T> {
    return this.http
      .post<any>(
        this.configService.get<string>('GITHUB_GRAPH_URL'),
        { query: this.escapeQuery(query) },
        config,
      )
      .toPromise()
      .then(res => res.data.data);
  }

  private createParamsGithubToken(code: string){
    return {
      client_id: this.configService.get<string>('CLIENT_ID'),
      client_secret: this.configService.get<string>('CLIENT_SECRET'),
      code: code
    }
  }

  getGithubToken(code: string){
    return this.http.post<object>(
      this.configService.get<string>('GITHUB_TOKEN_URL'),
      this.createParamsGithubToken(code),
      {
        headers: {
          "accept": "application/json",
        },
      }
    ).toPromise()
      .then(val => val.data);
  }

  getUser(token: string, username?: string): Promise<GithubProfileAPIResponse> {

    const query = `{
      {{option}}{
          login
          name
          email
          avatarUrl
      }
    }`.replace('{{option}}', username ? `user(login: "${username}")` : 'viewer');
    if (username) {
      return this.rawQuery<any>(query, this.createHttpOptions(token))
        .then(data => ({
          username: data.user.login,
          name: data.user.name,
          email: data.user.email,
          avatar_url: data.user.avatarUrl
        }));
    } else {
      return this.rawQuery<any>(query, this.createHttpOptions(token))
        .then(data => ({
          username: data.viewer.login,
          name: data.viewer.name,
          email: data.viewer.email,
          avatar_url: data.viewer.avatarUrl
        }));
    }
  }

  getOrganizations(username: string, token: string, cursor?: string, first?: number) {

  }

  async getAllRepositories(token: string, username: string): Promise<GitRepositoryAPIResponse[]> {
    let _cursor = '';
    let datas: GitRepositoryAPIResponse[] = [];

    while (true) {
      const { repos, cursor } = await this.getRepositories(token, username, _cursor);
      if (repos.length == 0) {
        break;
      }
      datas = datas.concat(repos);
      _cursor = cursor['cursor'];
    }
    return datas;
  }

  private getRepositories(token: string, username: string, cursor?: string, first?: number): Promise<{ repos: GitRepositoryAPIResponse[]; cursor: string }> {
    const query = `{
      user(login: "${username}") {
        repositories({{cursor}} first: ${first | 100}) {
          nodes {
            databaseId
            name
            owner {
              login
            } 
          }
          edges {
            cursor
          }
        }
      }
    }`.replace('{{cursor}}', cursor ? `after: "${cursor}",` : '');
    return this.rawQuery<any>(query, this.createHttpOptions(token))
      .then(data => {
        const repos = data.user.repositories.nodes;
        const cursors = data.user.repositories.edges;
        if(cursors === null || cursors === undefined || cursors.length == 0){
          return Promise.resolve({ repos: [], cursor: cursor });
        }else{
          return {
            repos: repos.map(repo => ({
              external_id: repo.databaseId,
              name: repo.name,
              owner: repo.owner.login
            })),
            cursor: cursors[cursors.length - 1]
          }
        }
      }
      );
  }

  async getAllProjects(token: string, repo_name: string, repo_owner: string): Promise<GitProjectAPIResponse[]> {
    let _cursor = '';
    let datas: GitProjectAPIResponse[] = [];
    while (true) {
      const { projects, cursor } = await this.getProjects(token, repo_name, repo_owner, _cursor);
      if (projects.length == 0) {
        break;
      }
      datas = datas.concat(projects);
      _cursor = cursor['cursor'];
    }
    return datas;
  }

  private getProjects(token: string, repo_name: string, repo_owner: string, cursor?: string, first?: number): Promise<{ projects: GitProjectAPIResponse[]; cursor: string }> {
    const query =
      `{
        repository(name: "${repo_name}", owner: "${repo_owner}") {
          projects({{cursor}} first: ${first | 100}) {
            nodes {
              databaseId
              number
              name
              body
              state
              closedAt
            }
            edges {
              cursor
            }
          }
        }
      }`.replace('{{cursor}}', cursor ? `after: "${cursor}",` : '');
    return this.rawQuery<any>(query, this.createHttpOptions(token))
      .then(data => {
        const projects = data.repository.projects.nodes;
        const cursors = data.repository.projects.edges;
        if(cursors === null || cursors === undefined || cursors.length == 0){
          return Promise.resolve({ projects: [], cursor: cursor });
        }else{
          return {
            projects: projects.map(project => ({
              external_id: project.databaseId,
              number: project.number,
              name: project.name,
              description: project.body,
              state: project.state,
              closed_at: project.closedAt ? project.closedAt : null
            })),
            cursor: cursors[cursors.length - 1]
          }
        }
      })
      .catch();
  }

  async getAllIssues(token: string, repo_name: string, repo_owner: string): Promise<GitIssueAPIResponse[]> {
    let _cursor = '';
    let datas: Array<GitIssueAPIResponse> = [];
    while (true) {
      const { issues, cursor } = await this.getIssues(token, repo_name, repo_owner, _cursor);
      if (issues.length == 0) {
        break;
      }
      datas = datas.concat(issues);
      _cursor = cursor['cursor'];
    }
    return datas;
  }

  private getIssues(token: string, repo_name: string, repo_owner: string, cursor?: string, first?: number): Promise<{ issues: Array<GitIssueAPIResponse>; cursor: string }> {
    const query = `{
      repository(name: "${repo_name}", owner: "${repo_owner}") {
        issues({{cursor}} first: ${first | 100}) {
          nodes {
            databaseId
            number
            title
            state
            author {
              login
            }
            bodyText
            url
            closedAt
          }
          edges {
            cursor
          }
        }
      }
    }`.replace('{{cursor}}', cursor ? `after: "${cursor}",` : "");
    return this.rawQuery<any>(query, this.createHttpOptions(token))
      .then(data => {
        const issues = data.repository.issues.nodes;
        const cursors = data.repository.issues.edges;
        if(cursors === null || cursors === undefined || cursors.length == 0){
          return Promise.resolve({ issues: [], cursor: cursor });
        }else{
          return {
            issues: issues.map(issue => ({
              external_id: issue.databaseId,
              number: issue.number,
              name: issue.title,
              state: issue.state,
              author: issue.author.login,
              content: issue.bodyText,
              url: issue.url,
              closed_at: issue.closedAt ? issue.closedAt : null
            })),
            cursor: cursors[cursors.length - 1]
          }
        }
      });
  }

  getIssueById(token, issue_id): Promise<GitIssueAPIResponse> {
    return null;
  }

  async getAllColumns(token: string, repo_name: string, repo_owner: string, proj_number: number): Promise<GitColumnAPIResponse[]> {
    let _cursor = '';
    let datas: GitColumnAPIResponse[] = [];
    while (true) {
      const { columns, cursor } = await this.getColumns(token, repo_name, repo_owner, proj_number, _cursor);
      if (columns.length == 0) {
        break;
      }
      datas = datas.concat(columns);
      _cursor = cursor['cursor'];
    }
    return datas;
  }

  private getColumns(token: string, repo_name: string, repo_owner: string, proj_number: number, cursor?: string, first?: number): Promise<{ columns: GitColumnAPIResponse[]; cursor: string }> {
    const query = `{
      repository(name: "${repo_name}", owner: "${repo_owner}") {
        project(number: ${proj_number}) {
          columns({{cursor}} first: ${first | 100}) {
            nodes {
              databaseId
              name
              url
            }
            edges {
              cursor
            }
          }
        }
      }
    }`.replace('{{cursor}}', cursor ? `after: "${cursor}",` : "");
    return this.rawQuery<any>(query, this.createHttpOptions(token)
    ).then(data => {
      const columns = data.repository.project.columns.nodes;
      const cursors = data.repository.project.columns.edges;
      if(cursors === null || cursors === undefined || cursors.length == 0){
        return Promise.resolve({ columns: [], cursor: cursor });
      }else{
        return {
          columns: columns.map(column => ({
            external_id: column.databaseId,
            name: column.name,
            url: column.url
          })),
          cursor: cursors[cursors.length - 1]
        }
      }
    });
  }

  async getAllComments(token: string, repo_name: string, repo_owner: string, issue_number: number): Promise<GitCommentAPIResponse[]> {
    let _cursor = '';
    let datas: GitCommentAPIResponse[] = [];
    while (true) {
      const { comments, cursor } = await this.getComments(token, repo_name, repo_owner, issue_number, _cursor);
      if (comments.length == 0) {
        break;
      }
      datas = datas.concat(comments);
      _cursor = cursor['cursor'];
    }
    return datas;
  }

  private getComments(token: string, repo_name: string, repo_owner: string, issue_number: number, cursor?: string, first?: number): Promise<{ comments: GitCommentAPIResponse[]; cursor: string }> {
    const query = `{
      repository(name: "${repo_name}", owner: "${repo_owner}") {
        issue(number: ${issue_number}) {
          comments({{cursor}} first: ${first | 100}) {
            nodes {
              databaseId
              author {
                login
              }
              bodyText
              url
            }
            edges {
              cursor
            }
          }
        }
      }
    }`.replace('{{cursor}}', cursor ? `after: "${cursor}",` : '');
    return this.rawQuery<any>(query, this.createHttpOptions(token))
      .then(data => {
        const comments = data.repository.issue.comments.nodes;
        const cursors = data.repository.issue.comments.edges;
        if(cursors === null || cursors === undefined || cursors.length == 0){
          return Promise.resolve({ comments: [], cursor: cursor });
        }else{
          return {
            comments: comments.map(comment => ({
              external_id: comment.databaseId,
              author: comment.author.login,
              content: comment.bodyText,
              url: comment.url
            })),
            cursor: cursors[cursors.length - 1]
          }
        }
      }
      );
  }

  async getAllMilestones(token: string, repo_name: string, repo_owner: string): Promise<GitMilestoneAPIResponse[]> {
    let _cursor = '';
    let datas: GitMilestoneAPIResponse[] = [];
    while (true) {
      const { miles, cursor } = await this.getMilestones(token, repo_name, repo_owner, _cursor);
      if (miles.length == 0) {
        break;
      }
      datas = datas.concat(miles);
      _cursor = cursor['cursor'];
    }
    return datas;
  }

  private getMilestones(token: string, repo_name: string, repo_owner: string, cursor?: string, first?: number): Promise<{ miles: GitMilestoneAPIResponse[]; cursor: string }> {
    const query = `{
      repository(name: "${repo_name}", owner: "${repo_owner}") {
        milestones({{cursor}} first: ${first | 100}) {
          nodes {
            title
            url
            state
            number
            creator {
              login
            }
            dueOn
            closedAt
            description
          }
          edges {
            cursor
          }
        }
      }
    }`.replace('{{cursor}}', cursor ? `after: "${cursor}", ` : '');
    return this.rawQuery<any>(query, this.createHttpOptions(token))
      .then(data => {
        const milestones = data.repository.milestones.nodes;
        const cursors = data.repository.milestones.edges;
        if(cursors === null || cursors === undefined || cursors.length == 0){
          return Promise.resolve({ miles: [], cursor: cursor });
        }else{
          return {
            miles: milestones.map(milestone => ({
              name: milestone.title,
              creator: milestone.creator.login,
              state: milestone.state,
              number: milestone.number,
              due_on: milestone.dueOn ? milestone.dueOn : null,
              closed_at: milestone.closedAt ? milestone.closedAt : null,
              description: milestone.description,
              url: milestone.url
            })),
            cursor: cursors[cursors.length - 1]
          }
        }
      }
      );
  }

  async getAllAssignees(token: string, repo_name: string, repo_owner: string, issue_number: number): Promise<GithubProfileAPIResponse[]> {
    let _cursor = '';
    let datas: GithubProfileAPIResponse[] = [];
    while (true) {
      const { assignees, cursor } = await this.getAssignees(token, repo_name, repo_owner, issue_number, _cursor);
      if (assignees.length == 0) {
        break;
      }
      datas = datas.concat(assignees);
      _cursor = cursor['cursor'];
    }
    return datas;
  }

  private getAssignees(token: string, repo_name: string, repo_owner: string, issue_number: number, cursor?: string, first?: number): Promise<{ assignees: GithubProfileAPIResponse[]; cursor: string }> {
    const query = `{
      repository(name: "${repo_name}", owner: "${repo_owner}") {
        issue(number: ${issue_number}) {
          assignees({{cursor}} first: ${first | 100}) {
            nodes {
              login
              name
              email
              avatarUrl
            }
            edges {
              cursor
            }
          }
        }
      }
    }`.replace('{{cursor}}', cursor ? `after: "${cursor}"` : '');
    return this.rawQuery<any>(query, this.createHttpOptions(token))
      .then(data => {
        const assignees = data.repository.issue.assignees.nodes;
        const cursors = data.repository.issue.assignees.edges;
        if(cursors === null || cursors === undefined || cursors.length == 0){
          return Promise.resolve({ assignees: [], cursor: cursor });
        }else{
          return {
            assignees: assignees.map(assignee => ({
              username: assignee.login,
              name: assignee.name,
              email: assignee.email,
              avatar_url: assignee.avatarUrl
            })),
            cursor: cursors[cursors.length - 1]
          }
        }
      });
  }

  async getAllLabels(token: string, repo_name: string, repo_owner: string): Promise<GitLabelAPIResponse[]> {
    let _cursor = '';
    let datas: GitLabelAPIResponse[] = [];
    while (true) {
      const { labels, cursor } = await this.getLabels(token, repo_name, repo_owner, _cursor);
      if (labels.length == 0) {
        break;
      }
      datas = datas.concat(labels);
      _cursor = cursor['cursor'];
    }
    return datas;
  }

  private getLabels(token: string, repo_name: string, repo_owner: string, cursor?: string, first?: number): Promise<{ labels: GitLabelAPIResponse[]; cursor: string }> {
    const query = `{
      repository(name: "${repo_name}", owner: "${repo_owner}") {
        labels({{cursor}} first: ${first | 100}){
          nodes{
            name
            color
            description
            url
          }
          edges{
            cursor
          }
        }
      }
    }`.replace('{{cursor}}', cursor ? `after: "${cursor}",` : '');
    return this.rawQuery<any>(query, this.createHttpOptions(token))
      .then(data => {
        const labels = data.repository.labels.nodes;
        const cursors = data.repository.labels.edges;
        if(cursors === undefined || cursors === null || cursors.length == 0){
          return Promise.resolve({ labels: [], cursor: cursor });
        }else{
          return {
            labels: labels.map(label => ({
              name: label.name,
              color: label.color,
              description: label.description,
              url: label.url
            })),
            cursor: cursors[cursors.length - 1]
          }
        }
      });
  }

  async getAllIssueColumns(token: string, repo_name: string, repo_owner: string, issue_number: number): Promise<GitIssueColumnAPIResponse[]> {
    let _cursor = '';
    let datas: GitIssueColumnAPIResponse[] = [];
    while (true) {
      const { columns, cursor } = await this.getIssueColumns(token, repo_name, repo_owner, issue_number, _cursor);
      if (columns.length == 0) {
        break;
      }
      datas = datas.concat(columns);
      _cursor = cursor;
    }
    return datas;
  }

  private async getIssueColumns(token: string, repo_name: string, repo_owner: string, issue_number: number, cursor?: string, first?: number): Promise<{ columns: GitIssueColumnAPIResponse[]; cursor: string }> {
    const query = `{
      repository(name: "${repo_name}", owner: "${repo_owner}") {
        issue(number: ${issue_number}) {
          projectCards({{cursor}} first: ${first | 100}) {
            nodes {
              column {
                databaseId
                project {
                  databaseId
                }
              }
            }
            edges {
              cursor
            }
          }
        }
      }
    }`.replace('{{cursor}}', cursor ? `after: "${cursor}"` : '');
    const data = await this.rawQuery<any>(query, this.createHttpOptions(token));
    const columns = data.repository.issue.projectCards.nodes;
    const cursors = data.repository.issue.projectCards.edges;
    if(cursors === null || cursors === undefined || cursors.length == 0){
      return Promise.resolve({ columns: [], cursor: cursor });
    }else {
      return {
        columns: columns.map(col => ({
          col_external_id: col.column.databaseId,
          proj_external_id: col.column.project.databaseId
        })),
        cursor: cursors[cursors.length - 1]
      }
    }
  }

  async registerHook(username: string, token: string, repo_name: string): Promise<any> {
    const url = "https://api.github.com/repos/" + username + "/" + repo_name + "/hooks";
    try {
      return this.http.post<any>(url, hooksConfig, this.createHttpOptions(token))
        .pipe(
          catchError((err, c) => new Observable(subscriber => subscriber.error(err)))
        )
        .toPromise()
        .then(res => {
          console.log(res);
          return res;
        });
    } catch (error) {
      console.log(error);
    }
  }
}
