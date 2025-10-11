import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setItemsInMyCity } from '../redux/userSlice'

function useGetItemsByCity() {
    const dispatch = useDispatch()
    const { shopInMyCity, itemsInMyCity } = useSelector(state => state.user)

    useEffect(() => {
        // Only extract items if we have shops but no items
        if (shopInMyCity && shopInMyCity.length > 0 && (!itemsInMyCity || itemsInMyCity.length === 0)) {
            console.log('🟡 Extracting items from shops...');
            
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
            
            if (allItems.length > 0) {
                dispatch(setItemsInMyCity(allItems));
            }
        }
    }, [shopInMyCity, itemsInMyCity, dispatch])
}

export default useGetItemsByCity