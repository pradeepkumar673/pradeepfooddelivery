import React, { useState, useEffect } from 'react'
import Nav from './NaV.JSX'
import { useSelector } from 'react-redux'
import { FaUtensils, FaBell } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { FaPen } from "react-icons/fa";
import OwnerItemCard from './ownerItemCard';
import useGetMyShop from '../hooks/useGetMyShop';
import axios from 'axios';
import { serverUrl } from '../App';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
function OwnerDashboard() {
  const { myShopData } = useSelector(state => state.owner)
  const navigate = useNavigate()
  const getMyShop = useGetMyShop();
  const [notifying, setNotifying] = useState(false);
  const [earningsData, setEarningsData] = useState([]);

  useEffect(() => {
    if (myShopData) {
      const fetchEarnings = async () => {
        try {
          const response = await axios.get(`${serverUrl}/api/shop/daily-earnings?days=7`, { withCredentials: true });
          setEarningsData(response.data);
        } catch (error) {
          console.error('Error fetching earnings:', error);
        }
      };
      fetchEarnings();
    }
  }, [myShopData]);

  const handleNotifyUsers = async () => {
    if (!myShopData) return;
    setNotifying(true);
    try {
      const response = await axios.post(`${serverUrl}/api/item/notify-users`, {}, { withCredentials: true });
      alert(response.data.message);
    } catch (error) {
      console.error('Notification error:', error);
      alert('Failed to send notification. Please try again.');
    } finally {
      setNotifying(false);
    }
  };


  return (
    <div className='w-full min-h-screen bg-[#FEFAE0] flex flex-col items-center'>
      <Nav />
      {!myShopData &&
        <div className='flex justify-center items-center p-4 sm:p-6'>
          <div className='w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300'>
            <div className='flex flex-col items-center text-center'>
              <FaUtensils className='text-[#0A400C] w-16 h-16 sm:w-20 sm:h-20 mb-4' />
              <h2 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2'>Add Your Restaurant</h2>
              <p className='text-gray-600 mb-4 text-sm sm:text-base'>Join our food delivery platform and reach thousands of hungry customers every day.
              </p>
              <button className='bg-[#0A400C] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-[#819067] transition-colors duration-200' onClick={() => navigate("/create-edit-shop")}>
                Get Started
              </button>
            </div>
          </div>
        </div>
      }

      {myShopData &&
        <div className='w-full flex flex-col items-center gap-6 px-4 sm:px-6'>
          <h1 className='text-2xl sm:text-3xl text-gray-900 flex items-center gap-3 mt-8 text-center'><FaUtensils className='text-[#0A400C] w-14 h-14 ' />Welcome to {myShopData.name}</h1>

          <div className='bg-white shadow-lg rounded-xl overflow-hidden border border-[#B1AB86] hover:shadow-2xl transition-all duration-300 w-full max-w-3xl relative'>
            <div className='absolute top-4 right-4 bg-[#0A400C] text-white p-2 rounded-full shadow-md hover:bg-[#819067] transition-colors cursor-pointer' onClick={() => navigate("/create-edit-shop")}>
              <FaPen size={20} />
            </div>
            <img src={myShopData.image} alt={myShopData.name} className='w-full h-48 sm:h-64 object-cover' />
            <div className='p-4 sm:p-6'>
              <h1 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2'>{myShopData.name}</h1>
              <p className='text-gray-500 '>{myShopData.city},{myShopData.state}</p>
              <p className='text-gray-500 mb-4'>{myShopData.address}</p>
              <button
                onClick={handleNotifyUsers}
                disabled={notifying || !myShopData}
                className='flex items-center gap-2 bg-[#0A400C] text-white px-4 py-2 rounded-full font-medium shadow-md hover:bg-[#819067] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <FaBell size={16} />
                {notifying ? 'Notifying...' : 'Notify Users in City'}
              </button>
            </div>
          </div>

          {/* Daily Earnings Graph */}
          {myShopData && (
            <div className='w-full max-w-4xl bg-white shadow-lg rounded-xl p-6 border border-[#B1AB86] hover:shadow-2xl transition-all duration-300'>
              <h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'>
                <FaUtensils className='text-[#0A400C]' />
                Weekly Earnings Overview
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={earningsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#0A400C" fontSize={12} />
                  <YAxis stroke="#0A400C" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FEFAE0',
                      border: '1px solid #0A400C',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#0A400C' }}
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Earnings']}
                  />
                  <Legend />
                  <Bar
                    dataKey="earnings"
                    fill="#0A400C"
                    radius={[4, 4, 0, 0]}
                    background={{ fill: '#FEFAE0' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {myShopData.items.length == 0 &&
            <div className='flex justify-center items-center p-4 sm:p-6'>
              <div className='w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300'>
                <div className='flex flex-col items-center text-center'>
                  <FaUtensils className='text-[#0A400C] w-16 h-16 sm:w-20 sm:h-20 mb-4' />
                  <h2 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2'>Add Your Food Item</h2>
                  <p className='text-gray-600 mb-4 text-sm sm:text-base'>Share your delicious creations with our customers by adding them to the menu.
                  </p>
                  <button className='bg-[#0A400C] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-[#819067] transition-colors duration-200' onClick={() => navigate("/add-item")}>
                    Add Food
                  </button>
                </div>
              </div>
            </div>
          }

          {myShopData.items.length > 0 && <div className='flex flex-col items-center gap-4 w-full max-w-3xl '>
            {myShopData.items.map((item, index) => (
              <OwnerItemCard data={item} key={index} />
            ))}
          </div>}

        </div>}



    </div>
  )
}

export default OwnerDashboard
