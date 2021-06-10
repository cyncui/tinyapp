const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "aJ48lW": {
    id: "aJ48lW",
    email: "w@example.com",
    password: "$abcdefg"
  },
  "jd67j1": {
    id: "jd67j1",
    email: "z@example.com",
    password: "123321"
  }
};

describe('#getUserByEmail', function() {
  it("should return 'userRandomID", function() {
    const user = getUserByEmail("user@example.com", users)
    const expectedOutput = "userRandomID";
    assert.strictEqual(user, expectedOutput);
  });
});

describe('#getUserByEmail', function() {
  it("should return user2RandomID", function() {
    const user = getUserByEmail("user2@example.com", users)
    const expectedOutput = "user2RandomID";
    assert.strictEqual(user, expectedOutput);
  });
});

describe('#getUserByEmail', function() {
  it("should not return fghtyk", function() {
    const user = getUserByEmail("z@example.com", users)
    const expectedOutput = "fghtyk";
    assert.notStrictEqual(user, expectedOutput);
  });
});

describe('#getUserByEmail', function() {
  it("should return undefined if the email does not exist in the database", function() {
    const user = getUserByEmail("cxt@me.com", users)
    const expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput);
  });
});