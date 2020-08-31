import { from } from 'rxjs';
import { CommentEntity } from './entities/comment.entity';
import { IssueAssigneeEntity } from './entities/issueassignee.entity';
import { IssueColumnEntity } from './entities/issuecolumn.entity';
import { IssueLabelEntity } from './entities/issuelabel.entity';
import { ColumnEntity } from './entities/column.entity';
import { MilestoneEntity } from './entities/milestone.entity';
import { ProjectEntity } from './entities/project.entity';
import { LabelEntity } from './entities/label.entity';
import { IssueEntity } from './entities/issue.entity';
import { Injectable, HttpService } from "@nestjs/common";
import { GithubApi } from "./github.api";
import { User } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RepositoryEntity } from "./entities/repository.entity";
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GithubService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(RepositoryEntity) private repoRepo: Repository<RepositoryEntity>,
        @InjectRepository(IssueEntity) private issueRepo: Repository<IssueEntity>,
        @InjectRepository(LabelEntity) private labelRepo: Repository<LabelEntity>,
        @InjectRepository(ProjectEntity) private projRepo: Repository<ProjectEntity>,
        @InjectRepository(MilestoneEntity) private mileRepo: Repository<MilestoneEntity>,
        @InjectRepository(ColumnEntity) private colRepo: Repository<ColumnEntity>,
        @InjectRepository(IssueLabelEntity) private isslabRepo: Repository<IssueLabelEntity>,
        @InjectRepository(IssueColumnEntity) private isscolRepo: Repository<IssueColumnEntity>,
        @InjectRepository(IssueAssigneeEntity) private issassRepo: Repository<IssueAssigneeEntity>,
        @InjectRepository(CommentEntity) private commentRepo: Repository<CommentEntity>,
        private http: HttpService,
        private jwtService: JwtService,
        private githubApi: GithubApi,
    ) { }

    async login(token: string): Promise<object> {
        const profile = await this.githubApi.getUsername(token);
        let user = await this.userRepo.findOne({
            where: {
                username: profile.username,
            },
        });
        if (!user) {
            user = User.from(profile);
        }

        user.external_token = token;

        await this.userRepo.save(user);

        this.fetchReposity(user);

        const payload = { sub: user.id, username: user.username };
        console.log('jwt token', this.jwtService.sign(payload));
        return {
            access_token: this.jwtService.sign(payload),
            username: user.username
        };
    }

    createParams(code: string) {
        return {
            client_id: "3c59aac014defea85b10",
            client_secret: "d4dd7d63fa7653d65c02fb5371ffa6a2aad31ecf",
            code: code
        }
    }

    getGithubAccessToken(code: string): Promise<object> {
        return this.http.post<object>(
            'https://github.com/login/oauth/access_token',
            this.createParams(code),
            {
                headers: {
                    "accept": "application/json",
                },
            }
        ).toPromise()
            .then(val => val.data);
    }

    async fetchReposity(user: User) {
        const repos = await this.githubApi.getRepositories(
            user.username,
            user.external_token,
        );
        const repoEntities = repos.map(repo => ({
            ...RepositoryEntity.from(repo),
            user_id: user.id,
        }));

        repoEntities.map(repo => {
            this.repoRepo.findOne({
                where: { external_id: repo.external_id }
            }).then(data => {
                if (!data) {
                    this.repoRepo.save(repo);
                }
            })
        })
    }

    getAllRepos(user_id: string): Promise<RepositoryEntity[]> {
        return this.repoRepo.find({
            where: {
                user_id
            }
        })
    }

    fetchIssues(repo_name, repo_owner, token) {
        const issues = this.githubApi.getIssues(repo_name, repo_owner, token);
        issues.then(data => data.map(issue => {
            this.mileRepo.findOne({
                where: { node_id: issue.mile_node_id }
            }).then(mile => {
                const issueDto = {
                    ...IssueEntity.from(issue),
                    mile_id: mile ? mile.id : null,
                }
                const issueExists = this.issueRepo.findOne({
                    where: { external_id: issueDto.external_id }
                })
                issueExists.then(data => {
                    if (!data) {
                        this.issueRepo.save(issueDto);
                    }
                });
                return issueDto;
            })
        }))
    }

    fetchLabels(repo_name, repo_owner, token) {
        const labels = this.githubApi.getLabels(repo_name, repo_owner, token);
        labels.then(data => data.map(label => {
            const labelExists = this.labelRepo.findOne({
                where: { node_id: label.node_id }
            })
            labelExists.then(data => {
                if (!data) {
                    this.labelRepo.save(label);
                }
            })
        }))
    }

    fetchProjects(repo_name, repo_owner, token) {
        const projects = this.githubApi.getProjects(repo_name, repo_owner, token);
        projects.then(data => data.map(project => {
            const projectExists = this.projRepo.findOne({
                where: { external_id: project.external_id }
            });
            projectExists.then(data => {
                if (!data) {
                    this.projRepo.save(project);
                }
            })
        }));
    }

    fetchMilestones(repo_name, repo_owner, token) {
        const milestones = this.githubApi.getMilestone(repo_name, repo_owner, token);
        milestones.then(data => data.map(milestone => {
            const milestoneExists = this.mileRepo.findOne({
                where: { node_id: milestone.node_id }
            })
            milestoneExists.then(data => {
                if (!data) {
                    this.mileRepo.save(milestone);
                }
            })
        }))
    }

    fetchColumns(repo_name, repo_owner, token) {
        const columns = this.githubApi.getColumns(repo_name, repo_owner, token);
        columns.then(data => data.map(colProjs => {
            colProjs.forEach(col => {
                const colExists = this.colRepo.findOne({
                    where: { external_id: col.external_id }
                })
                colExists.then(data => {
                    if (!data) {
                        this.colRepo.save(col);
                    }
                })
            });
        }));
    }

    fetchIssueLabels(repo_name, repo_owner, token) {
        const issueLabels = this.githubApi.getIssueLabels(repo_name, repo_owner, token);
        issueLabels.then(data => data.map(issLabel => {
            issLabel.forEach(isslab => {
                //Get label id by url response
                const label = this.labelRepo.findOne({
                    where: { url: isslab.label_url }
                })
                label.then(data => {
                    if (data) {
                        const isslabDto = {
                            external_issue_id: isslab.issue_id,
                            label_id: data.id,
                        }
                        const isslabExists = this.isslabRepo.findOne({
                            where: {
                                external_issue_id: isslabDto.external_issue_id,
                                label_id: isslabDto.label_id,
                            }
                        })
                        isslabExists.then(data => {
                            if (!data) {
                                this.isslabRepo.save(isslabDto);
                            }
                        })
                    }
                })
            });
        }))
    }

    fetchIssueColumns(repo_name, repo_owner, token) {
        const issueColumns = this.githubApi.getIssueColumns(repo_name, repo_owner, token);
        issueColumns.then(data => data.map(issCols => {
            issCols.forEach(issCol => {
                const issColExists = this.isscolRepo.findOne({
                    where: {
                        external_col_id: issCol.external_col_id,
                        external_issue_id: issCol.external_issue_id,
                    }
                })
                issColExists.then(data => {
                    if (!data) {
                        if (issCol.external_col_id != null) {
                            this.isscolRepo.save(issCol);
                        }
                    }
                })
            });
        }))
    }

    fetchIssueAssignees(repo_name, repo_owner, token) {
        const issueAssignees = this.githubApi.getIssueAssignees(repo_name, repo_owner, token);
        issueAssignees.then(data => data.map(issAss => {
            issAss.forEach(val => {
                const issAssExists = this.issassRepo.findOne({
                    where: {
                        external_issue_id: val.external_issue_id,
                        username: val.username,
                    }
                })
                issAssExists.then(data => {
                    if (!data) {
                        this.issassRepo.save(val)
                    }
                })
            })
        }))
    }

    fetchComments(repo_name, repo_owner, token) {
        const comments = this.githubApi.getComments(repo_name, repo_owner, token);
        comments.then(data => data.map(comments => {
            comments.forEach(comment => {
                const commentExists = this.commentRepo.findOne({
                    where: { external_id: comment.external_id }
                })
                commentExists.then(data => {
                    if (!data) {
                        this.commentRepo.save(comment);
                    }
                })
            });
        }))
    }

    fillDataOfRepo(repo, user_id) {
        const user = this.userRepo.findOne({
            where: {
                id: user_id,
            }
        })
        user.then(val => {
            this.fetchIssues(repo.name, repo.owner, val.external_token);

            this.fetchLabels(repo.name, repo.owner, val.external_token);

            this.fetchProjects(repo.name, repo.owner, val.external_token);

            this.fetchMilestones(repo.name, repo.owner, val.external_token);

            this.fetchColumns(repo.name, repo.owner, val.external_token);

            this.fetchIssueLabels(repo.name, repo.owner, val.external_token);

            this.fetchIssueColumns(repo.name, repo.owner, val.external_token);

            this.fetchIssueAssignees(repo.name, repo.owner, val.external_token);

            this.fetchComments(repo.name, repo.owner, val.external_token);
        })
        return Promise.all([
            this.issueRepo.find({ where: { repo_id: repo.external_id } }),
            this.labelRepo.find({ where: { repo_id: repo.external_id } }),
            this.projRepo.find({ where: { repo_id: repo.external_id } }),
            this.mileRepo.find({ where: { repo_id: repo.external_id } }),
            this.colRepo.query(`
                select column_entity.* 
                from column_entity, project_entity
                where column_entity.external_proj_id = project_entity.external_id
                and project_entity.repo_id = ${repo.external_id}
            `),
            this.isslabRepo.query(`
                select issue_label_entity.* 
                from issue_label_entity, issue_entity
                where issue_label_entity.external_issue_id = issue_entity.external_id
                and issue_entity.repo_id = ${repo.external_id}
            `),
            this.isscolRepo.query(`
                select issue_column_entity.* 
                from issue_column_entity, issue_entity
                where issue_column_entity.external_issue_id = issue_entity.external_id
                and issue_entity.repo_id = ${repo.external_id} 
            `),
            this.issassRepo.query(`
                select issue_assignee_entity.* 
                from issue_assignee_entity, issue_entity
                where issue_assignee_entity.external_issue_id = issue_entity.external_id
                and issue_entity.repo_id = ${repo.external_id}
            `),
            this.commentRepo.query(`
                select comment_entity.* 
                from comment_entity, issue_entity
                where comment_entity.external_issue_id = issue_entity.external_id
                and issue_entity.repo_id = ${repo.external_id}
            `),
        ]).then(val => {
            const data = [
                { 'issues': val[0] },
                { 'labels': val[1] },
                { 'projects': val[2] },
                { 'milestones': val[3] },
                { 'columns': val[4] },
                { 'issue_labels': val[5] },
                { 'issue_columns': val[6] },
                { 'issue_assignees': val[7] },
                { 'comments': val[8] },
            ]
            return data;
        })
    }

    getData(){ 
        return this.issueRepo.find();
    }

    listenIssue(data) {
        switch (data.action) {
            case 'opened': {
                const url = `${data.repository.html_url}/issues/${data.issue.number}`;
                this.mileRepo.findOne({ node_id: data.milestone ? data.milestone.node_id : null }).then(mile => {
                    let mile_id = null;
                    if (mile) {
                        mile_id = mile.id;
                    }
                    const issue = {
                        external_id: data.issue.id,
                        number: data.issue.number,
                        name: data.issue.title,
                        author: data.issue.user.login,
                        content: data.issue.body,
                        url: url,
                        state: data.issue.state,
                        repo_id: data.repository.id,
                        mile_id: mile_id,
                    }
                    if (issue) {
                        this.issueRepo.save(issue);
                    }
                })
                return {
                    state: 'create',
                    data: this.issueRepo.findOne({
                        where: { external_id: data.issue.id }
                    }),
                };
            }

            case 'edited': {
                const newIssue = {
                    name: data.issue.title,
                    content: data.issue.body,
                }
                if (newIssue) {
                    this.issueRepo.update({ external_id: data.issue.id }, newIssue);
                }
                return {
                    state: 'update',
                    data: this.issueRepo.findOne({
                        where: { external_id: data.issue.id }
                    })
                };
            }

            case 'deleted': {
                const issueDel = this.issueRepo.findOne({
                    where: { external_id: data.issue.id }
                })
                this.commentRepo.delete({ external_issue_id: data.issue.id });
                this.isslabRepo.delete({ external_issue_id: data.issue.id });
                this.isscolRepo.delete({ external_issue_id: data.issue.id });
                this.issassRepo.delete({ external_issue_id: data.issue.id });

                this.issueRepo.delete({ external_id: data.issue.id });
                return {
                    state: 'delete',
                    data: issueDel,
                };
            }

            case 'closed': {
                this.issueRepo.update(
                    { external_id: data.issue.id },
                    { state: data.issue.state }
                )
                break;
            }

            case 'reopened': {
                this.issueRepo.update(
                    { external_id: data.issue.id },
                    { state: data.issue.state }
                )
                break;
            }

            case 'milestoned': {
                this.mileRepo.findOne({
                    where: { node_id: data.milestone.node_id }
                }).then(mile => {
                    this.issueRepo.update(
                        {
                            external_id: data.issue.id,
                        },
                        {
                            mile_id: mile.id,
                        }
                    );
                })
                break;
            }

            case 'demilestoned': {
                this.mileRepo.findOne({
                    where: { node_id: data.milestone.node_id }
                }).then(mile => {
                    this.issueRepo.update(
                        {
                            external_id: data.issue.id,
                            mile_id: mile.id,
                        },
                        {
                            mile_id: null,
                        }
                    );
                })
                break;
            }
        }
    }

    listenProject(data) {
        switch (data.action) {
            case 'created': {
                const project = {
                    external_id: data.project.id,
                    number: data.project.number,
                    name: data.project.name,
                    content: data.project.body,
                    state: data.project.state,
                    repo_id: data.repository.id,
                }
                if (project) {
                    this.projRepo.save(project);
                }
                break;
            }

            case 'edited': {
                const newProject = {
                    name: data.project.name,
                    content: data.project.body,
                }
                if (newProject) {
                    this.projRepo.update({ external_id: data.project.id }, newProject);
                }
                break;
            }

            case 'deleted': {
                this.projRepo.delete({ external_id: data.project.id });
                break;
            }

            case 'closed': {
                this.projRepo.update(
                    { external_id: data.project.id },
                    { state: data.project.state }
                )
                break;
            }

            case 'reopened': {
                this.projRepo.update(
                    { external_id: data.project.id },
                    { state: data.project.state }
                )
                break;
            }
        }
    }

    listenLabel(data) {
        switch (data.action) {
            case 'created': {
                const name = data.label.name.split(' ').join('%20');
                const url = `${data.repository.html_url}/labels/${name}`;
                const label = {
                    node_id: data.label.node_id,
                    url: url,
                    name: data.label.name,
                    color: data.label.color,
                    description: data.label.description,
                    repo_id: data.repository.id,
                }
                if (label) {
                    this.labelRepo.save(label);
                }
                break;
            }

            case 'edited': {
                const name = data.label.name.split(' ').join('%20');
                const url = `${data.repository.html_url}/labels/${name}`;
                const newLabel = {
                    url: url,
                    name: data.label.name,
                    color: data.label.color,
                    description: data.label.description,
                }
                if (newLabel) {
                    this.labelRepo.update({ node_id: data.label.node_id }, newLabel);
                }
                break;
            }

            case 'deleted': {
                this.labelRepo.delete({ node_id: data.label.node_id });
                break;
            }
        }
    }

    listenMilestone(data) {
        switch (data.action) {
            case 'created': {
                const url = `${data.repository.html_url}/milestone/${data.milestone.number}`;
                const milestone = {
                    name: data.milestone.title,
                    description: data.milestone.description,
                    url: url,
                    node_id: data.milestone.node_id,
                    creator: data.milestone.creator.login,
                    number: data.milestone.number,
                    state: data.milestone.state,
                    due_on: data.milestone.due_on,
                    close_at: data.milestone.close_at,
                    repo_id: data.repository.id,
                }
                if (milestone) {
                    this.mileRepo.save(milestone);
                }
                break;
            }
            case 'edited': {
                console.log(data);
                const newMilestone = {
                    name: data.milestone.title,
                    description: data.milestone.description,
                    due_on: data.milestone.due_on,
                }
                if (newMilestone) {
                    this.mileRepo.update({ node_id: data.milestone.node_id }, newMilestone);
                }
                break;
            }
            case 'deleted': {
                this.mileRepo.delete({ node_id: data.milestone.node_id })
                break;
            }

            case 'closed': {
                this.mileRepo.update(
                    { node_id: data.milestone.node_id },
                    { state: data.milestone.state }
                )
                break;
            }

            case 'opened': {
                this.mileRepo.update(
                    { node_id: data.milestone.node_id },
                    { state: data.milestone.state }
                )
                break;
            }
        }
    }

    listenColumn(data) {
        switch (data.action) {
            case 'created': {
                //Get project id from webhook
                const projUrl = data.project_column.project_url;
                const projId = Number(projUrl[projUrl.length - 1]);

                //Get project url from webhook
                this.projRepo.findOne({
                    where: { external_id: projId }
                }).then(val => {
                    const url = `${data.repository.html_url}/projects/${val.number}/columns/${data.project_column.id}`;
                    const column = {
                        url: url,
                        external_id: data.project_column.id,
                        name: data.project_column.name,
                        external_proj_id: projId,
                    }
                    if (column) {
                        this.colRepo.save(column);
                    }
                })
                break;
            }
            case 'edited': {
                this.colRepo.update(
                    { external_id: data.project_column.id },
                    { name: data.project_column.name }
                )
                break;
            }
            case 'deleted': {
                this.colRepo.delete({ external_id: data.project_column.id })
                break;
            }
        }
    }

    listenIssueLable(data) {
        switch (data.action) {
            case 'labeled': {
                this.labelRepo.findOne({
                    where: { node_id: data.label.node_id }
                }).then(label => {
                    if (label) {
                        const isslabel = {
                            external_issue_id: data.issue.id,
                            label_id: label.id,
                        }
                        this.isslabRepo.save(isslabel);
                    }
                })
                break;
            }

            case 'unlabeled': {
                this.labelRepo.findOne({
                    where: { node_id: data.label.node_id }
                }).then(label => {
                    if (label) {
                        const isslabel = {
                            external_issue_id: data.issue.id,
                            label_id: label.id,
                        }
                        if (isslabel.external_issue_id != null && isslabel.label_id != null) {
                            this.isslabRepo.delete(isslabel);
                        }
                    }
                })
                break;
            }
        }

    }

    listenIssueAssignee(data) {
        switch (data.action) {
            case 'assigned': {
                const issAssignee = {
                    external_issue_id: data.issue.id,
                    username: data.assignee.login,
                }
                if (issAssignee.external_issue_id != null && issAssignee.username != null) {
                    this.issassRepo.save(issAssignee);
                }
                break;
            }

            case 'unassigned': {
                const issAssignee = {
                    external_issue_id: data.issue.id,
                    username: data.assignee.login,
                }
                this.issassRepo.delete(issAssignee);
                break;
            }
        }
    }

    listenIssueColumn(data) {
        //Get issue_number from webhook
        const content_url = data.project_card.content_url;
        const issue_number = Number(content_url[content_url.length - 1]);

        switch (data.action) {
            case 'moved': {
                this.issueRepo.findOne({
                    where: { number: issue_number }
                }).then(issue => {
                    this.isscolRepo.update(
                        {
                            external_issue_id: issue.external_id,
                            external_col_id: data.changes.column_id.from,
                        },
                        {
                            external_issue_id: issue.external_id,
                            external_col_id: data.project_card.column_id,
                        }
                    )
                })
                break;
            }

            case 'deleted': {
                this.issueRepo.findOne({
                    where: { number: issue_number }
                }).then(issue => {
                    this.isscolRepo.delete({
                        external_issue_id: issue.external_id,
                        external_col_id: data.project_card.column_id,
                    })
                })
                break;
            }

            case 'created': {
                this.issueRepo.findOne({
                    where: { number: issue_number }
                }).then(issue => {
                    this.isscolRepo.save({
                        external_issue_id: issue.external_id,
                        external_col_id: data.project_card.column_id,
                    })
                })
                break;
            }
        }
    }

    listenComment(data): Promise<any> {
        switch (data.action) {
            case 'created': {
                const comment = {
                    external_issue_id: data.issue.id,
                    external_id: data.comment.id,
                    author: data.comment.user.login,
                    content: data.comment.body,
                }
                if (comment) {
                    this.commentRepo.save(comment);
                }
                return this.commentRepo.findOne({ where: { external_id: comment.external_id } });
                break;
            }

            case 'edited': {
                this.commentRepo.update(
                    { external_id: data.comment.id },
                    { content: data.comment.body }
                )
                break;
            }

            case 'deleted': {
                this.commentRepo.delete({ external_id: data.comment.id })
                break;
            }
        }
    }

    listenWebhooks(gitEvent, data){
        switch (gitEvent) {
            case 'issues': {
                if (!data.label && !data.assignee) {
                    return this.listenIssue(data);
                }
                if (data.label) {
                    return this.listenIssueLable(data);
                }
                if (data.assignee) {
                    return this.listenIssueAssignee(data);
                }
                break;
            }
            case 'issue_comment': {
                return this.listenComment(data);
                break;
            }
            case 'project_card': {
                return this.listenIssueColumn(data);
                break;
            }
            case 'project': {
                return this.listenProject(data);
                break;
            }
            case 'label': {
                return this.listenLabel(data);
                break;
            }
            case 'milestone': {
                return this.listenMilestone(data);
                break;
            }
            case 'project_column': {
                return this.listenColumn(data);
                break;
            }

        }
        return null;
    }
}