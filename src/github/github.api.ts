import { Injectable, HttpService } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { GithubProfileAPIResponse, GitRepositoryAPIResponse, GitIssueAPIResponse, GitLabelAPIResponse, GitProjectAPIResponse, GitMilestoneAPIResponse, GitColumnAPIResponse } from './dtos/github.api.dto';

@Injectable()
export class GithubApi {
  constructor(private http: HttpService) { }

  createHeaders(token: string): any {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  createHttpOptions(token: string): AxiosRequestConfig {
    return {
      headers: this.createHeaders(token),
    };
  }

  public escapeQuery(str: string): string {
    const res: string = str.replace(/ /gm, '').replace(/(\r\n|\n|\r)/gm, ' ');
    return res ? res : str;
  }

  getUsername(token: string): Promise<GithubProfileAPIResponse> {
    const graph = `{
            viewer{
                login,
                name,
                email
            }
        }`;
    return this.rawQuery<any>(graph, this.createHttpOptions(token))
      .then(data => ({
        username: data.viewer.login,
        name: data.viewer.name,
        email: data.viewer.email
      }));
  }

  getRepositories(username: string, token: string): Promise<GitRepositoryAPIResponse[]> {
    const query = `{user(login: "${username}") {
        organizations(last:100){
        edges{
            node{
            repositories{
                edges{
                node{
                    databaseId
                    name
                }
                }
            }
            }
        }
        }
        repositories(last:100){
        edges{
            node{
            databaseId
            name
            owner{
                login
            }
            }
        }
        }
    }
    }`
    return this.rawQuery<any>(query, this.createHttpOptions(token)).then(data => {
      const repos = data.user.repositories.edges;
      return repos.map(repo => ({
        repo_id: repo.node.databaseId,
        name: repo.node.name,
        owner: repo.node.owner.login,
      }))
    });
  }

  getIssues(repo_name, repo_owner, token): Promise<GitIssueAPIResponse[]> {
    const query = `{
        repository(name: "${repo_name}", owner: "${repo_owner}"){
            databaseId
            issues(last: 100){
                edges{
                    node{
                        databaseId
                        number
                        title
                        body
                        url
                        state
                        author{
                          login
                        }
                        milestone{
                          id
                        }
                    }
                }
            }
        }
    }`;
    return this.rawQuery<any>(query, this.createHttpOptions(token)).then(val => {
      const issues = val.repository.issues.edges;
      
      return issues.map(issue => ({
        external_id: issue.node.databaseId,
        number: issue.node.number,
        name: issue.node.title,
        state: issue.node.state,
        author: issue.node.author.login,
        content: issue.node.body,
        url: issue.node.url,
        mile_node_id: issue.node.milestone ? issue.node.milestone.id: null,
        repo_id: val.repository.databaseId,
      }));
    });
  }

  getLabels(repo_name, repo_owner, token): Promise<GitLabelAPIResponse[]>{
    const query = `{
      repository(name: "${repo_name}", owner: "${repo_owner}"){
        databaseId
            labels(last: 100){
                edges{
                    node{
                        id
                        url
                        name
                        color
                        description
                    }
                }
            }
        }
    }`;
    return this.rawQuery<any>(query, this.createHttpOptions(token)).then(val => {
      const labels = val.repository.labels.edges;
      return labels.map(data => ({
        node_id: data.node.id,
        url: data.node.url,
        name: data.node.name,
        color: data.node.color,
        description: data.node.description,
        repo_id: val.repository.databaseId,
      }));
    })
  }

  getProjects(repo_name, repo_owner, token): Promise<GitProjectAPIResponse[]>{
    const query = `{
      repository(name: "${repo_name}", owner: "${repo_owner}"){
        databaseId
        projects(last: 100){
            edges{
                node{
                    databaseId
                    number
                    name
                    body
                    state
                  }
              }
          }
      }
    }`;
    return this.rawQuery<any>(query, this.createHttpOptions(token)).then(data => {
      const projects = data.repository.projects.edges;
      return projects.map(project => ({
        external_id: project.node.databaseId,
        number: project.node.number,
        name: project.node.name,
        content: project.node.body,
        state: project.node.state,
        repo_id: data.repository.databaseId,
      }))
    });
  }

  //: Promise<GitMilestoneAPIResponse[]>
  getMilestone(repo_name, repo_owner, token){
    const query = `{
      repository(name: "${repo_name}", owner: "${repo_owner}"){
        databaseId
        milestones(last: 100){
            edges{
                node{
                    id
                    description
                    url
                    number
                    title
                    dueOn
                    closedAt
                    state
                    creator{
                      login
                    }
                  }
              }
          }
      }
    }`;
    return this.rawQuery<any>(query, this.createHttpOptions(token)).then(data => {
      const milestones = data.repository.milestones.edges;
      return milestones.map(milestone => ({
        description: milestone.node.description,
        node_id: milestone.node.id,
        url: milestone.node.url,
        number: milestone.node.number,
        name: milestone.node.title,
        due_on: milestone.node.dueOn,
        closed_at: milestone.node.closedAt,
        state: milestone.node.state,
        creator: milestone.node.creator.login,
        repo_id: data.repository.databaseId,
      }))
    });
  }

  getColumns(repo_name, repo_owner, token){
    const query = `{
      repository(name: "${repo_name}", owner: "${repo_owner}"){
        projects(last:100){
          edges{
            node{
              databaseId
              columns(last: 100){
                edges{
                  node{
                    name
                    databaseId
                    url
                  }
                }
              }
            }
          }
        }
    }
    }`;
    return this.rawQuery<any>(query, this.createHttpOptions(token)).then(data => {
      const projects = data.repository.projects.edges;
      return projects.map(project => {
        const proj_id = project.node.databaseId;
        const columns = project.node.columns.edges;
        return columns.map(column => ({
          name: column.node.name,
          external_id: column.node.databaseId,
          url: column.node.url,
          external_proj_id: proj_id,
        }))
      })
    });
  }

  getIssueLabels(repo_name, repo_owner, token){
    const query = `{
      repository(name: "${repo_name}", owner: "${repo_owner}"){
        databaseId
        issues(last:100){
          edges{
            node{
              databaseId
              labels(last:100){
                edges{
                  node{
                    url
                  }
                }
              }
            }
          }
        }
    }
    }`;
    return this.rawQuery<any>(query, this.createHttpOptions(token)).then(data => {
      const issues = data.repository.issues.edges;
      return issues.map(issLabel => {
        const issue_id = issLabel.node.databaseId;
        const labels = issLabel.node.labels.edges;
        return labels.map(label => ({
          issue_id: issue_id,
          label_url: label.node.url,
        }))
      })
    })
  }

  getIssueColumns(repo_name, repo_owner, token){
    const query = `{
      repository(name: "${repo_name}", owner: "${repo_owner}"){
        issues(last: 100){
          edges{
            node{
              databaseId
              projectCards(last: 100){
                edges{
                  node{
                    column{
                      databaseId
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`;
    return this.rawQuery<any>(query, this.createHttpOptions(token)).then(data => {
      const issues = data.repository.issues.edges;
      return issues.map(issue => {
        const external_issue_id = issue.node.databaseId;
        const projCards = issue.node.projectCards.edges;
        return projCards.map(isscol => ({
          external_issue_id: external_issue_id,
          external_col_id: isscol.node.column ? isscol.node.column.databaseId : null,
        }))
      })
    });
  }

  getIssueAssignees(repo_name, repo_owner, token){
    const query = `{
      repository(name: "${repo_name}", owner: "${repo_owner}"){
        issues(last: 100){
          edges{
              node{
                  databaseId
                  assignees(last: 100){
                      edges{
                          node{
                             login
                          }
                      }
                  }
              }
          }
      }
      }
    }`;
    return this.rawQuery<any>(query, this.createHttpOptions(token)).then(data => {
      const issues = data.repository.issues.edges;
      return issues.map(issue => {
        const issue_id = issue.node.databaseId;
        const assignees = issue.node.assignees.edges;
        return assignees.map(assignee => ({
          external_issue_id: issue_id,
          username: assignee.node.login,
        }))
      })
    });
  }

  getComments(repo_name, repo_owner, token){
      const query = `{
        repository(name: "${repo_name}", owner: "${repo_owner}"){
            issues(last: 100){
                edges{
                    node{
                        databaseId
                      comments(last: 100){
                        edges{
                          node{
                            databaseId
                            body
                            author{
                              login
                            }
                          }
                        }
                      }
                    }
                }
            }
        }
      }`;
      return this.rawQuery<any>(query, this.createHttpOptions(token)).then(data => {
          const issues = data.repository.issues.edges;
          return issues.map(issue => {
              const issue_id = issue.node.databaseId;
              const comments = issue.node.comments.edges;
              return comments.map(comment => ({
                  external_id: comment.node.databaseId,
                  content: comment.node.body,
                  author: comment.node.author.login,
                  external_issue_id: issue_id
              }))
          })
      });
  }

  rawQuery<T>(query: string, config?: AxiosRequestConfig): Promise<T> {
    //console.log('QUERY', this.escapeQuery(query));
    return this.http
      .post<any>(
        'https://api.github.com/graphql',
        { query: this.escapeQuery(query) },
        config,
      )
      .toPromise()
      .then(res => res.data.data);
  }
}
