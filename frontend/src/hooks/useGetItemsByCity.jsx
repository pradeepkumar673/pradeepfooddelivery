import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setItemsInMyCity } from '../redux/userSlice'

function useGetItemsByCity() {
    const dispatch = useDispatch()
    const { currentCity, shopInMyCity } = useSelector(state => state.user)
    
    useEffect(() => {
        const extractItemsFromShops = () => {
            try {
                console.log('🟡 Extracting items from shops...');
                
                if (!shopInMyCity || shopInMyCity.length === 0) {
                    console.log('❌ No shops available');
                    dispatch(setItemsInMyCity([]));
                    return;
                }
                
                // Extract all items from all shops
                const allItems = shopInMyCity.flatMap(shop => {
                    if (shop.items && Array.isArray(shop.items)) {
                        console.log(`🏪 Shop "${shop.name}" has ${shop.items.length} items`);
                        // Add shop information to each item
                        return shop.items.map(item => ({
                            ...item,
                            shop: shop.name, // Add shop name to item
                            shopId: shop._id // Add shop ID to item
                        }));
                    }
                    return [];
                });
                
                console.log('📦 Total items extracted:', allItems.length);
                console.log('🍕 Sample item:', allItems[0]);
                
                dispatch(setItemsInMyCity(allItems));
                
            } catch (error) {
                console.error('❌ Error extracting items from shops:', error);
                dispatch(setItemsInMyCity([]));
            }
        }
        
        // Extract items when we have shops
        if (shopInMyCity && shopInMyCity.length > 0) {
            console.log('🟡 Shops available, extracting items...');
            extractItemsFromShops();
        } else {
            console.log('🟡 Waiting for shops...');
        }
    }, [shopInMyCity, dispatch])
}

export default useGetItemsByCity