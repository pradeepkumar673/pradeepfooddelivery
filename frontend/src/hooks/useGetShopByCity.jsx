import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setShopsInMyCity } from '../redux/userSlice'

function useGetShopByCity() {
    const dispatch = useDispatch()
    const { currentCity, shopInMyCity } = useSelector(state => state.user)
    
    useEffect(() => {
        const fetchShops = async () => {
            // If we already have shops, don't fetch again
            if (shopInMyCity && shopInMyCity.length > 0) {
                console.log('🔄 Shops already in state, skipping fetch');
                return;
            }

            try {
                console.log('🟡 Fetching shops...');
                const result = await axios.get(`${serverUrl}/api/shop/get-by-city/all`, { withCredentials: true })
                
                if (result.data && result.data.length > 0) {
                    console.log('✅ Shops fetched successfully:', result.data.length);
                    dispatch(setShopsInMyCity(result.data));
                } else {
                    console.log('🔄 No shops found');
                }
                
            } catch (error) {
                console.log('❌ Error fetching shops:', error.message);
                // Don't set empty array on error to avoid clearing existing data
            }
        }
        
        fetchShops();
    }, [currentCity, dispatch, shopInMyCity])
}

export default useGetShopByCity