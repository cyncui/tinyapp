const generateRandomString = () => {
  return Math.random().toString(36).substring(7);
};

const findEmail = (email, userSet) => {
  for (const user in userSet) {
    if (userSet[user].email === email) {
      return database[user];
    }
  }

  return false;
}

module.exports = {
  generateRandomString,
  findEmail
};
