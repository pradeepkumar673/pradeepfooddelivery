import React, { useEffect, useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { IoLocationSharp } from "react-icons/io5";
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import L from 'leaflet';
import "leaflet/dist/leaflet.css"
import { setAddress, setLocation } from '../redux/mapSlice';
import { MdDeliveryDining } from "react-icons/md";
import { FaCreditCard } from "react-icons/fa";
import axios from 'axios';
import { FaMobileScreenButton } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { addMyOrder, setTotalAmount } from '../redux/userSlice';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function RecenterMap({ location }) {
  const map = useMap()
  
  useEffect(() => {
    if (location?.lat && location?.lon) {
      map.setView([location.lat, location.lon], 16, { animate: true })
    }
  }, [location?.lat, location?.lon, map])
  
  return null
}

function CheckOut() {
  const { location, address } = useSelector(state => state.map)
  const { cartItems, totalAmount, userData } = useSelector(state => state.user)
  const [addressInput, setAddressInput] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const apiKey = import.meta.env.VITE_GEOAPIKEY
  const deliveryFee = totalAmount > 500 ? 0 : 40
  const AmountWithDeliveryFee = totalAmount + deliveryFee

  // Default location (Chennai)
  const defaultLocation = { lat: 13.0827, lon: 80.2707 };
  const mapCenter = [
    location?.lat || defaultLocation.lat,
    location?.lon || defaultLocation.lon
  ];

  const onDragEnd = (e) => {
    if (!e.target?._latlng) return;
    const { lat, lng } = e.target._latlng
    dispatch(setLocation({ lat, lon: lng }))
    getAddressByLatLng(lat, lng)
  }

  const getCurrentLocation = () => {
    if (!userData?.location?.coordinates) {
      console.error('User location not available');
      return;
    }
    const latitude = userData.location.coordinates[1]
    const longitude = userData.location.coordinates[0]
    dispatch(setLocation({ lat: latitude, lon: longitude }))
    getAddressByLatLng(latitude, longitude)
  }

  const getAddressByLatLng = async (lat, lng) => {
    try {
      const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`)
      if (result?.data?.results?.[0]?.address_line2) {
        dispatch(setAddress(result.data.results[0].address_line2))
      }
    } catch (error) {
      console.error('Error fetching address:', error)
    }
  }

  const getLatLngByAddress = async () => {
    if (!addressInput.trim()) return;
    
    try {
      const result = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apiKey}`)
      if (result?.data?.features?.[0]?.properties) {
        const { lat, lon } = result.data.features[0].properties
        dispatch(setLocation({ lat, lon }))
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error)
    }
  }

  const handlePlaceOrder = async () => {
    if (!addressInput.trim()) {
      alert('Please enter a delivery address');
      return;
    }

    try {
      const result = await axios.post(`${serverUrl}/api/order/place-order`, {
        paymentMethod,
        deliveryAddress: {
          text: addressInput,
          latitude: location?.lat || defaultLocation.lat,
          longitude: location?.lon || defaultLocation.lon
        },
        totalAmount: AmountWithDeliveryFee,
        cartItems
      }, { withCredentials: true })

      if (paymentMethod === "cod") {
        dispatch(addMyOrder(result.data))
        navigate("/order-placed")
      } else {
        const orderId = result.data.orderId
        const razorOrder = result.data.razorOrder
        openRazorpayWindow(orderId, razorOrder)
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order. Please try again.')
    }
  }

  const openRazorpayWindow = (orderId, razorOrder) => {
    if (!window.Razorpay) {
      console.error('Razorpay SDK not loaded');
      alert('Payment gateway not available. Please try again.');
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorOrder.amount,
      currency: 'INR',
      name: "PradeepKumar",
      description: "Food Delivery Website",
      order_id: razorOrder.id,
      handler: async function (response) {
        try {
          const result = await axios.post(`${serverUrl}/api/order/verify-payment`, {
            razorpay_payment_id: response.razorpay_payment_id,
            orderId
          }, { withCredentials: true })
          dispatch(addMyOrder(result.data))
          navigate("/order-placed")
        } catch (error) {
          console.error('Payment verification failed:', error)
          alert('Payment verification failed. Please contact support.')
        }
      },
      modal: {
        ondismiss: function() {
          console.log('Payment cancelled by user');
        }
      }
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  useEffect(() => {
    if (address) {
      setAddressInput(address)
    }
  }, [address])

  return (
    <div className='min-h-screen bg-[#fff9f6] flex items-center justify-center p-6'>
      <div className='absolute top-[20px] left-[20px] z-[10] cursor-pointer' onClick={() => navigate("/")}>
        <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
      </div>
      <div className='w-full max-w-[900px] bg-white rounded-2xl shadow-xl p-6 space-y-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Checkout</h1>

        <section>
          <h2 className='text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800'>
            <IoLocationSharp className='text-[#ff4d2d]' /> Delivery Location
          </h2>
          <div className='flex gap-2 mb-3'>
            <input 
              type="text" 
              className='flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]' 
              placeholder='Enter Your Delivery Address..' 
              value={addressInput} 
              onChange={(e) => setAddressInput(e.target.value)} 
            />
            <button 
              className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-3 py-2 rounded-lg flex items-center justify-center' 
              onClick={getLatLngByAddress}
            >
              <IoSearchOutline size={17} />
            </button>
            <button 
              className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center' 
              onClick={getCurrentLocation}
            >
              <TbCurrentLocation size={17} />
            </button>
          </div>
          <div className='rounded-xl border overflow-hidden'>
            <div className='h-64 w-full flex items-center justify-center'>
              <MapContainer
                className={"w-full h-full"}
                center={mapCenter}
                zoom={16}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap location={location} />
                <Marker 
                  position={mapCenter} 
                  draggable 
                  eventHandlers={{ dragend: onDragEnd }} 
                />
              </MapContainer>
            </div>
          </div>
        </section>

        <section>
          <h2 className='text-lg font-semibold mb-3 text-gray-800'>Payment Method</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div 
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition cursor-pointer ${
                paymentMethod === "cod" ? "border-[#ff4d2d] bg-orange-50 shadow" : "border-gray-200 hover:border-gray-300"
              }`} 
              onClick={() => setPaymentMethod("cod")}
            >
              <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100'>
                <MdDeliveryDining className='text-green-600 text-xl' />
              </span>
              <div>
                <p className='font-medium text-gray-800'>Cash On Delivery</p>
                <p className='text-xs text-gray-500'>Pay when your food arrives</p>
              </div>
            </div>
            <div 
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition cursor-pointer ${
                paymentMethod === "online" ? "border-[#ff4d2d] bg-orange-50 shadow" : "border-gray-200 hover:border-gray-300"
              }`} 
              onClick={() => setPaymentMethod("online")}
            >
              <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100'>
                <FaMobileScreenButton className='text-purple-700 text-lg' />
              </span>
              <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100'>
                <FaCreditCard className='text-blue-700 text-lg' />
              </span>
              <div>
                <p className='font-medium text-gray-800'>UPI / Credit / Debit Card</p>
                <p className='text-xs text-gray-500'>Pay Securely Online</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className='text-lg font-semibold mb-3 text-gray-800'>Order Summary</h2>
          <div className='rounded-xl border bg-gray-50 p-4 space-y-2'>
            {cartItems?.length > 0 ? (
              <>
                {cartItems.map((item, index) => (
                  <div key={index} className='flex justify-between text-sm text-gray-700'>
                    <span>{item.name} x {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <hr className='border-gray-200 my-2' />
                <div className='flex justify-between font-medium text-gray-800'>
                  <span>Subtotal</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className='flex justify-between text-gray-700'>
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
                </div>
                <div className='flex justify-between text-lg font-bold text-[#ff4d2d] pt-2'>
                  <span>Total</span>
                  <span>₹{AmountWithDeliveryFee}</span>
                </div>
              </>
            ) : (
              <p className='text-center text-gray-500'>No items in cart</p>
            )}
          </div>
        </section>
        <button 
          className='w-full bg-[#ff4d2d] hover:bg-[#e64526] text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed' 
          onClick={handlePlaceOrder}
          disabled={!cartItems?.length || !addressInput.trim()}
        >
          {paymentMethod === "cod" ? "Place Order" : "Pay & Place Order"}
        </button>
      </div>
    </div>
  )
}

export default CheckOut