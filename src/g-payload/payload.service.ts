import { Injectable } from '@nestjs/common';

@Injectable()
export class PayloadService {

    constructor(){}

    getAction(body: any){
        console.log('test',body);
    }
}