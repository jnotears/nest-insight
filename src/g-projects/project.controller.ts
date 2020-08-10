import {Controller, Get} from '@nestjs/common';
import { Converter } from 'src/helper/converter';
import { ProjectService } from './project.service';

@Controller('project')
export class ProjectController{

    constructor(
        private readonly projectService: ProjectService
    ){}

    @Get()
    fillData(){
        this.projectService.fillData("jnotears");
    }
}