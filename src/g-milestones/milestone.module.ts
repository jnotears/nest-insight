import {Module, HttpModule} from '@nestjs/common';
import { MilestoneService } from './milestone.sevice';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Milestone } from './milestone.entity';
import { MilestoneController } from './milestone.controller';
import { Converter } from 'src/helper/converter';

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([Milestone])
    ],
    controllers: [MilestoneController],
    providers: [
        MilestoneService,
        Converter
    ]
})
export class MilestoneModule{}