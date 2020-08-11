import { Controller, Get } from '@nestjs/common';
import { RepositoryService } from './repository.service';

@Controller('repository')
export class RepositoryController {

    constructor(
        private readonly repoService: RepositoryService
    ) { }

    @Get()
    fillData() {
        this.repoService.fillData("jnotears");
    }
}