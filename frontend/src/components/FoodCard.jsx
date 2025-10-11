import React, { useState } from 'react'
import { FaLeaf, FaDrumstickBite, FaStar, FaRegStar, FaMinus, FaPlus, FaShoppingCart } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/userSlice';

function FoodCard({ data }) {
  const [quantity, setQuantity] = useState(0);
  const dispatch = useDispatch();

  // SAFELY get cartItems from Redux
  const cartItems = useSelector(state => state.user?.cartItems || []);

  const renderStars = (rating) => {
    const stars = [];
    const actualRating = rating || 0;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        (i <= actualRating) ? (
          <FaStar key={i} className='text-yellow-500 text-lg' />
        ) : (
          <FaRegStar key={i} className='text-yellow-500 text-lg' />
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
    <div className='w-full max-w-[160px] sm:max-w-[180px] rounded-xl border border-[#008e39] bg-white shadow-md overflow-hidden hover:shadow-lg transform hover:scale-102 transition-all duration-300 flex flex-col'>
      {/* Image Section */}
      <div className='relative w-full h-[100px] sm:h-[120px] flex justify-center items-center bg-white'>
        <div className='absolute top-1.5 right-1.5 bg-white rounded-full p-0.5 shadow'>
          {data.foodType === "veg" ?
            <FaLeaf className='text-green-600 text-xs sm:text-sm' /> :
            <FaDrumstickBite className='text-red-600 text-xs sm:text-sm' />
          }
        </div>
        <img
          src={data.image}
          alt={data.name}
          className='w-full h-full object-cover transition-transform duration-300 hover:scale-105'
        />
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col p-2 sm:p-3">
        <h1 className='font-semibold text-gray-900 text-xs sm:text-sm truncate'>{data.name}</h1>

        <p className='text-[10px] sm:text-xs text-gray-500 truncate mt-0.5'>
          {data.foodType === "veg" ? "(Veg)" : "(Non-Veg)"}
          <br />
          Expires at {data.expiry}
        </p>

        <div className='flex items-center gap-0.5 sm:gap-1 mt-0.5 sm:mt-1'>
          {renderStars(data.rating?.average || 0)}
          <span className='text-[10px] sm:text-xs text-gray-500'>
            {data.rating?.count || 0}
          </span>
        </div>
      </div>

      {/* Footer Section */}
      <div className='flex items-center justify-between mt-auto p-1.5 sm:p-2'>
        <span className='font-bold text-gray-900 text-sm sm:text-base'>
          ₹{data.price}
        </span>

        <div className='flex items-center border rounded-full overflow-hidden shadow-sm'>
          <button
            className='px-0.5 sm:px-1 py-0.5 hover:bg-gray-100 transition'
            onClick={handleDecrease}
          >
            <FaMinus size={9} className='sm:w-[10px]' />
          </button>
          <span className='px-0.5 sm:px-1 min-w-[14px] sm:min-w-[16px] text-center text-xs sm:text-sm'>{quantity}</span>
          <button
            className='px-0.5 sm:px-1 py-0.5 hover:bg-gray-100 transition'
            onClick={handleIncrease}
          >
            <FaPlus size={9} className='sm:w-[10px]' />
          </button>
          <button
            className={`${isInCart ? "bg-gray-800" : "bg-[#ff4d2d]"} text-white px-1.5 sm:px-2 py-0.5 sm:py-1 transition-colors`}
            onClick={handleAddToCart}
          >
            <FaShoppingCart size={12} className='sm:w-[14px]' />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FoodCard;