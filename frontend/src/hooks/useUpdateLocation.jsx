import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import {  setCurrentAddress, setCurrentCity, setCurrentState, setUserData } from '../redux/userSlice'
import { setAddress, setLocation } from '../redux/mapSlice'

function useUpdateLocation() {
    const dispatch=useDispatch()
    const {userData}=useSelector(state=>state.user)
 
    useEffect(()=>{
if(!userData) return
const updateLocation=async (lat,lon) => {
    try{
      await axios.post(`${serverUrl}/api/user/update-location`,{lat,lon},{withCredentials:true})
    }catch(e){
      console.log(e)
    }
}

const watcherId = navigator.geolocation.watchPosition(
  (pos)=>{
    updateLocation(pos.coords.latitude,pos.coords.longitude)
  },
  (err)=>{
    console.error('geo error', err)
  },
  { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
)
return ()=> navigator.geolocation.clearWatch(watcherId)
    },[userData])
}

export default useUpdateLocation
