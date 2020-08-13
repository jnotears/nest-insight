import { Injectable, HttpService } from '@nestjs/common';
import { gitApiUrl, hooksConfig, httpOptions } from 'src/helper/http-helper';
import { GRepository } from 'src/g-repositories/repository.entity';
import { catchError } from 'rxjs/operators';

@Injectable()
export class WebhookService {

    constructor(
        private readonly http: HttpService
    ) { }

    create(username: string, repos: GRepository[]) {
        for (let repo of repos) {
            const url = gitApiUrl + "/repos/" + username + "/" + repo.name + "/hooks";
            try {
                console.log(hooksConfig);
                this.http.post<any>(url, hooksConfig, httpOptions).pipe(catchError((err, c) => null)).subscribe(
                    () => {}
                );
            } catch (error) {
                console.log(error);
                continue;
            }
        }
    }
}