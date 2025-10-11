// useGetMyShop.jsx - Enhanced version
import { useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setMyShopData } from '../redux/ownerSlice'

function useGetMyshop() {
  const dispatch = useDispatch()
  const { userData } = useSelector(state => state.user)

  useEffect(() => {
    const fetchShop = async () => {
      // Only fetch if user is an owner
      if (!userData || userData.role !== "owner") {
        console.log('🔄 Skipping shop fetch - user is not an owner');
        return;
      }

      try {
        console.log('🔄 Fetching shop data for owner:', userData._id);
        
        const result = await axios.get(`${serverUrl}/api/shop/get-my`, { 
          withCredentials: true 
        })
        
        console.log('✅ Shop data received:', result.data);
        dispatch(setMyShopData(result.data))
        
      } catch (error) {
        console.error('❌ Error fetching shop:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        
        // Don't set null on error to avoid clearing existing data
        if (error.response?.status === 404) {
          console.log('No shop found for this user');
          // This is normal - user hasn't created a shop yet
        }
      }
    }

    fetchShop()
  }, [userData, dispatch])
}

export default useGetMyshop