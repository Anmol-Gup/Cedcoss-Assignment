require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const SCOPES = process.env.SCOPES;
const BASE_URI = process.env.BASE_URI;
const PORTAL_ID = process.env.PORTAL_ID;
// const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const MONGODB_URI = process.env.MONGODB_URI;
const {
  createContact,
  searchContactByEmail,
  updateContact,
} = require("./utils/contact_operations");
const {
  createProduct,
  searchProductBySku,
  updateProduct,
} = require("./utils/product_operations");
const {
  createOrder,
  searchOrderById,
  updateOrder,
  getPipelineId,
} = require("./utils/orders_operations");
const connectDB = require("./connection");
const { storeToken, getToken } = require("./utils/token");
const createLineItem = require("./utils/lineitems_operations");

app.use(express.json());
connectDB(MONGODB_URI);

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
      storeToken(PORTAL_ID, refresh_token, access_token, expires_in);
      // console.log(data);
      res.json(data);
    } catch (error) {
      console.log(error.message);
      res.status(500).json(error.message);
    }
  }
});

app.post("/", async (req, res) => {
  const { email, first_name, last_name } = req.body;
  // console.log("req", req.headers['x-wc-webhook-event']);

  const ACCESS_TOKEN = await getToken(PORTAL_ID);

  if (!ACCESS_TOKEN) {
    console.log("Invalid token");
    return res.redirect("/authorize");
  }

  try {
    const response = await searchContactByEmail(
      `${BASE_URI}/crm/v3/objects/contacts/search`,
      email,
      ACCESS_TOKEN
    );

    if (!response) {
      return res.status(500).json("Error in creating or updating contact");
    }

    const { results } = response;
    if (
      results &&
      results.length !== 0 &&
      results[0].properties.email === email
    ) {
      const { id } = results[0];
      const contactData = {
        properties: {
          firstname: first_name,
          lastname: last_name,
        },
      };
      await updateContact(
        `${BASE_URI}/crm/v3/objects/contacts/${id}`,
        contactData,
        ACCESS_TOKEN
      );
    } 
    else {
      const contactData = {
        properties: {
          email,
          firstname: first_name,
          lastname: last_name,
        },
      };

      await createContact(
        `${BASE_URI}/crm/v3/objects/contacts`,
        contactData,
        ACCESS_TOKEN
      );
    }
    res.status(201).json("Success");
  } 
  catch (error) {
    console.log("Error in create or update contact:", error.message);
    res.status(500).json("Failed");
  }
});

app.post("/products", async (req, res) => {
  
  // console.log('req',req.headers['x-wc-webhook-event']);
  
  const ACCESS_TOKEN = await getToken(PORTAL_ID);
  if (!ACCESS_TOKEN) {
    console.log("Invalid token");
    return res.redirect("/authorize");
  }
  
  const { name, price, sku, description } = req.body;
  
  try {

    const response = await searchProductBySku(
      `${BASE_URI}/crm/v3/objects/products/search`,
      sku,
      ACCESS_TOKEN
    );

    // console.log(response);
    if (!response) {
      return res.status(500).json("Error in creating or updating product");
    }

    const { results } = response;
    // console.log(results);
    
    if (results && results.length !== 0) {
      const { id } = results[0];

      const productData = {
        properties: {
          name,
          price,
          description,
        },
      };

      await updateProduct(
        `${BASE_URI}/crm/v3/objects/products/${id}`,
        productData,
        ACCESS_TOKEN
      );
      
    } 
    else {
      if(req.headers['x-wc-webhook-event']==='created'){
        const productData = {
          properties: {
            name: name,
            price: price,
            hs_sku: sku,
            description: description,
          },
        };
    
        await createProduct(
          `${BASE_URI}/crm/v3/objects/products`,
          productData,
          ACCESS_TOKEN
        );
      }
    }
    res.status(201).json("Success");
  } 
  catch (error) {
    console.log("Error in creating product:", error.message);
    res.status(500).json("Failed");
  }
});

app.post("/orders", async (req, res) => {

  // console.log('order req',req.headers['x-wc-webhook-event']);
  
  const ACCESS_TOKEN = await getToken(PORTAL_ID);
  if (!ACCESS_TOKEN) {
    console.log("Invalid token");
    return res.redirect("/authorize");
  }

  const {
    id,
    currency,
    status,
    date_created,
    total,
    billing: { first_name, last_name, city, state, country, email },
    line_items,
  } = req.body;

  try {
    
    const response = await searchContactByEmail(
      `${BASE_URI}/crm/v3/objects/contacts/search`,
      email,
      ACCESS_TOKEN
    );

    if (!response) {
      return res.status(500).json("Some error occured");
    }

    // checking contact exists or not
    const contact_result = response.results;
    console.log('status',status,getPipelineId(status.toLowerCase()));

    if (contact_result && contact_result.length !== 0 && contact_result[0].properties.email === email) {
      const {id}=req.body

      const response=await searchOrderById(`${BASE_URI}/crm/v3/objects/orders/search`,id,ACCESS_TOKEN)

      if(!response){
        return res.status(500).json('Some error occured')
      }

      const order_result=response.results
      
      if(order_result && order_result.length!==0){
        // console.log(order_result,order_result[0].properties);
        // console.log('update order');

        const orderData={
          properties:{
            hs_pipeline_stage:getPipelineId(status.toLowerCase())
          }
        }

        // console.log(order_result[0].id);
        await updateOrder(`${BASE_URI}/crm/v3/objects/orders/${order_result[0].id}`,orderData,ACCESS_TOKEN)
        // res.status(201).json('Success')
      }
      else{
        if(req.headers['x-wc-webhook-event']==='created'){
          // console.log('create order');
          const contactId=contact_result[0].id
          const orderData = {
            properties: {
              hs_currency_code: currency,
              hs_billing_address_city: city,
              hs_billing_address_state: state,
              hs_billing_address_country: country,
              hs_external_order_id: id,
              hs_billing_address_name:`${first_name} ${last_name}`,
              hs_billing_address_firstname: first_name,
              hs_billing_address_lastname: last_name,
              hs_pipeline_stage:getPipelineId(status.toLowerCase()),
              hs_external_created_date:new Date(date_created).getTime(),
              hs_total_price:total,
              hs_pipeline:160239428
            },
            associations: [
              {
                to: {
                  id: contactId,
                },
                types: [
                  {
                    associationCategory: "HUBSPOT_DEFINED",
                    associationTypeId: 507,
                  },
                ],
              },
            ],
          };
  
          const orderId = await createOrder(
            `${BASE_URI}/crm/v3/objects/orders`,
            orderData,
            ACCESS_TOKEN
          );
  
          await createLineItem(
            `${BASE_URI}/crm/v3/objects/line_items`,
            orderId,
            line_items,
            ACCESS_TOKEN
          );
        }
      }
      res.status(201).json("Success");
    } 
    else {
      res.status(404).json("No contact found");
    }
  } catch (error) {
    console.log("Error in create or update order:", error.message);
    res.status(500).json("Failed");
  }
});

app.listen(PORT, () => console.log(`Server is running at port no. ${PORT}...`));
