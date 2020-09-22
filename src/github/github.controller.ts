import { Controller, Post, Body, Get, Req, Query, Res, UseGuards, Render, Param, Delete } from "@nestjs/common";
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
        const scope = `read:user user:email repo admin:org read:repo_hook read:discussion read:enterprise read:gpg_key`;
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
    async getRepos(@Query('username') username: string) {
        return await this.githubService.getRepos(username);
    }

    @UseGuards(JwtAuthGuard)
    @Get('repos/sync')
    async getSyncRepos(@Query('username') username: string) {
        return await this.githubService.getSyncRepos(username);
    }

    @UseGuards(JwtAuthGuard)
    @Get('user')
    async getUser(@Query('username') username: string) {
        return await this.githubService.getUser(null, username);
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

    @Post('hooks.listener/:id')
    listenGitWebHook(@Req() req, @Param() user_id: string) {
        if (req['body']) {
            return this.githubService.payloadsGitHookHandler(req['body'], user_id);
        }
    }

    @Post('airtable.config')
    createAirConfig(@Body() req: {user_id: string, api_key: string, base_id: string, table_name: string, connect_name: string, active: boolean}){
        return this.githubService.createOrUpdateAirTableConfig(req);
    }

    @Get('airtable.config')
    getAirConfigs(@Query('username') username: string){
        return this.githubService.getAirConfigs(username);
    }

    @Delete('airtable.config')
    async removeAirConfig(@Body() req: {user_id: string, api_key: string, base_id: string, table_name: string}){
        return await this.githubService.deteleAirConfig(req);
    }

}