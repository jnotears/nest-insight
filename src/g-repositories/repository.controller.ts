import { Controller, Get } from '@nestjs/common';
import { RepositoryService } from './repository.service';
import { WebhookService } from 'src/g-webhook/webhook.service';

@Controller('repository')
export class RepositoryController {

    constructor(
        private readonly repoService: RepositoryService,
        private readonly hookService: WebhookService
    ) { }

    @Get()
    fillData() {
        //this.repoService.fillData("jnotears");

        this.repoService.getDBRepositories().subscribe(
            val => {
                this.hookService.create("jnotears",val);
            }
        );
    }
}