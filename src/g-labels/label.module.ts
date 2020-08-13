import { LabelService } from './label.service';
import { LabelController } from './label.controller';
import { GLabel } from './label.entity';
import { Module, HttpModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([GLabel])
    ],
    controllers:[LabelController],
    providers: [LabelService]
})
export class LabelModule { }