const mongoose=require('mongoose')
const tokenSchema=new mongoose.Schema({
    portalId:{
        type:String
    },
    refresh_token:{
        type:String
    },
    access_token:{
        type:String
    },
    expires_in:{
        type:Date,
    }
})

const Token=mongoose.model('token',tokenSchema)
module.exports=Token