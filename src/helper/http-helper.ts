export const httpOptions = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer 7cea30226e86de4fbf69d118eacc3c4be44d2f36",
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