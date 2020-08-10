import { Module } from '@nestjs/common';
import { RepositoryService } from './repository.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from '../g-repositories/repository.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Repository])
    ],
    providers: [RepositoryService]
})
export class RepositoryModule { }