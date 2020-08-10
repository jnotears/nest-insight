import { Module, HttpModule } from '@nestjs/common';
import { ProjectService } from './project.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GProject } from './project.entity';
import { Converter } from 'src/helper/converter';
import { ProjectController } from './project.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([GProject]),
        HttpModule
    ],
    controllers:[ProjectController],
    providers: [
        ProjectService,
        Converter
    ]
})
export class ProjectModule { }