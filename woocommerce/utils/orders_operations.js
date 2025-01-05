const axios = require("axios");

const createOrder = async (url, orderData, access_token) => {
  try {
    const { data } = await axios.post(url, orderData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    console.log("Order created");
    return data.id;
  } catch (error) {
    console.log(
      "Error creating order:",
      error.response ? error.response.data : error.message
    );
  }
};

const updateOrder = async (url, orderData, access_token) => {
  try {
    const { data } = await axios.patch(url, orderData, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    console.log('Order updated');
  } 
  catch (error) {
    console.log(
      "Error updating contact:",
      error.response ? error.response.data : error.message
    );
  }
};

const searchOrderById = async (url, id, access_token) => {
//   console.log(id);

  try {
    const { data } = await axios.post(
      url,
      {
        filterGroups: [
          {
            filters: [
              {
                propertyName: "hs_external_order_id",
                operator: "EQ",
                value: id,
              },
            ],
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    console.log("data", data);
    return data;

  } catch (error) {
    console.log(
      "Error getting order:",
      error.response ? error.response.data : error.message
    );
    return null;
  }
};

const getPipelineId=(status)=>{
  let stageId;
  // console.log(status);
  
  switch(status){
    case 'pending': stageId=268798046; break; 
    case 'processing': stageId=268798047; break; 
    case 'on-hold': stageId=268798048; break; 
    case 'cancelled': stageId=268798049; break;
    case 'completed': stageId=268711328; break; 
    case 'refunded': stageId=268711329; break; 
    case 'failed': stageId=268711330; break; 
  }
  return stageId
}

module.exports = {
  createOrder,
  searchOrderById,
  updateOrder,
  getPipelineId
};
