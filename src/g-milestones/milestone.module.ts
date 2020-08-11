import {Module, HttpModule} from '@nestjs/common';
import { MilestoneService } from './milestone.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GMilestone } from './milestone.entity';
import { MilestoneController } from './milestone.controller';
import { Converter } from 'src/helper/converter';

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([GMilestone])
    ],
    controllers: [MilestoneController],
    providers: [
        MilestoneService,
        Converter
    ]
})
export class MilestoneModule{}