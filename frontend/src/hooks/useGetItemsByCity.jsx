import { useDispatch, useSelector } from 'react-redux';
import { setItemsInMyCity } from '../redux/userSlice';
import { useEffect, useRef } from 'react';

function useGetItemsByCity() {
    const dispatch = useDispatch();
    const { shopInMyCity } = useSelector(state => state.user);
    const hasExtracted = useRef(false);
    
    useEffect(() => {
        // Only extract once when shops are available
        if (shopInMyCity && shopInMyCity.length > 0 && !hasExtracted.current) {
            console.log('🟡 Extracting food items from shops...');
            
            // Get ALL items from ALL shops
            const allItems = [];
            shopInMyCity.forEach(shop => {
                if (shop.items && Array.isArray(shop.items)) {
                    console.log(`🏪 Shop "${shop.name}" has ${shop.items.length} items`);
                    allItems.push(...shop.items);
                }
            });
            
            console.log(`✅ Found ${allItems.length} food items`);
            dispatch(setItemsInMyCity(allItems));
            hasExtracted.current = true; // Mark as done
        }
    }, [shopInMyCity, dispatch]);
}

export default useGetItemsByCity;