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
            // If we already have items, don't do anything
            if (itemsInMyCity && itemsInMyCity.length > 0) {
                console.log('🔄 Items already exist in state, skipping extraction');
                return;
            }

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
                
                if (allItems.length > 0) {
                    dispatch(setItemsInMyCity(allItems));
                }
                return;
            }
            
            console.log('🔄 No shops available for item extraction');
        }

        extractItemsFromShops();
        
    }, [shopInMyCity, dispatch, itemsInMyCity])
}

export default useGetItemsByCity