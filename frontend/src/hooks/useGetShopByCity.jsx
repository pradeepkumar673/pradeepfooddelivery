import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setItemsInMyCity } from '../redux/userSlice'

function useGetItemsByCity() {
    const dispatch = useDispatch()
    const { currentCity, shopInMyCity, itemsInMyCity } = useSelector(state => state.user)

    useEffect(() => {
        const extractItemsFromShops = () => {
            if (shopInMyCity && shopInMyCity.length > 0) {
                console.log('🟡 Extracting food items from shops...');
                
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
                
                console.log('✅ Found total food items:', allItems.length);
                
                // Only update if we actually have items and they're different from current
                if (allItems.length > 0 && allItems.length !== itemsInMyCity?.length) {
                    dispatch(setItemsInMyCity(allItems));
                } else if (allItems.length > 0) {
                    console.log('🔄 Items already in state, skipping update');
                }
                return;
            }
            
            // If no shops but we have items, keep the items
            if (!shopInMyCity && itemsInMyCity && itemsInMyCity.length > 0) {
                console.log('🔄 No shops but items exist in state, keeping items');
                return;
            }
            
            // If no shops and no items, set empty array
            if (!shopInMyCity || shopInMyCity.length === 0) {
                console.log('🔄 No shops available, setting empty items');
                dispatch(setItemsInMyCity([]));
            }
        }

        extractItemsFromShops();
        
    }, [shopInMyCity, dispatch, itemsInMyCity]) // Added itemsInMyCity to dependencies
}

export default useGetItemsByCity