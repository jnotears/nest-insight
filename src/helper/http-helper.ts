export const httpOptions = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer 273ad81649c5742cf948ca78b220b47152f70c04",
      //"Authorization": process.env.GIT_PERSONAL_TOKEN
    },
};

// export const httpOptions = {
//   headers: {
//     "Content-Type": "application/json",
//     "Authorization": access_token
//   },
// };

export const gitGraphqlApiUrl = 'https://api.github.com/graphql';