import { Controller, Post, Body, Get, Param, UseGuards, Req } from "@nestjs/common";
import { GithubLoginDto } from "./dtos/github.ctrl.dto";
import { GithubService } from "./github.service";

@Controller('api.github')
export class GithubController {
    constructor(private githubService: GithubService){}

    @Post('login')
    async login(@Body() loginData: GithubLoginDto) {
        console.log('loginData', loginData);
        return await this.githubService.login(loginData.access_token);
    }

    @Get('repos/:user_id')
    async getAllRepos(@Param('user_id') user_id: string) {
        return await this.githubService.getAllRepos(user_id);
    }

    @Post('repo/:user_id')
    async fillDataOfRepo(@Param('user_id') user_id: string, @Body() repo){
        return await this.githubService.fillDataOfRepo(repo, user_id);
    }

    @Post()
    listenRequest(@Req() req){
        this.githubService.listenWebhooks(req.headers['x-github-event'], req.body);
    }
}