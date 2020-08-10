import { Module, HttpModule } from '@nestjs/common';
import { ColumnService } from './column.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GColumn } from './column.entity';
import { Converter } from 'src/helper/converter';
import { ColumnController } from './column.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([GColumn]),
        HttpModule
    ],
    controllers: [ColumnController],
    providers: [
        ColumnService,
        Converter
    ]
})
export class ColumnModule { }