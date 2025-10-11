import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FoodCard from './FoodCard';

function FoodList() {
  const dispatch = useDispatch();
  const { itemsInMyCity, shopInMyCity } = useSelector(state => state.yourReducer);

  // Debug: Log everything on component mount
  useEffect(() => {
    console.log('🔍 FOODLIST MOUNTED');
    console.log('🛍️ Shops in city:', shopInMyCity);
    console.log('🍕 Items in city:', itemsInMyCity);
    console.log('🏪 First shop details:', shopInMyCity[0]);
  }, []);

  // Fetch food items when shops are loaded
  useEffect(() => {
    const fetchFoodItems = async () => {
      console.log('🟡 STARTING FETCH - Shop count:', shopInMyCity.length);
      
      try {
        // Test the exact endpoint in browser first
        const TEST_ENDPOINT = 'https://pradeepfooddelivery-backend-wam8.onrender.com/api/items/all';
        console.log('🟡 Testing endpoint:', TEST_ENDPOINT);

        const response = await fetch(TEST_ENDPOINT);
        console.log('🟡 Response status:', response.status);
        console.log('🟡 Response ok:', response.ok);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const allItems = await response.json();
        console.log('✅ ITEMS FETCH SUCCESS:', allItems);
        console.log('📦 Items count:', allItems.length);
        console.log('🔍 First item:', allItems[0]);

        // If you need to filter items by shops in your city
        const shopIds = shopInMyCity.map(shop => shop._id);
        console.log('🏪 Shop IDs for filtering:', shopIds);

        const filteredItems = allItems.filter(item => {
          const matches = shopIds.includes(item.shopId || item.shop);
          console.log(`Item ${item._id} - shop: ${item.shopId || item.shop} - matches: ${matches}`);
          return matches;
        });

        console.log('✅ FILTERED ITEMS:', filteredItems);

        // Dispatch to store
        dispatch({ type: 'SET_ITEMS_IN_MY_CITY', payload: filteredItems });
        
      } catch (error) {
        console.error('❌ FETCH ERROR:', error);
        console.error('❌ Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
    };

    if (shopInMyCity.length > 0) {
      fetchFoodItems();
    } else {
      console.log('🟡 No shops available to fetch items from');
    }
  }, [shopInMyCity, dispatch]);

  return (
    <div className="flex flex-wrap gap-4 p-4">
      {itemsInMyCity.length > 0 ? (
        itemsInMyCity.map(item => (
          <FoodCard key={item._id} data={item} />
        ))
      ) : (
        <div className="text-center w-full py-8">
          <p className="text-gray-500">
            {shopInMyCity.length > 0 
              ? 'Loading food items...' 
              : 'No shops found in your area.'
            }
          </p>
          <div className="mt-4 text-xs text-gray-400">
            Debug: Shops: {shopInMyCity.length} | Items: {itemsInMyCity.length}
          </div>
        </div>
      )}
    </div>
  );
}

export default FoodList;