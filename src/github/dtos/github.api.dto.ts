export interface GithubProfileAPIResponse {
    username: string;
    name: string;
    email: string;
    avatar_url: string
}

export interface ProfileResponse{
    name: string;
    email: string;
    avatar_url: string
}

export interface GitRepositoryAPIResponse {
    external_id: string;
    name: string;
    owner: string;
}

export interface GitProjectAPIResponse {
    external_id: number;
    number: number
    name: string;
    description: string;
    state: string;
    closed_at?: Date;
}

export interface GitIssueAPIResponse{
    external_id: number;
    number: number;
    name: string;
    author: string;
    content: string;
    url: string;
    state: string;
    closed_at?: Date;
}

export interface GitColumnAPIResponse {
    external_id: number;
    name: string;
    url: string;
}

export interface GitCommentAPIResponse {
    external_id: number;
    author: string;
    content: string;
    url: string;
}

export interface GitMilestoneAPIResponse {
    name: string;
    url: string;
    state: string;
    number: number;
    creator: string;
    due_on: Date;
    closed_at: Date;
    description: string;
}

export interface GitLabelAPIResponse {
    name: string;
    color: string;
    description: string;
    url: string;
}

export interface GitIssueColumnAPIResponse{
    col_external_id: number;
    proj_external_id: number;
}



