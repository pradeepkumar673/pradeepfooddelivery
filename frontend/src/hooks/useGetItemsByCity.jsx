import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setItemsInMyCity } from '../redux/userSlice'

function useGetItemsByCity() {
    const dispatch = useDispatch()
    const { currentCity, shopInMyCity } = useSelector(state => state.user)
    
    useEffect(() => {
        const fetchAllItems = async () => {
            try {
                console.log('🟡 Starting to fetch all food items...');
                
                // Get all unique item IDs from all shops
                const allItemIds = [];
                
                if (shopInMyCity && shopInMyCity.length > 0) {
                    shopInMyCity.forEach(shop => {
                        if (shop.items && Array.isArray(shop.items)) {
                            console.log(`🏪 Shop "${shop.name}" has ${shop.items.length} items`);
                            allItemIds.push(...shop.items);
                        }
                    });
                }
                
                console.log('📦 All item IDs found:', allItemIds);
                
                if (allItemIds.length === 0) {
                    console.log('❌ No item IDs found in shops');
                    dispatch(setItemsInMyCity([]));
                    return;
                }
                
                // Remove duplicates
                const uniqueItemIds = [...new Set(allItemIds)];
                console.log('📦 Unique item IDs to fetch:', uniqueItemIds);
                
                // Fetch each item individually using the correct endpoint
                console.log('🟡 Fetching individual food items...');
                const itemPromises = uniqueItemIds.map(async (itemId) => {
                    try {
                        console.log(`🟡 Fetching item: ${itemId}`);
                        const response = await axios.get(`${serverUrl}/api/item/get-by-id/${itemId}`, { 
                            withCredentials: true 
                        });
                        console.log(`✅ Fetched: ${response.data.name}`);
                        return response.data;
                    } catch (error) {
                        console.error(`❌ Error fetching item ${itemId}:`, error);
                        return null;
                    }
                });
                
                const allItems = await Promise.all(itemPromises);
                const validItems = allItems.filter(item => item !== null);
                
                console.log('✅ Successfully fetched items:', validItems.length);
                console.log('🍕 Items data:', validItems);
                
                dispatch(setItemsInMyCity(validItems));
                
            } catch (error) {
                console.error('❌ Error in fetchAllItems:', error);
                dispatch(setItemsInMyCity([]));
            }
        }
        
        // Fetch items when we have shops and city
        if (currentCity && shopInMyCity && shopInMyCity.length > 0) {
            console.log('🟡 Conditions met, fetching items...');
            fetchAllItems();
        } else {
            console.log('🟡 Waiting for shops or city...', {
                hasCity: !!currentCity,
                hasShops: !!(shopInMyCity && shopInMyCity.length > 0)
            });
        }
    }, [currentCity, shopInMyCity, dispatch])
}

export default useGetItemsByCity