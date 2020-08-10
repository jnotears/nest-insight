import { Controller, Get } from '@nestjs/common';
import { ColumnService } from './column.service';

@Controller('column')
export class ColumnController {

    constructor(
        private readonly col: ColumnService
    ) { }

    @Get()
    getColumns() {
        this.col.fillData("jnotears", "angular-shopping-app");
        //this.col.getColumns("jnotears", "angular-shopping-app").subscribe(val => console.log(JSON.stringify(val.data, null, 2)));
    }
}