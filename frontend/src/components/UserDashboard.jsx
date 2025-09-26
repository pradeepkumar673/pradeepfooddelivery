import React, { useEffect, useRef, useState } from 'react'
import Nav from './NaV.JSX'
import { categories } from '../category'
import CategoryCard from './CategoryCard'
import { FaCircleChevronLeft } from "react-icons/fa6";
import { FaCircleChevronRight } from "react-icons/fa6";
import { FaMapMarkerAlt, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import { useSelector, useDispatch } from 'react-redux';
import FoodCard from './FoodCard';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import { setCurrentCity } from '../redux/userSlice';

function UserDashboard() {
  const { currentCity, shopInMyCity, itemsInMyCity, searchItems } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const cateScrollRef = useRef()
  const shopScrollRef = useRef()
  const navigate = useNavigate()
  const [showLeftCateButton, setShowLeftCateButton] = useState(false)
  const [showRightCateButton, setShowRightCateButton] = useState(false)
  const [showLeftShopButton, setShowLeftShopButton] = useState(false)
  const [showRightShopButton, setShowRightShopButton] = useState(false)
  const [updatedItemsList, setUpdatedItemsList] = useState([])
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [locationInput, setLocationInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAutoDetecting, setIsAutoDetecting] = useState(false)
  const [isEditingLocation, setIsEditingLocation] = useState(false)
  const [tempLocation, setTempLocation] = useState('')

  // Check if location is set on component mount
  useEffect(() => {
    if (!currentCity) {
      setShowLocationModal(true)
      const timer = setTimeout(() => {
        autoDetectLocation()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [currentCity])

  const autoDetectLocation = async () => {
    setIsAutoDetecting(true)
    try {
      const response = await axios.get('https://ipapi.co/json/')
      const { city, country } = response.data
      
      if (city) {
        dispatch(setCurrentCity(city))
        setShowLocationModal(false)
      }
    } catch (error) {
      console.error('Error auto-detecting location:', error)
    } finally {
      setIsAutoDetecting(false)
    }
  }

  const handleFilterByCategory = (category) => {
    if (category == "All") {
      setUpdatedItemsList(itemsInMyCity)
    } else {
      const filteredList = itemsInMyCity?.filter(i => i.category === category)
      setUpdatedItemsList(filteredList)
    }
  }

  useEffect(() => {
    setUpdatedItemsList(itemsInMyCity)
  }, [itemsInMyCity])

  const updateButton = (ref, setLeftButton, setRightButton) => {
    const element = ref.current
    if (element) {
      setLeftButton(element.scrollLeft > 0)
      setRightButton(element.scrollLeft + element.clientWidth < element.scrollWidth)
    }
  }

  const scrollHandler = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction == "left" ? -200 : 200,
        behavior: "smooth"
      })
    }
  }

  const handleLocationSubmit = async (e) => {
    e.preventDefault()
    if (!locationInput.trim()) return

    setIsLoading(true)
    try {
      dispatch(setCurrentCity(locationInput.trim()))
      setShowLocationModal(false)
      setLocationInput('')
    } catch (error) {
      console.error('Error setting location:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditLocation = () => {
    setLocationInput(currentCity || '')
    setShowLocationModal(true)
  }

  const handleLocationIconClick = () => {
    if (!currentCity) {
      setShowLocationModal(true)
      return
    }
    
    setIsEditingLocation(true)
    setTempLocation(currentCity)
  }

  const handleLocationSave = () => {
    if (tempLocation.trim()) {
      dispatch(setCurrentCity(tempLocation.trim()))
    }
    setIsEditingLocation(false)
    setTempLocation('')
  }

  const handleLocationCancel = () => {
    setIsEditingLocation(false)
    setTempLocation('')
  }

  const handleLocationInputChange = (e) => {
    setTempLocation(e.target.value)
  }

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsAutoDetecting(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords
            const response = await axios.get(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            )
            const city = response.data.city
            if (city) {
              dispatch(setCurrentCity(city))
              setShowLocationModal(false)
              if (isEditingLocation) {
                setIsEditingLocation(false)
              }
            }
          } catch (error) {
            console.error('Error getting location from coordinates:', error)
            autoDetectLocation()
          } finally {
            setIsAutoDetecting(false)
          }
        },
        (error) => {
          console.error('Error getting current location:', error)
          autoDetectLocation()
        }
      )
    } else {
      autoDetectLocation()
    }
  }

  useEffect(() => {
    if (cateScrollRef.current) {
      updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
      updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
      cateScrollRef.current.addEventListener('scroll', () => {
        updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
      })
      shopScrollRef.current.addEventListener('scroll', () => {
        updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
      })
    }

    return () => {
      cateScrollRef?.current?.removeEventListener("scroll", () => {
        updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
      })
      shopScrollRef?.current?.removeEventListener("scroll", () => {
        updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
      })
    }
  }, [categories])

  return (
    <div className='w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto'>
      <Nav />
      
      {/* Location Header - Interactive Icon */}
      <div className="w-full max-w-6xl flex justify-between items-center p-4">
        <div></div> {/* Spacer for alignment */}
        
        <div className="flex items-center gap-3">
          {isEditingLocation ? (
            <div className="flex items-center gap-2 bg-white border border-[#ff4d2d] rounded-full px-4 py-2 shadow-md">
              <FaMapMarkerAlt className="text-[#ff4d2d]" />
              <input
                type="text"
                value={tempLocation}
                onChange={handleLocationInputChange}
                className="outline-none bg-transparent text-gray-700 min-w-[120px]"
                placeholder="Enter city"
                autoFocus
              />
              <div className="flex gap-1">
                <button 
                  onClick={handleLocationSave}
                  className="text-green-500 hover:text-green-600 p-1"
                  disabled={!tempLocation.trim()}
                >
                  <FaCheck />
                </button>
                <button 
                  onClick={handleLocationCancel}
                  className="text-red-500 hover:text-red-600 p-1"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={handleLocationIconClick}
              className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow group"
            >
              <div className="relative">
                <FaMapMarkerAlt className="text-[#ff4d2d] group-hover:scale-110 transition-transform" />
                <FaEdit className="absolute -top-1 -right-1 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="font-medium">{currentCity || 'Set Location'}</span>
              <span className="text-blue-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Edit
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <FaMapMarkerAlt className="text-[#ff4d2d] text-2xl" />
              <h2 className="text-2xl font-bold">Set Your Location</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              {isAutoDetecting 
                ? "Detecting your location..." 
                : "Please set your location to see relevant shops and food items"}
            </p>
            
            <form onSubmit={handleLocationSubmit} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="Enter your city"
                  className="w-full p-3 border border-gray-300 rounded-lg mb-3 pl-10"
                  disabled={isAutoDetecting}
                />
                <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button
                type="submit"
                disabled={!locationInput.trim() || isLoading}
                className="w-full bg-[#ff4d2d] text-white p-3 rounded-lg hover:bg-[#e64528] disabled:bg-gray-300 transition-colors"
              >
                {isLoading ? 'Setting Location...' : 'Set Location'}
              </button>
            </form>

            <div className="flex gap-3">
              <button
                onClick={handleUseCurrentLocation}
                disabled={isAutoDetecting}
                className="flex-1 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2"
              >
                <FaMapMarkerAlt />
                {isAutoDetecting ? 'Detecting...' : 'Current Location'}
              </button>
              
              {isAutoDetecting && (
                <button
                  onClick={() => setIsAutoDetecting(false)}
                  className="flex-1 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {searchItems && searchItems.length > 0 && (
        <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-5 bg-white shadow-md rounded-2xl mt-4'>
          <h1 className='text-gray-900 text-2xl sm:text-3xl font-semibold border-b border-gray-200 pb-2'>
            Search Results
          </h1>
          <div className='w-full h-auto flex flex-wrap gap-6 justify-center'>
            {searchItems.map((item) => (
              <FoodCard data={item} key={item._id} />
            ))}
          </div>
        </div>
      )}

      {/* Show content only if location is set */}
      {currentCity ? (
        <>
          <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
            <h1 className='text-gray-800 text-2xl sm:text-3xl'>Inspiration for your first order</h1>
            <div className='w-full relative'>
              {showLeftCateButton && <button className='absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10' onClick={() => scrollHandler(cateScrollRef, "left")}><FaCircleChevronLeft />
              </button>}

              <div className='w-full flex overflow-x-auto gap-4 pb-2 ' ref={cateScrollRef}>
                {categories.map((cate, index) => (
                  <CategoryCard name={cate.category} image={cate.image} key={index} onClick={() => handleFilterByCategory(cate.category)} />
                ))}
              </div>
              {showRightCateButton && <button className='absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10' onClick={() => scrollHandler(cateScrollRef, "right")}>
                <FaCircleChevronRight />
              </button>}
            </div>
          </div>

          <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]'>
            <h1 className='text-gray-800 text-2xl sm:text-3xl'>Best Shop in {currentCity}</h1>
            <div className='w-full relative'>
              {showLeftShopButton && <button className='absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10' onClick={() => scrollHandler(shopScrollRef, "left")}><FaCircleChevronLeft />
              </button>}

              <div className='w-full flex overflow-x-auto gap-4 pb-2 ' ref={shopScrollRef}>
                {shopInMyCity?.map((shop, index) => (
                  <CategoryCard name={shop.name} image={shop.image} key={index} onClick={() => navigate(`/shop/${shop._id}`)} />
                ))}
              </div>
              {showRightShopButton && <button className='absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10' onClick={() => scrollHandler(shopScrollRef, "right")}>
                <FaCircleChevronRight />
              </button>}
            </div>
          </div>

          <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]'>
            <h1 className='text-gray-800 text-2xl sm:text-3xl'>
              Suggested Food Items in {currentCity}
            </h1>

            <div className='w-full h-auto flex flex-wrap gap-[20px] justify-center'>
              {updatedItemsList?.map((item, index) => (
                <FoodCard key={index} data={item} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="w-full max-w-6xl flex flex-col items-center justify-center py-20">
          <div className="text-center">
            <div className="text-4xl mb-4">📍</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              {isAutoDetecting ? "Detecting your location..." : "Please set your location"}
            </h2>
            <p className="text-gray-500">
              {isAutoDetecting 
                ? "We're finding the best shops near you..." 
                : "Set your location to discover amazing food options"}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserDashboard