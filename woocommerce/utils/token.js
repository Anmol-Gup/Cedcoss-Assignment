require('dotenv').config()
const { default: axios } = require('axios')
const Token=require('../models/token')
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const BASE_URI = process.env.BASE_URI;

const storeToken=async(portalId,refresh_token,access_token,expires_in)=>{

    try {
        expires_in=new Date(Date.now()+expires_in*1000)
        const result=await Token.findOneAndUpdate({portalId},{
            refresh_token,
            access_token,
            expires_in
        },{upsert:true,new:true})
    
        // console.log(result)
        
    } catch (error) {
        console.log('Error storing token:',error.message)
    }
}

const refreshToken=async(url,refresh_token, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)=>{
    const formData = {
        grant_type: "refresh_token",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        refresh_token
    };

    try {
        const {data}=await axios.post(url,new URLSearchParams(formData),{
            headers:{
                "Content-Type":'application/x-www-form-urlencoded'
            }
        })

        const {access_token, expires_in}=data
        await Token.updateOne({refresh_token},{
            access_token,
            expires_in:new Date(Date.now()+expires_in*1000)
        })
        return access_token

    } catch (error) {
        console.log('Error in refreshing token:',error.message)
        return null
    }
}

const getToken=async(portalId)=>{
    
    try {
        const token=await Token.findOne({portalId})
        const {refresh_token, access_token, expires_in}=token

        if(token){
            if(new Date()>expires_in){
                
                const newToken=await refreshToken(`${BASE_URI}/oauth/v1/token`,refresh_token,CLIENT_ID,CLIENT_SECRET,REDIRECT_URI)
                return newToken
            }
            else{
                return access_token
            }
        }
        else{
            console.log('Invalid token')
            return null
        }
    } catch (error) {
        console.log('Error:',error.message)
        return null
    }
}

module.exports={
    storeToken,
    getToken
}