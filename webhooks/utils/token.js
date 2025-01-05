require("dotenv").config();
const Token = require("../token");
const axios = require("axios");

const getAccountDetails = async (url, access_token) => {
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  console.log(data);
  return data;
};

const storeToken = async (portalId,refresh_token,access_token,expires_in) => {
  expires_in = new Date(Date.now() + expires_in * 1000); // expiresIn is in seconds

  const result = await Token.findOneAndUpdate(
    { portalId },  // Query by portalId
    {
      refresh_token,
      access_token,
      expires_in,
    },
    { upsert: true, new: true } // Use new: true to return the updated document
  );
  
  console.log(result);
};

const refreshToken = async (refresh_token) => {
  const formData = {
    grant_type: "refresh_token",
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    refresh_token,
  };

  const { data } = await axios.post(
    `${process.env.BASE_URI}/oauth/v1/token`,
    new URLSearchParams(formData),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const { access_token, expires_in } = data;
  await Token.updateOne(
    { refresh_token },
    { access_token, expires_in: new Date(Date.now() + expires_in * 1000) }
  );
  return { refresh_token, access_token };
};

const getToken = async (portalId) => {
  const token = await Token.findOne({ portalId });
  if (token) {
    const { refresh_token, access_token, expires_in } = token;

    if (new Date() > expires_in) {
      const newToken = await refreshToken(refresh_token);
      return newToken;
    } else {
      return { refresh_token, access_token };
    }
  } 
  else {
    // throw Error("Invalid or expired token");
    console.log('Invalid token')
    return null
  }
};

module.exports = {
  storeToken,
  getToken,
  getAccountDetails,
};
