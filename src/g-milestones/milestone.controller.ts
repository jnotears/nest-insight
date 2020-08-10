import { Controller, Get } from '@nestjs/common';
import { MilestoneService } from './milestone.sevice';

@Controller('milestone')
export class MilestoneController {

    constructor(
        private readonly mile: MilestoneService
    ) { }

    @Get()
    getMilestone() {
        this.mile.getMilestones("jnotears", "angular-shopping-app").subscribe(val => console.log(val));
    }
}