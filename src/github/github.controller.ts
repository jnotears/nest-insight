import { Controller, Post, Body, Get, Req, Query, Res, UseGuards, Render, Param, Delete, Headers } from "@nestjs/common";
import { GithubLoginDto } from "./dtos/github.ctrl.dto";
import { GithubService } from "./github.service";
import { ConfigService } from "@nestjs/config";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AirTableConfig } from "./entities/airtable.config.entity";
import { config } from "rxjs";

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
    async getRepos(@Headers() headers) {
        return await this.githubService.getRepos(headers);
    }

    @UseGuards(JwtAuthGuard)
    @Get('repos/sync')
    async getSyncRepos(@Headers() headers) {
        return await this.githubService.getSyncRepos(headers);
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
    @Delete('hooks/:repo_id')
    async deleteWebhook(@Param('repo_id') repo_id: number){
        return await this.githubService.deleteHook(repo_id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('issues')
    async getSyncIssues(@Headers() headers) {
        return this.githubService.getSyncIssues(headers);
    }

    @UseGuards(JwtAuthGuard)
    @Get('projects')
    async getSyncProjects(@Headers() headers) {
        return this.githubService.getSyncProjects(headers);
    }

    @UseGuards(JwtAuthGuard)
    @Get('assignees')
    async getSyncAssignees(@Headers() headers) {
        return this.githubService.getSyncAssignees(headers);
    }

    @Post('hooks.listener/:id')
    listenGitWebHook(@Req() req, @Param('id') user_id: string) {
        if (req['body']) {
            return this.githubService.payloadsGitHookHandler(req['body'], user_id);
        }
    }

    @Post('airtable.config')
    createAirConfig(@Body() config: AirTableConfig){
        return this.githubService.createOrUpdateAirTableConfig(config);
    }

    @Get('airtable.config')
    getAirConfigs(@Headers() headers){
        return this.githubService.getAirConfigs(headers);
    }

    @Delete('airtable.config')
    async removeAirConfig(@Body() config){
        return await this.githubService.deteleAirConfig(config);
    }

    @Post('airtable.config/project')
    async createtProjectAirtable(@Body() projAir){
        return await this.githubService.createOrUpdateProjectAirTable(projAir);
    }

    @Get('airtable.config/projects')
    async getProjectAirs(@Query('config_id') config_id: number){
        return await this.githubService.getAllProjectInTable(config_id);
    }

    @Delete('airtable.config/project')
    async removeProjectAirTable(@Body() projAir){
        return await this.githubService.deleteProjectAirTable(projAir);
    }

    @Post('airtable.config/table')
    async createTableAirTable(@Body() table){
        return await this.githubService.createOrUpdateTableAirTable(table);
    }

    @Get('airtable.config/table')
    async getTableAirTableByConfigId(@Query('config_id') config_id: number){
        return await this.githubService.getTableAirTableByConfigId(config_id);
    }

    @Delete('airtable.config/table/:id')
    async removeTableAirTable(@Param('id') id){
        return await this.githubService.deleteTableAirTable(id);
    }
}