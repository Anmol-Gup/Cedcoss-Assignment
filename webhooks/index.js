require("dotenv").config();
const express = require("express");
const app = express();
const axios = require("axios");
const PORT = process.env.PORT || 8080;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const SCOPES = process.env.SCOPES;
const BASE_URI = process.env.BASE_URI;
const PORTAL_ID=process.env.PORTAL_ID
const connectDB = require("./connection");
const { storeToken, getToken, getAccountDetails } = require("./utils/token");
const {
  searchContactById,
  searchContactByEmail,
  createContact,
  updateContact
} = require("./utils/operation");
// const {storePortal, getPortalId}=require('./utils/portal')

connectDB(process.env.MONGODB_URI);

app.use(express.json());

app.get("/authorize", (req, res) => {
  const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${encodeURIComponent(
    CLIENT_ID
  )}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=${encodeURIComponent(SCOPES)}`;
  res.redirect(authUrl);
});

app.get("/oauth-callback", async (req, res) => {
  // Receive the authorization code from the OAuth 2.0 Server
  const { code } = req.query;
  if (code) {
    const formData = {
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code: code,
    };

    try {
      // Exchange the authorization code for an access token and refresh token
      const { data } = await axios.post(
        `${BASE_URI}/oauth/v1/token`,
        new URLSearchParams(formData),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const { refresh_token, access_token, expires_in } = data;
      // const {portalId, accountType}=await getAccountDetails(`${BASE_URI}/account-info/v3/details`,access_token)
      storeToken(PORTAL_ID,refresh_token, access_token, expires_in);
      // storePortal({PORTAL_ID,accountType})

      res.json(data);
    } catch (error) {
      console.log(error.message);
      res.status(500).json(error.message);
    }
  }
});

app.get("/", (req, res) => {
  res.status(200).json("Hii");
});

// Endpoint to handle webhook "Created" event
app.post("/", async (req, res) => {

  const { objectId } = req.body[0];
  // const {portalId}=await getPortalId()
  const token = await getToken(PORTAL_ID);

  if(!token){
    res.redirect('/authorize')
    return;
  }

  const { refresh_token, access_token } = token;
  console.log('access token',access_token)

  if (access_token) {

    // Finding Id to retrieve email, firstname and lastname
    const data = await searchContactById(
      `${BASE_URI}/crm/v3/objects/contacts/${objectId}`,
      process.env.PRIVATE_ACCESS_TOKEN
    );

    // console.log('data',data)
    
    if (data) {
      const { email, firstname, lastname } = data;
      const response = await searchContactByEmail(`${BASE_URI}/crm/v3/objects/contacts/search`,email,access_token);
      const contactData={
        properties:{
          email,
          firstname,
          lastname
        }
      }
      console.log(response)

      if (!response.total) {
        // create
        // console.log('create')
        await createContact(`${BASE_URI}/crm/v3/objects/contacts`, contactData, access_token)
      } 
      else {
        // update
        // console.log('update');
        const {id}=response.results[0]
        await updateContact(`${BASE_URI}/crm/v3/objects/contacts/${id}`,{properties:{firstname}}, access_token)
      }
      res.json(data);
    }
  } 
  else {
    res.redirect("/authorize");
  }
});

app.listen(PORT, () => console.log(`Server is running at port no. ${PORT}...`));
