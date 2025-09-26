import React from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaUtensils } from "react-icons/fa";
import { useState } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import { setMyShopData } from '../redux/ownerSlice';
import { ClipLoader } from 'react-spinners';

function AddItem() {
    const navigate = useNavigate()
    const { myShopData } = useSelector(state => state.owner)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [price, setPrice] = useState("") // Changed to string for better handling
    const [expiry, setExpiry] = useState("")
    const [frontendImage, setFrontendImage] = useState(null)
    const [backendImage, setBackendImage] = useState(null)
    const [category, setCategory] = useState("")
    const [foodType, setFoodType] = useState("veg")
    const [error, setError] = useState("")
    
    const categories = ["Snacks", "Main Course", "Desserts", "Pizza", "Burgers", 
                       "Sandwiches", "South Indian", "North Indian", "Chinese", 
                       "Fast Food", "Others"]
    
    const dispatch = useDispatch()

    const handleImage = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Validate file type and size
            if (!file.type.startsWith('image/')) {
                setError("Please select a valid image file")
                return
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError("Image size should be less than 5MB")
                return
            }
            setBackendImage(file)
            setFrontendImage(URL.createObjectURL(file))
            setError("")
        }
    }

    const validateForm = () => {
        if (!name.trim()) {
            setError("Food name is required")
            return false
        }
        if (!price || parseFloat(price) <= 0) {
            setError("Valid price is required")
            return false
        }
        if (!category) {
            setError("Please select a category")
            return false
        }
        if (!expiry) {
            setError("Expiry time is required")
            return false
        }
        if (!backendImage) {
            setError("Food image is required")
            return false
        }
        setError("")
        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }

        setLoading(true)
        setError("")
        
        try {
            const formData = new FormData()
            formData.append("name", name.trim())
            formData.append("category", category)
            formData.append("expiry", expiry)
            formData.append("foodType", foodType)
            formData.append("price", parseFloat(price)) // Ensure it's a number
            
            if (backendImage) {
                formData.append("image", backendImage)
            }

            // Log the form data for debugging
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value)
            }

            const result = await axios.post(`${serverUrl}/api/item/add-item`, formData, { 
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            
            dispatch(setMyShopData(result.data))
            setLoading(false)
            navigate("/")
            
        } catch (error) {
            setLoading(false)
            console.log("Full error:", error)
            
            if (error.response) {
                // Server responded with error
                console.log("Status:", error.response.status)
                console.log("Response data:", error.response.data)
                
                if (error.response.status === 400) {
                    // Handle validation errors from server
                    const errorData = error.response.data
                    if (errorData.message) {
                        setError(errorData.message)
                    } else if (errorData.errors) {
                        // If there are multiple validation errors
                        const errorMessages = Object.values(errorData.errors).join(', ')
                        setError(errorMessages)
                    } else {
                        setError("Invalid request. Please check your input.")
                    }
                } else if (error.response.status === 401) {
                    setError("Please login again")
                    navigate("/login")
                } else if (error.response.status === 413) {
                    setError("Image file is too large")
                } else {
                    setError("Something went wrong. Please try again.")
                }
            } else if (error.request) {
                // Network error
                console.log("Network error:", error.request)
                setError("Network error. Please check your connection.")
            } else {
                // Other errors
                console.log("Error:", error.message)
                setError("An error occurred. Please try again.")
            }
        }
    }

    return (
        <div className='flex justify-center flex-col items-center p-6 bg-gradient-to-br from-orange-50 relative to-white min-h-screen'>
            <div className='absolute top-[20px] left-[20px] z-[10] mb-[10px] cursor-pointer' onClick={() => navigate("/")}>
                <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
            </div>

            <div className='max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100'>
                <div className='flex flex-col items-center mb-6'>
                    <div className='bg-orange-100 p-4 rounded-full mb-4'>
                        <FaUtensils className='text-[#ff4d2d] w-16 h-16' />
                    </div>
                    <div className="text-3xl font-extrabold text-gray-900">
                        Add Food
                    </div>
                </div>
                
                {/* Error Message */}
                {error && (
                    <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg'>
                        {error}
                    </div>
                )}
                
                <form className='space-y-5' onSubmit={handleSubmit}>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Name *</label>
                        <input 
                            type="text" 
                            placeholder='Enter Food Name' 
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            required
                        />
                    </div>
                    
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Food Image *</label>
                        <input 
                            type="file" 
                            accept='image/*' 
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500' 
                            onChange={handleImage} 
                            required
                        />
                        {frontendImage && (
                            <div className='mt-4'>
                                <img src={frontendImage} alt="Preview" className='w-full h-48 object-cover rounded-lg border' />
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Price *</label>
                        <input 
                            type="number" 
                            placeholder='0' 
                            min="0"
                            step="0.01"
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                            onChange={(e) => setPrice(e.target.value)}
                            value={price}
                            required
                        />
                    </div>
                    
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Expiry Time *</label>
                        <input 
                            type="time" 
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                            onChange={(e) => setExpiry(e.target.value)}
                            value={expiry}
                            required
                        />
                    </div>
                    
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Select Category *</label>
                        <select 
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                            onChange={(e) => setCategory(e.target.value)}
                            value={category}
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map((cate, index) => (
                                <option value={cate} key={index}>{cate}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Select Food Type</label>
                        <select 
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                            onChange={(e) => setFoodType(e.target.value)}
                            value={foodType}
                        >
                            <option value="veg">Veg</option>
                            <option value="non veg">Non Veg</option>
                        </select>
                    </div>

                    <button 
                        type="submit"
                        className='w-full bg-[#ff4d2d] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                        disabled={loading}
                    >
                        {loading ? <ClipLoader size={20} color='white' /> : "Save"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default AddItem