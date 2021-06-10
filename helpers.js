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

const getUserByEmail = function(email, database) {
  for (const id in database) {
    if (database[id].email === email) {
      return id;
    };
  };

  return undefined;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser,
};
