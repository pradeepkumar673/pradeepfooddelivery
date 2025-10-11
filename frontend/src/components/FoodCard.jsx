import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FoodCard from './FoodCard';

function FoodList() {
  const dispatch = useDispatch();
  const { itemsInMyCity, shopInMyCity } = useSelector(state => state.yourReducer);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch food items when shops are loaded
  useEffect(() => {
    const fetchFoodItems = async () => {
      setLoading(true);
      setError('');
      
      try {
        console.log('🟡 Starting to fetch food items...');
        console.log('🛍️ Available shops:', shopInMyCity.length);
        
        // Since /api/items/all returns 404, we need to fetch items differently
        // Option 1: Try to get items from each shop's items array
        const allItemIds = [];
        
        // Collect all item IDs from all shops
        shopInMyCity.forEach(shop => {
          if (shop.items && Array.isArray(shop.items)) {
            allItemIds.push(...shop.items);
          }
        });

        console.log('📦 Item IDs found in shops:', allItemIds);

        if (allItemIds.length === 0) {
          setError('No food items found in the shops');
          setLoading(false);
          return;
        }

        // Fetch each item individually
        console.log('🟡 Fetching individual items...');
        
        const itemPromises = allItemIds.map(async (itemId) => {
          try {
            // Try different endpoints for individual items
            const endpoints = [
              `https://pradeepfooddelivery-backend-wam8.onrender.com/api/items/${itemId}`,
              `https://pradeepfooddelivery-backend-wam8.onrender.com/api/food/${itemId}`,
              `https://pradeepfooddelivery-backend-wam8.onrender.com/api/item/${itemId}`,
              `/api/items/${itemId}`,
              `/api/food/${itemId}`,
              `/api/item/${itemId}`
            ];

            for (const endpoint of endpoints) {
              try {
                const response = await fetch(endpoint);
                if (response.ok) {
                  const itemData = await response.json();
                  console.log(`✅ Fetched item ${itemId}:`, itemData.name);
                  return itemData;
                }
              } catch (err) {
                continue; // Try next endpoint
              }
            }
            console.warn(`❌ Could not fetch item ${itemId}`);
            return null;
          } catch (error) {
            console.error(`Error fetching item ${itemId}:`, error);
            return null;
          }
        });

        const allItems = await Promise.all(itemPromises);
        const validItems = allItems.filter(item => item !== null);
        
        console.log('✅ Successfully fetched items:', validItems.length);
        console.log('🍕 Items data:', validItems);

        // Dispatch to store
        dispatch({ type: 'SET_ITEMS_IN_MY_CITY', payload: validItems });
        
      } catch (error) {
        console.error('❌ Error fetching food items:', error);
        setError('Failed to load food items. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (shopInMyCity && shopInMyCity.length > 0) {
      console.log('🟡 Shops available, fetching items...');
      fetchFoodItems();
    } else {
      console.log('🟡 No shops available yet');
    }
  }, [shopInMyCity, dispatch]);

  // If you're still having issues, try this SIMPLE version:
  const fetchSimple = async () => {
    try {
      // Test if ANY items endpoint works
      const testResponse = await fetch('https://pradeepfooddelivery-backend-wam8.onrender.com/api/items');
      if (testResponse.ok) {
        const items = await testResponse.json();
        dispatch({ type: 'SET_ITEMS_IN_MY_CITY', payload: items });
      } else {
        console.log('❌ /api/items also failed');
      }
    } catch (err) {
      console.log('❌ All endpoints failed');
    }
  };

  // Debug info
  console.log('🔍 CURRENT STATE:', {
    shops: shopInMyCity?.length || 0,
    items: itemsInMyCity?.length || 0,
    loading,
    error
  });

  return (
    <div className="p-4">
      {/* Debug Info */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>Debug Info:</strong> Shops: {shopInMyCity?.length || 0} | 
          Items: {itemsInMyCity?.length || 0} |
          Loading: {loading ? 'Yes' : 'No'}
        </div>
        {error && (
          <div className="text-red-600 text-sm mt-2">
            Error: {error}
          </div>
        )}
      </div>

      {/* Manual Refresh Button */}
      <button 
        onClick={() => window.location.reload()}
        className="mb-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
      >
        Refresh Page
      </button>

      {/* Food Items Grid */}
      {loading && (
        <div className="text-center py-8">
          <div className="text-lg">Loading food items...</div>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-8">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-4 justify-center">
        {itemsInMyCity && itemsInMyCity.length > 0 ? (
          itemsInMyCity.map(item => (
            <FoodCard key={item._id} data={item} />
          ))
        ) : (
          !loading && (
            <div className="text-center w-full py-8">
              <p className="text-gray-500 text-lg">
                {shopInMyCity?.length > 0 
                  ? 'No food items found in your area shops.' 
                  : 'No shops found in your area.'
                }
              </p>
              <div className="mt-4 text-sm text-gray-400">
                Check if your backend has the /api/items endpoint
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default FoodList;