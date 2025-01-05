const axios=require('axios')

const createLineItem=async(url,orderId,lineItems,ACCESS_TOKEN)=>{
    try {
        for (const lineItem of lineItems) {
            const {data}=await axios.post(url,{
                properties:{
                    name:lineItem.name,
                    price:lineItem.price,
                    quantity:lineItem.quantity
                },
                "associations": [
                  {
                    "to": {
                        "id": orderId
                    },
                    "types": [
                      {
                        "associationCategory": "HUBSPOT_DEFINED",
                        "associationTypeId": 514
                      } 
                    ]
                  }, 
                ]
              },{
                headers:{
                    Authorization:`Bearer ${ACCESS_TOKEN}`
                }
            })
            console.log('LineItem created and associated')
        }        
    } catch (error) {
        console.log('Error creating line items:',error.message)
    }
}

module.exports=createLineItem