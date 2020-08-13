import { LabelService } from './label.service';
import {Controller, Get} from '@nestjs/common';

@Controller('label')
export class LabelController{

    constructor(private label: LabelService){}

    @Get()
    getLabels(){
        this.label.insertLabels("thoaduong");
    }
}