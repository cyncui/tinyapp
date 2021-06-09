const generateRandomString = () => {
  return Math.random().toString(36).substring(7);
};

const findEmail = (email, urlSet) => {
  for (const user in urlSet) {
    if (urlSet[user].email === email) {
      return urlSet[user];
    }
  };

  return false;
};

const urlsForUser = (id, urlSet) => {
  let userUrls = {};

  for (const shortURL in urlSet) {
    if (urlSet[shortURL].userID === id) {
      userUrls[shortURL] = urlSet[shortURL]
    }
  };

  return userUrls;
};

module.exports = {
  generateRandomString,
  findEmail,
  urlsForUser
};
