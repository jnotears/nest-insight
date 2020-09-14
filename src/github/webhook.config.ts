export const callbackUrl = 'http://fa41ad6bdba6.ngrok.io/api.github/hooks.listener';

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