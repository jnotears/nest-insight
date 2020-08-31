export interface GithubProfileAPIResponse {
    username: string;
    name: string;
    email: string;
}

export interface GitRepositoryAPIResponse {
    repo_id: string;
    name: string;
    owner: string;
}

export interface GitIssueAPIResponse {
    external_id: number;
    number: number;
    name: string;
    author: string;
    content: string;
    url: string;
    mile_node_id: number;
    repo_id: number;
    state: string;
}

export interface GitLabelAPIResponse {
    name: string;
    node_id: string;
    url: string;
    color: string;
    description: string;
    repo_id: number
}

export interface GitProjectAPIResponse {
    external_id: number;
    number: number
    name: string;
    content: string;
    state: string;
    repo_id: number;
}

export interface GitMilestoneAPIResponse {
    node_id: string;
    name: string;
    url: string;
    state: string;
    number: number;
    creator: string;
    due_on: Date;
    closed_at: Date;
    repo_id: number;
}

export interface GitColumnAPIResponse {
    name: string;
    url: string;
    external_id: number;
    external_proj_id: number;
}

export interface GitCommentAPIResponse {
    external_id: number;
    external_issue_id: number;
    author: string;
    content: string;
}