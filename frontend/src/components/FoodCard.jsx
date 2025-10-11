import React, { useState } from 'react'
import { FaLeaf, FaDrumstickBite, FaStar, FaRegStar, FaMinus, FaPlus, FaShoppingCart } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/userSlice';

function FoodCard({ data }) {
  const [quantity, setQuantity] = useState(0)
  const dispatch = useDispatch()
  const { cartItems } = useSelector(state => state.user)

  const renderStars = (rating) => {
    const stars = [];
    const actualRating = rating || 0;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        (i <= actualRating) ? (
          <FaStar key={i} className='text-yellow-500 text-lg'/>
        ) : (
          <FaRegStar key={i} className='text-yellow-500 text-lg'/>
        )
      )
    }
    return stars
  }

  const handleIncrease = () => {
    const newQty = quantity + 1
    setQuantity(newQty)
  }

  const handleDecrease = () => {
    if (quantity > 0) {
      const newQty = quantity - 1
      setQuantity(newQty)
    }
  }

  const handleAddToCart = () => {
    if (quantity > 0 && data) {
      dispatch(addToCart({
        id: data._id,
        name: data.name || 'Unknown Item',
        price: data.price || 0,
        expiry: data.expiry || 'Soon',
        image: data.image || '',
        shop: data.shop || 'Unknown Shop',
        quantity: quantity,
        foodType: data.foodType || 'veg'
      }))
    }
  }

  // Safe data access with fallbacks
  const foodType = data?.foodType || 'veg'
  const rating = data?.rating?.average || data?.rating || 0
  const ratingCount = data?.rating?.count || 0
  const price = data?.price || 0
  const name = data?.name || 'Food Item'
  const image = data?.image || ''
  const expiry = data?.expiry || 'Soon'
  const shop = data?.shop || 'Unknown Shop'

  // Check if item is already in cart
  const isInCart = cartItems.some(item => item.id === data?._id)

  return (
    <div className='w-[250px] rounded-2xl border-2 border-[#ff4d2d] bg-white shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col'>
      <div className='relative w-full h-[170px] flex justify-center items-center bg-white'>
        <div className='absolute top-3 right-3 bg-white rounded-full p-1 shadow'>
          {foodType === "veg" ? 
            <FaLeaf className='text-green-600 text-lg'/> : 
            <FaDrumstickBite className='text-red-600 text-lg'/>
          }
        </div>

        <img 
          src={image} 
          alt={name} 
          className='w-full h-full object-cover transition-transform duration-300 hover:scale-105'
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/250x170/FF6B6B/FFFFFF?text=No+Image';
          }}
        />
      </div>

      <div className="flex-1 flex flex-col p-4">
        <h1 className='font-semibold text-gray-900 text-base truncate'>{name}</h1>

        <p className='text-xs text-gray-500 truncate'>
          {foodType === "veg" ? "(Veg)" : "(Non-Veg)"}
          <br/>
          Expires at {expiry}
        </p>

        <div className='flex items-center gap-1 mt-1'>
          {renderStars(rating)}
          <span className='text-xs text-gray-500'>
            {ratingCount}
          </span>
        </div>
      </div>

      <div className='flex items-center justify-between mt-auto p-3'>
        <span className='font-bold text-gray-900 text-lg'>
          ₹{price}
        </span>

        <div className='flex items-center border rounded-full overflow-hidden shadow-sm'>
          <button 
            className='px-2 py-1 hover:bg-gray-100 transition' 
            onClick={handleDecrease}
            disabled={quantity === 0}
          >
            <FaMinus size={12}/>
          </button>
          <span className='px-2 min-w-[20px] text-center'>{quantity}</span>
          <button 
            className='px-2 py-1 hover:bg-gray-100 transition' 
            onClick={handleIncrease}
          >
            <FaPlus size={12}/>
          </button>
          <button 
            className={`${isInCart ? "bg-gray-800" : "bg-[#ff4d2d]"} text-white px-3 py-2 transition-colors ${quantity === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90'}`}
            onClick={handleAddToCart}
            disabled={quantity === 0}
          >
            <FaShoppingCart size={16}/>
          </button>
        </div>
      </div>
    </div>
  )
}

export default FoodCard