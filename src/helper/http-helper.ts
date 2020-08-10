export const httpOptions = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer 45af3cbc07a08b59bde3a541bb8f953d77e3d3e0",
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