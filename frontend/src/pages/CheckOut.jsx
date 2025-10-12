import React, { useEffect, useState } from 'react';
import { IoIosArrowRoundBack } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { IoLocationSharp } from "react-icons/io5";
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import "leaflet/dist/leaflet.css";
import { setAddress, setLocation } from '../redux/mapSlice';
import { MdDeliveryDining } from "react-icons/md";
import { FaMobileScreenButton, FaCreditCard } from "react-icons/fa6";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { addMyOrder, setTotalAmount } from '../redux/userSlice';
import ErrorBoundary from '../components/ErrorBoundary'; // Ensure this import is valid

function RecenterMap({ location }) {
  if (location?.lat && location?.lon) {
    const map = useMap();
    map.setView([location.lat, location.lon], 16, { animate: true });
  }
  return null;
}

export default function CheckOut() {
  const { location: mapLocation, address } = useSelector(state => state.map);
  const { cartItems = [], totalAmount, userData } = useSelector(state => state.user);
  const [addressInput, setAddressInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiKey = import.meta.env.VITE_GEOAPIKEY;
  const deliveryFee = totalAmount > 500 ? 0 : 40;
  const AmountWithDeliveryFee = totalAmount + deliveryFee;
  const [mapCenter, setMapCenter] = useState([24.4539, 54.3773]); // Default to Abu Dhabi coordinates

  useEffect(() => {
    if (mapLocation?.lat && mapLocation?.lon) {
      setMapCenter([mapLocation.lat, mapLocation.lon]);
    }
  }, [mapLocation]);

  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng;
    dispatch(setLocation({ lat, lon: lng }));
    getAddressByLatLng(lat, lng);
  };

  const getCurrentLocation = () => {
    if (!userData || !userData.location?.coordinates || userData.location.coordinates.length !== 2) {
      alert("Please set your location or ensure it's stored correctly.");
      return;
    }

    const [longitude, latitude] = userData.location.coordinates; // GeoJSON is [lon, lat]
    dispatch(setLocation({ lat: latitude, lon: longitude }));
    setMapCenter([latitude, longitude]);
    getAddressByLatLng(latitude, longitude);
  };

  const getLatLngByAddress = async () => {
    const trimmedAddress = addressInput.trim();
    if (!trimmedAddress) {
      alert("Please enter a delivery address.");
      return;
    }

    try {
      const result = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(trimmedAddress)}&apiKey=${apiKey}`);
      if (!result.data?.features?.length) {
        alert("No results found for the provided address.");
        return;
      }

      const { lat, lon } = result.data.features[0].properties;
      if (typeof lat !== 'number' || typeof lon !== 'number') {
        alert("Error parsing coordinates from address.");
        return;
      }

      dispatch(setLocation({ lat, lon }));
      setMapCenter([lat, lon]);
    } catch (error) {
      console.error(`Error fetching coordinates: ${error.message}`);
      alert("Error fetching coordinates. Please try again.");
    }
  };

  const handlePlaceOrder = async () => {
    if (!addressInput.trim()) {
      alert("Please enter a delivery address.");
      return;
    }

    try {
      const result = await axios.post(`${serverUrl}/api/order/place-order`, {
        paymentMethod,
        deliveryAddress: {
          text: addressInput.trim(),
          latitude: mapLocation?.lat,
          longitude: mapLocation?.lon
        },
        totalAmount: AmountWithDeliveryFee,
        cartItems
      }, { withCredentials: true });

      if (paymentMethod === "cod") {
        dispatch(addMyOrder(result.data));
        navigate("/order-placed");
      } else {
        const orderId = result.data.orderId;
        const razorOrder = result.data.razorOrder;
        openRazorpayWindow(orderId, razorOrder);
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to place order. Please try again.";
      alert(message);
    }
  };

  const openRazorpayWindow = (orderId, razorOrder) => {
    if (!window.Razorpay) {
      alert("Payment gateway is unavailable. Please try again later.");
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorOrder.amount,
      currency: 'INR',
      name: "PradeepKumar",
      description: "Meal Rescue Food Delivery",
      order_id: razorOrder.id,
      handler: async (response) => {
        try {
          await axios.post(`${serverUrl}/api/order/verify-payment`, {
            razorpay_payment_id: response.razorpay_payment_id,
            orderId
          }, { withCredentials: true });

          dispatch(addMyOrder(response));
          navigate("/order-placed");
        } catch (error) {
          console.error(`Payment verification error: ${error.message}`);
          alert("Payment verification failed. Please try again.");
        }
      }
    };

    new window.Razorpay(options).open();
  };

  useEffect(() => {
    if (address) {
      setAddressInput(address);
    }
  }, [address]);

  return (
    <ErrorBoundary> {/* Wrap the entire component in an Error Boundary */}
      <div className='min-h-screen bg-[#fff9f6] flex items-center justify-center p-6'>
        <div onClick={() => navigate("/")} className='absolute top-[20px] left-[20px] z-[10]'>
          <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
        </div>
        <div className='w-full max-w-[900px] bg-white rounded-2xl shadow-xl p-6 space-y-6'>
          <h1 className='text-2xl font-bold text-gray-800'>Checkout</h1>
          <section>
            {/* ... Your existing Delivery Location section ... */}
            <div className='rounded-xl border overflow-hidden'>
              <div className='h-64 w-full flex items-center justify-center'>
                {/* Ensure mapCenter is correctly passed */}
                <MapContainer
                  className={"w-full h-full"}
                  center={mapCenter}
                  zoom={16}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <RecenterMap location={mapLocation} />
                  <Marker position={mapLocation?.lat && mapLocation?.lon ? [mapLocation.lat, mapLocation.lon] : undefined} draggable eventHandlers={{ dragend: onDragEnd }} />
                </MapContainer>
              </div>
            </div>
          </section>
          {/* ... Your existing Payment Method and Order Summary sections ... */}
          <section>
            <button className='w-full bg-[#ff4d2d] hover:bg-[#e64526] text-white py-3 rounded-xl font-semibold' onClick={handlePlaceOrder}> 
              {paymentMethod === "cod" ? "Place Order" : "Pay & Place Order"}
            </button>
          </section>
        </div>
      </div>
    </ErrorBoundary>
  );
}