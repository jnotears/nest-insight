export const httpOptions = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer 4abfc422dc907d9676ce81d890d8e8e22c0ed163",
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