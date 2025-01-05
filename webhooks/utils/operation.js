const axios = require("axios");

const searchContactById = async (url, token) => {
  try {
    const { data } = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data.properties;
  } catch (error) {
    console.log(
      "Error getting contact:",
      error.response ? error.response.data : error.message
    );
    return null;
  }
};

const searchContactByEmail = async (url,email,access_token) => {
  try {
    const {data} = await axios.post(url,{
            "filterGroups":[
              {
                "filters":[
                  {
                    "propertyName": "email",
                    "operator": "EQ",
                    "value": email
                  }
                ]
              }
            ]
    },{
        headers:{
            Authorization:`Bearer ${access_token}`
        }
    })
    return data

  } catch (error) {
    console.log("Error getting contact:",error.response ? error.response.data : error.message);
    return null;
  }
};

const createContact=async(url,contactData,access_token)=>{
    try {
        const {data}=await axios.post(url,contactData,{
            headers:{
                Authorization:`Bearer ${access_token}`
            }
        })
        console.log(data)

    } catch (error) {
        console.log("Error creating contact:",error.response ? error.response.data : error.message);
    }
}

const updateContact=async(url,contactData,access_token)=>{
    try {
      console.log(contactData)
        const {data}=await axios.patch(url,contactData,{
            headers:{
                Authorization:`Bearer ${access_token}`
            }
        })
        console.log(data)
        
    } catch (error) {
        console.log("Error updating contact:",error.response ? error.response.data : error.message);
    }
}

module.exports = {
  searchContactById,
  searchContactByEmail,
  createContact,
  updateContact
};
