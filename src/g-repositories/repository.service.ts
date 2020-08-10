import { Injectable, HttpService } from '@nestjs/common';
import { Converter } from 'src/helper/converter';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { gitGraphqlApiUrl, httpOptions } from 'src/helper/http-helper';
import { RepositoryDTO } from 'src/dto/repository.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GRepository } from './repository.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RepositoryService {

    constructor(
        private readonly converter: Converter,
        private readonly http: HttpService,
        @InjectRepository(GRepository) private readonly repo: Repository<GRepository>
    ) { }

    getRepositories(username: string): Observable<AxiosResponse<any>> {
        const graph = `{
            user(login: "${username}"){
                repositories(last: 100){
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
        }`;
        const query = { "query": this.converter.stringToGraphQl(graph) };
        return this.http.post<any>(gitGraphqlApiUrl, query, httpOptions);
    }

    getRepositoryNode(node: object): RepositoryDTO {
        const repository = new RepositoryDTO;
        repository.id = node["databaseId"];
        repository.name = node["name"];
        repository.owner = node["owner"].login;
        return
    }

    fillData(username: string) {
        this.getRepositories(username).subscribe(
            val => {
                const repositories = val.data.data.user.repositories.edges;
                if (repositories) {
                    for (let repo of repositories) {
                        const repository: RepositoryDTO = this.getRepositoryNode(repositories.node);
                        if (repository) {
                            this.repo.save(repository);
                        }
                    }
                }
            }
        )
    }
}