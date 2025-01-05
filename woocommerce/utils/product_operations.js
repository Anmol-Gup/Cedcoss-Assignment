const axios = require("axios");

const createProduct = async (url, productData, access_token) => {
  try {
    const { data } = await axios.post(url, productData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    console.log("Product created");
  } catch (error) {
    console.log(
      "Error creating product:",
      error.response ? error.response.data : error.message
    );
  }
};

const searchProductBySku = async (url, sku, access_token) => {
  try {
    const { data } = await axios.post(
      url,
      {
        filterGroups: [
          {
            filters: [
              {
                propertyName: "hs_sku",
                operator: "EQ",
                value: sku,
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
    return data;

  } catch (error) {
    console.log(
      "Error getting product:",
      error.response ? error.response.data : error.message
    );
    return null;
  }
};

const updateProduct=async(url,productData,access_token)=>{
    try {
        const {data}=await axios.patch(url,productData,{
            headers:{
                Authorization:`Bearer ${access_token}`
            }
        })
        console.log('Product updated')
        
    } catch (error) {
        console.log("Error updating product:",error.response ? error.response.data : error.message);
    }
}

module.exports = {
  createProduct,
  searchProductBySku,
  updateProduct
};
