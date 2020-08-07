import { Injectable, HttpService } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class AppService {
  constructor(private readonly http: HttpService) { }
  getHello(): string {
    return 'Hello World!';
  }

  getUser(): Observable<AxiosResponse<any>> {
    const graph = `{
      viewer{
        login
      }
    }`;
    console.log(graph.replace(/(\r\n|\n|\r|\s)/gm,''));
    const query = {
      "query": "{viewer{login}}"
    };
    const url = 'https://api.github.com/graphql';
    // const options = {
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": "Bearer c08859daee72fc87a34391a718b69d7435bb661d"
    //   },
    // };
    // const res = this.http.post<any>(url, query, options).subscribe(x => console.log(x.data.data.viewer.login));
    // return this.http.post<any>(url, query, options);
    return;
  }

  getUserLogin(x: any){

  }
}
