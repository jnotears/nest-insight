import { Injectable, HttpService } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { GithubProfileAPIResponse, GitRepositoryAPIResponse } from './dtos/github.api.dto';

@Injectable()
export class GithubApi {
  constructor(private http: HttpService) {}

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

  getRepositories(username:string, token: string): Promise<GitRepositoryAPIResponse[]> {
    console.log(
      'query',
      `user(login: "${username}") {
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
        }
      }
    }
  }`,
    );
    return this.rawQuery<any>(
      `{user(login: "${username}") {
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
        }
      }
    }
  }
}`,
      this.createHttpOptions(token),
    ).then(data => {
      const repos = data.user.repositories.edges;
      return repos.map(repo => ({
        repo_id: repo.node.databaseId,
        name: repo.node.name
      }))
    });
  }

  rawQuery<T>(query: string, config?: AxiosRequestConfig): Promise<T> {
      console.log('QUERY', this.escapeQuery(query));
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
