import { Module } from '@nestjs/common';
import { PayloadController } from './payload.controller';
import { PayloadService } from './payload.service';

@Module({
    imports: [],
    controllers: [PayloadController],
    providers: [PayloadService]
})
export class PayloadModule { }