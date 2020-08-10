import { Injectable, HttpService } from '@nestjs/common';
import { Converter } from '../helper/converter';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { httpOptions, gitGraphqlApiUrl } from '../helper/http-helper';
import { MilestoneDTO } from '../dto/milestone.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GMilestone } from './milestone.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MilestoneService {

    constructor(
        private readonly http: HttpService,
        private readonly converter: Converter,
        @InjectRepository(GMilestone) private readonly milestoneRepository: Repository<GMilestone>
    ) { }

    getMilestones(username: string): Observable<AxiosResponse<any>> {
        const graph = `{
            user(login: "${username}"){
                repositories(last:100){
                    edges{
                        node{
                            databaseId
                            milestones(last: 100){
                                edges{
                                    node{
                                        number
                                        title
                                        dueOn
                                        createdAt
                                        closedAt
                                        creator{
                                            login
                                        }
                                        closed
                                        state
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }`;
        const query = { "query": this.converter.stringToGraphQl(graph) };
        return this.http.post<any>(gitGraphqlApiUrl, query, httpOptions);
    }

    getMilestoneNode(node: object): MilestoneDTO {
        const milestone = new MilestoneDTO();
        milestone.number = node["number"];
        milestone.title = node["title"];
        milestone.dueOn = node["dueOn"];
        milestone.createdAt = node["createdAt"];
        milestone.closedAt = node["closedAt"];
        milestone.creator = node["creator"].login;
        milestone.state = node["state"];
        return milestone;
    }

    fillData(username: string) {
        this.getMilestones(username).subscribe(
            val => {
                if (val) {
                    const repositories = val.data.data.user.repositories.edges;
                    if (repositories && repositories.length > 0) {
                        for (let repository of repositories) {
                            const milestones = repository.node.milestones.edges;
                            const repositoryId = repository.node.databaseId;
                            if (milestones && milestones.length > 0) {
                                for (let mile of milestones) {
                                    const milestone: MilestoneDTO = this.getMilestoneNode(mile.node);
                                    if (milestone) {
                                        milestone.repositoryId = repositoryId;
                                        console.log("milestone:", milestone);
                                        this.milestoneRepository.save(milestone).catch(console.error);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        )
    }
}