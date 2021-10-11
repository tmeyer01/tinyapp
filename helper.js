const searchUsersByEmail = (email, database) => {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

const searchDataBaseByUser = (userID, database) => {
  const newUrlDatabase = {};
  for (const shortURL in database) {
    if (database[shortURL]["userID"] === userID) {
      newUrlDatabase[shortURL] = database[shortURL];
    }
  }
  return newUrlDatabase;
};

const generateRandomString = () => {
  let sixRanLetters = "";
  const letters = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSdTtUuVvWwXxYyZz";
  const letterNum = letters.length;

  for (let i = 0; i < 6; i++) {
    sixRanLetters += letters.charAt(Math.floor(Math.random() * letterNum));
  }
  return sixRanLetters;
};


module.exports = { searchUsersByEmail, searchDataBaseByUser, generateRandomString };