import { Module, HttpModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './g-users/user.module';
import { IssueModule } from './g-issues/issue.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnModule } from './g-columns/column.module';
import { entities } from './helper/entities';
import { MilestoneModule } from './g-milestones/milestone.module';
import { RepositoryModule } from './g-repositories/repository.module';
import { ProjectModule } from './g-projects/project.module';
import { ActionModule } from './g-actions/action.module';
import { HOST_NAME, DATABASE_NAME } from './helper/config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GithubModule } from './github/github.module';

@Module({
  imports: [
    HttpModule,
    // UserModule,
    // IssueModule,
    // ColumnModule,
    // MilestoneModule,
    // RepositoryModule,
    // ProjectModule,
    // ActionModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): any => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [].concat(GithubModule.entities()),
        synchronize: true,
      }),
      inject: [ConfigService],
    }),

    GithubModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
