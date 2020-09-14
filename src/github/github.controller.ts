import { Controller, Post, Body, Get, Req, Query, Res, UseGuards, Render } from "@nestjs/common";
import { GithubLoginDto } from "./dtos/github.ctrl.dto";
import { GithubService } from "./github.service";
import { ConfigService } from "@nestjs/config";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller('api.github')
export class GithubController {
    constructor(
        private githubService: GithubService,
        private configService: ConfigService
    ) { }

    @Get('login')
    async login(@Res() res) {
        const client_id = this.configService.get<string>('CLIENT_ID');
        const scope = `read:user user:email repo read:org read:repo_hook read:discussion read:enterprise read:gpg_key`;
        res.redirect(`https://github.com/login/oauth/authorize?client_id=${client_id}&scope=${scope}`);
    }

    @Get('redirect')
    @Render('index')
    async getAuthorize(@Query('code') code: string) {
        const res: object = await this.githubService.getGithubAccessToken(code);
        const token = await this.githubService.login(res['access_token']);
        return { message: token['username'] + " " + token['access_token'] };
    }

    @UseGuards(JwtAuthGuard)
    @Get('repos')
    async getAllRepos(@Query('username') username: string) {
        return await this.githubService.getAllRepos(username);
    }

    @UseGuards(JwtAuthGuard)
    @Get('repos/sync')
    async getSyncRepos(@Query('username') username: string) {
        return await this.githubService.getSyncRepos(username);
    }

    @UseGuards(JwtAuthGuard)
    @Get('user')
    async getUser(@Query('username') username: string) {
        return await this.githubService.getUserResponse(null, username);
    }

    @UseGuards(JwtAuthGuard)
    @Post('hooks')
    async registerWebhook(@Body() req) {
        return this.githubService.registerHook(req);
    }

    @UseGuards(JwtAuthGuard)
    @Get('issues')
    async getSyncIssues(@Query('username') username: string) {
        return this.githubService.getSyncIssues(username);
    }

    @UseGuards(JwtAuthGuard)
    @Get('projects')
    async getSyncProjects(@Query('username') username: string) {
        return this.githubService.getSyncProjects(username);
    }

    @UseGuards(JwtAuthGuard)
    @Get('assignees')
    async getSyncAssignees(@Query('username') username: string) {
        return this.githubService.getSyncAssignees(username);
    }

    @Post('hooks.listener')
    listenGitWebHook(@Req() req) {
        console.log(req);
        if (req['body']) {
            return this.githubService.payloadsGitHookHandler(req['body']);
        }
        // lay datas tu api
        // Tien xu ly datas => normDatas
        // database.save(normDatas)


        // Xu ly Hook
        // nhan rawData
        // Tien xy ly datas => normData
        // database.save(normData).

        // dbUser <= db
        // dbRepo <= db
        // this.githubService.fetchIssue(dbUser.token, dbRepo.id, dbRepo.name, req.Issue.id);


    }
}