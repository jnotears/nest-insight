export const httpOptions = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer e0f6bc03cf960086a46cb81943006885967e8bfc",
    },
};

export const callbackUrl = 'http://ba3131dd701c.ngrok.io/action';

export const eventList = [
  'push',
  'commit_comment',
  'create',
  'delete',
  'issue_comment',
  'issues',
  'label',
  'milestone',
  'project_card',
  'project_column',
  'project',
  'pull_request',
  'pull_request_review',
  'pull_request_review_comment',
  'repository',
  'watch',
  'member'
];

export const hooksConfig = {
  "name": "web",
  "active": true,
  "events": eventList,
  "config":{
    "url": callbackUrl,
    "content_type": "json",
    "insecure": "0"
  }
}

export const gitGraphqlApiUrl = 'https://api.github.com/graphql';

export const gitApiUrl = 'https://api.github.com';
