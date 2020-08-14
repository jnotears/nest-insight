import { Controller, Post, Body, Get, Param } from "@nestjs/common";
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
}