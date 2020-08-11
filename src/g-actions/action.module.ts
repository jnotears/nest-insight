import {Module, HttpModule} from '@nestjs/common';
import { ActionService } from './action.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GAction } from './action.entity';
import { ActionController } from './action.controller';

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([GAction])
    ],
    controllers: [ActionController],
    providers: [
        ActionService,
    ],
})
export class ActionModule{}