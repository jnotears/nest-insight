import { Controller, Get } from '@nestjs/common';
import { ColumnService } from './column.service';

@Controller('column')
export class ColumnController {

    constructor(
        private readonly col: ColumnService
    ) { }

    @Get()
    getColumns() {
        this.col.fillData("jnotears");
    }
}