import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setItemsInMyCity } from '../redux/userSlice'

function useGetItemsByCity() {
    const dispatch = useDispatch()
    const { currentCity, shopInMyCity } = useSelector(state => state.user)

    useEffect(() => {
        const fetchItems = async () => {
            try {
                console.log('🟡 Starting to fetch food items...');
                
                // If shops are available, extract items from them
                if (shopInMyCity && shopInMyCity.length > 0) {
                    console.log('🏪 Shops available, extracting items...');
                    
                    const allItems = [];
                    shopInMyCity.forEach(shop => {
                        if (shop.items && Array.isArray(shop.items)) {
                            console.log(`🏪 Shop "${shop.name}" has ${shop.items.length} items`);
                            // Add shop info to each item
                            const shopItems = shop.items.map(item => ({
                                ...item,
                                shopId: shop._id,
                                shopName: shop.name,
                                shopImage: shop.image
                            }));
                            allItems.push(...shopItems);
                        }
                    });
                    
                    console.log('✅ Total items extracted:', allItems.length);
                    dispatch(setItemsInMyCity(allItems));
                    return;
                }

                // Fallback: Try to fetch from items endpoint
                console.log('🟡 Trying to fetch from items endpoint...');
                const result = await axios.get(`${serverUrl}/api/items/get-by-city/all`, { withCredentials: true })
                console.log('🟢 Items from API:', result.data);
                dispatch(setItemsInMyCity(result.data));
                
            } catch (error) {
                console.log('❌ Error fetching items:', error);
                // Even if API fails, try to use shop items
                if (shopInMyCity && shopInMyCity.length > 0) {
                    const allItems = shopInMyCity.flatMap(shop => shop.items || []);
                    console.log('🔄 Using fallback items from shops:', allItems.length);
                    dispatch(setItemsInMyCity(allItems));
                } else {
                    dispatch(setItemsInMyCity([]));
                }
            }
        }

        fetchItems()
    }, [currentCity, shopInMyCity, dispatch])
}

export default useGetItemsByCity