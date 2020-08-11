import { Injectable, HttpService } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { gitGraphqlApiUrl, httpOptions } from '../helper/http-helper';
import { Converter } from '../helper/converter';
import { UserDTO } from 'src/dto/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GUser } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {

    constructor(
        private readonly http: HttpService,
        private readonly converter: Converter,
        @InjectRepository(GUser) private readonly userRepository: Repository<GUser>
    ) { }

    getUsername(): Observable<AxiosResponse<any>> {
        const graph = `{
            viewer{
                login
            }
        }`;
        const query = { "query": this.converter.stringToGraphQl(graph) };
        return this.http.post<any>(gitGraphqlApiUrl, query, httpOptions);
    }

    getUser(username: string): Observable<AxiosResponse<any>> {
        const graph = `{
            user(login: "${username}"){
                databaseId
                name
            }
        }`;
        const query = { "query": this.converter.stringToGraphQl(graph) };
        return this.http.post<any>(gitGraphqlApiUrl, query, httpOptions);
    }

    fillData(username: string) {
        this.getUser(username).subscribe(
            val => {
                const user = new UserDTO();
                user.id = val.data.data.user.databaseId;
                user.name = val.data.data.user.name;
                user.username = username;
                if (user) {
                    this.userRepository.save(user);
                }
            }
        )
    }
}