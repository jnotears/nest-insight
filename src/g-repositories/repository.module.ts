import { Module, HttpService, HttpModule } from '@nestjs/common';
import { RepositoryService } from './repository.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GRepository } from '../g-repositories/repository.entity';
import { RepositoryController } from './repository.controller';
import { Converter } from 'src/helper/converter';
import { WebhookService } from 'src/g-webhook/webhook.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([GRepository]),
        HttpModule
    ],
    controllers: [RepositoryController],
    providers: [
        RepositoryService,
        Converter,
        WebhookService
    ]
})
export class RepositoryModule { }