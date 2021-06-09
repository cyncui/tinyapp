const generateRandomString = () => {
  return Math.random().toString(36).substring(7);
};

const findEmail = (email, userSet) => {
  for (const user in userSet) {
    if (userSet[user].email === email) {
      return database[user];
    }
  }

  return undefined;
}

module.exports = {
  generateRandomString,
  findEmail
};
