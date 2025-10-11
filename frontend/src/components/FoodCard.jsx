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
    <div className='w-[180px] rounded-xl border border-[#008e39] bg-white shadow-md overflow-hidden hover:shadow-lg transform hover:scale-102 transition-all duration-300 flex flex-col'>
      {/* Image Section */}
      <div className='relative w-full h-[120px] flex justify-center items-center bg-white'>
        <div className='absolute top-2 right-2 bg-white rounded-full p-1 shadow'>
          {data.foodType === "veg" ?
            <FaLeaf className='text-green-600 text-sm' /> :
            <FaDrumstickBite className='text-red-600 text-sm' />
          }
        </div>
        <img
          src={data.image}
          alt={data.name}
          className='w-full h-full object-cover transition-transform duration-300 hover:scale-105'
        />
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col p-3">
        <h1 className='font-semibold text-gray-900 text-sm truncate'>{data.name}</h1>

        <p className='text-xs text-gray-500 truncate mt-1'>
          {data.foodType === "veg" ? "(Veg)" : "(Non-Veg)"}
          <br />
          Expires at {data.expiry}
        </p>

        <div className='flex items-center gap-1 mt-1'>
          {renderStars(data.rating?.average || 0)}
          <span className='text-xs text-gray-500'>
            {data.rating?.count || 0}
          </span>
        </div>
      </div>

      {/* Footer Section */}
      <div className='flex items-center justify-between mt-auto p-2'>
        <span className='font-bold text-gray-900 text-base'>
          ₹{data.price}
        </span>

        <div className='flex items-center border rounded-full overflow-hidden shadow-sm'>
          <button
            className='px-1 py-1 hover:bg-gray-100 transition'
            onClick={handleDecrease}
          >
            <FaMinus size={10} />
          </button>
          <span className='px-1 min-w-[16px] text-center text-sm'>{quantity}</span>
          <button
            className='px-1 py-1 hover:bg-gray-100 transition'
            onClick={handleIncrease}
          >
            <FaPlus size={10} />
          </button>
          <button
            className={`${isInCart ? "bg-gray-800" : "bg-[#ff4d2d]"} text-white px-2 py-1 transition-colors`}
            onClick={handleAddToCart}
          >
            <FaShoppingCart size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FoodCard;