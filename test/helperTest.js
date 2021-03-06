const { assert } = require('chai');

const { searchUsersByEmail } = require('../helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('searchUsersByEmail', function() {
  it('should return a user with valid email', function() {
    const user = searchUsersByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput);
  });
});

describe('searchUsersByEmail', function() {
  it('If passed an none existant email will return undefined.', function() {
    const user = searchUsersByEmail("u@example.com", testUsers);
    assert.isUndefined(user);
  });
});



