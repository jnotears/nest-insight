import { Controller, Get } from '@nestjs/common';
import { MilestoneService } from './milestone.service';

@Controller('milestone')
export class MilestoneController {

    constructor(
        private readonly mile: MilestoneService
    ) { }

    @Get()
    getMilestone() {
        this.mile.fillData("jnotears");
    }
}