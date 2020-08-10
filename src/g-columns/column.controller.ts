import { Controller, Get } from '@nestjs/common';
import { ColumnService } from './column.service';

@Controller('column')
export class ColumnController {

    constructor(
        private readonly col: ColumnService
    ) { }

    ///for testing
    @Get()
    getColumns() {
        this.col.fillData("jnotears", "angular-shopping-app");
    }
}