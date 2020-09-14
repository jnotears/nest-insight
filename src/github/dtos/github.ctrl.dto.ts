export class GithubLoginDto {
    access_token: string;
}

export interface RepositoryExtendedResponse{
    id: number;
    name: string;
    user_id: string;
    updated_at: Date;
    user_name: string;
    user_avatar: string;
    user_email: string;
}

export interface AssigneeResponse{
    user_id: string;
    name: string;
    email: string;
    avatar_url: string;
    issue_id: number;
}
