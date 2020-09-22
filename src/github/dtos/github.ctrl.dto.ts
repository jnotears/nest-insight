export class GithubLoginDto {
    access_token: string;
}

export interface RepositoryExtendedResponse{
    id: number;
    name: string;
    user_id: string;
    updated_at: Date;
    owner_name: string;
    owner_avatar: string;
    owner_email: string;
}

export interface AssigneeResponse{
    user_id: string;
    name: string;
    email: string;
    avatar_url: string;
    issue_id: number;
}

export interface UserResponse{
    id: string;
    username: string;
    name: string;
    email: string;  
    avatar_url: string;
    created_at: Date;
    updated_at: Date;
}

