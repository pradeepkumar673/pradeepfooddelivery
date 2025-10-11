import React, { useState } from 'react'
import { FaLeaf, FaDrumstickBite, FaStar, FaRegStar, FaMinus, FaPlus, FaShoppingCart } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/userSlice';

function FoodCard({ data }) {
  const [quantity, setQuantity] = useState(0);
  const dispatch = useDispatch();
  
  // SAFELY get cartItems from Redu
  const cartItems = useSelector(state => state.user?.cartItems || []);
  
  const renderStars = (rating) => {
    const stars = [];
    const actualRating = rating || 0;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        (i <= actualRating) ? (
          <FaStar key={i} className='text-yellow-500 lg:text-lg text-sm'/>
        ) : (
          <FaRegStar key={i} className='text-yellow-500 lg:text-lg text-sm'/>
        )
      );
    }
    return stars;
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 0) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (quantity > 0 && data) {
      dispatch(addToCart({
        id: data._id,
        name: data.name,
        price: data.price,
        expiry: data.expiry,
        image: data.image,
        shop: data.shop,
        quantity: quantity,
        foodType: data.foodType
      }));
    }
  };

  // Check if item is already in cart
  const isInCart = cartItems.some(item => item.id === data?._id);

  return (
    <div className='lg:w-[250px] w-[160px] rounded-2xl border-2 border-[#008e39] bg-white shadow-xl overflow-hidden hover:shadow-xl transform hover:scale-95 transition-all duration-300 flex flex-col'>
      {/* Image Section */}
      <div className='relative w-full lg:h-[170px] h-[100px] flex justify-center items-center bg-white'>
        <div className='absolute top-3 right-3 bg-white rounded-full p-1 shadow'>
          {data.foodType === "veg" ? 
            <FaLeaf className='text-green-600 lg:text-lg text-sm'/> : 
            <FaDrumstickBite className='text-red-600 lg:text-lg text-sm'/>
          }
        </div>
        <img 
          src={data.image} 
          alt={data.name} 
          className='w-full h-full object-cover transition-transform duration-300 hover:scale-105'
        />
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col lg:p-4 p-2">
        <h1 className='font-semibold text-gray-900 lg:text-base text-sm truncate'>{data.name}</h1>
        
        <p className='lg:text-xs text-[10px] text-gray-500 truncate'>
          {data.foodType === "veg" ? "(Veg)" : "(Non-Veg)"}
          <br/>
          Expires at {data.expiry}
        </p>

        <div className='flex items-center gap-1 mt-1'>
          {renderStars(data.rating?.average || 0)}
          <span className='lg:text-xs text-[10px] text-gray-500'>
            {data.rating?.count || 0}
          </span>
        </div>
      </div>

      {/* Footer Section */}
      <div className='flex items-center justify-between mt-auto lg:p-3 p-2'>
        <span className='font-bold text-gray-900 lg:text-lg text-sm'>
          ₹{data.price}
        </span>

        <div className='flex items-center border rounded-full overflow-hidden shadow-sm'>
          <button 
            className='lg:px-2 px-1 py-1 hover:bg-gray-100 transition' 
            onClick={handleDecrease}
          >
            <FaMinus className='lg:w-3 w-2'/>
          </button>
          <span className='lg:px-2 px-1 min-w-[20px] text-center lg:text-base text-sm'>{quantity}</span>
          <button 
            className='lg:px-2 px-1 py-1 hover:bg-gray-100 transition' 
            onClick={handleIncrease}
          >
            <FaPlus className='lg:w-3 w-2'/>
          </button>
          <button 
            className={`${isInCart ? "bg-gray-800" : "bg-[#ff4d2d]"} text-white lg:px-3 px-2 lg:py-2 py-1 transition-colors`}
            onClick={handleAddToCart}
          >
            <FaShoppingCart className='lg:w-4 w-3'/>
          </button>
        </div>
      </div>
    </div>
  );
}

export default FoodCard;
