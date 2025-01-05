const Portal = require("../portal")

const storePortal=async({portalId, accountType})=>{
    await Portal.create({
        portalId,
        accountType
    })
}

const getPortalId=async()=>{
    const result=await Portal.find()
    console.log(result)
    return result
}

module.exports={
    storePortal,
    getPortalId
}