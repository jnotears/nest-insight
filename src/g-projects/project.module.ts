import {Module} from '@nestjs/common';
import { ProjectService } from './project.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Project])
    ],
    providers:[ProjectService]
})
export class ProjectModule{}