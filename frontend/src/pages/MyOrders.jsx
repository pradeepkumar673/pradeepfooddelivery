// MyOrders.jsx
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import UserOrderCard from '../components/UserOrderCard';
import OwnerOrderCard from '../components/OwnerOrderCard';
import ErrorBoundary from '../components/ErrorBoundary';
import { setMyOrders, updateRealtimeOrderStatus } from '../redux/userSlice';

function MyOrders() {
  const { userData, myOrders, socket } = useSelector(state => state.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    const handleNewOrder = (data) => {
      if (data.shopOrders?.owner._id === userData._id) {
        dispatch(setMyOrders(prevOrders => [data, ...prevOrders]))
      }
    }

    const handleStatusUpdate = ({ orderId, shopId, status, userId }) => {
      if (userId === userData._id) {
        dispatch(updateRealtimeOrderStatus({ orderId, shopId, status }))
      }
    }

    socket?.on('newOrder', handleNewOrder)
    socket?.on('update-status', handleStatusUpdate)

    return () => {
      socket?.off('newOrder', handleNewOrder)
      socket?.off('update-status', handleStatusUpdate)
    }
  }, [socket, userData._id, dispatch])

  const renderOrderCard = (order, index) => {
    if (!order) return null;

    if (userData.role === "user") {
      return <UserOrderCard data={order} key={order._id || index} />;
    } else if (userData.role === "owner") {
      return (
        <ErrorBoundary key={order._id || index}>
          <OwnerOrderCard data={order} />
        </ErrorBoundary>
      );
    }
    return null;
  }

  return (
    <div className='w-full min-h-screen bg-[#FEFAE0] flex justify-center px-4'>
      <div className='w-full max-w-[800px] p-4'>
        <div className='flex items-center gap-[20px] mb-6'>
          <div className='z-[10]' onClick={() => navigate("/")}>
            <IoIosArrowRoundBack size={35} className='text-[#0A400C]' />
          </div>
          <h1 className='text-2xl font-bold text-start'>My Orders</h1>
        </div>

        <div className='space-y-4'>
          {myOrders?.map((order, index) => renderOrderCard(order, index))}
          
          {(!myOrders || myOrders.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              No orders found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyOrders