import React, { useEffect, useState } from 'react'
import logo from '../assets/logo.bmp'
import { FaLocationDot } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { useDispatch, useSelector } from 'react-redux';
import { RxCross2 } from "react-icons/rx";
import axios from 'axios';
import { serverUrl } from '../App';
import { setSearchItems, setUserData } from '../redux/userSlice';
import { FaPlus } from "react-icons/fa6";
import { TbReceipt2 } from "react-icons/tb";
import { useNavigate } from 'react-router-dom';

function Nav() {
    const { userData, currentCity, cartItems } = useSelector(state => state.user)
    const { myShopData } = useSelector(state => state.owner)
    const [showInfo, setShowInfo] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [query, setQuery] = useState("")
    const [isScrolled, setIsScrolled] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    // Scroll detect panna - navbar change aagum
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleLogOut = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
            dispatch(setUserData(null))
        } catch (error) {
            console.log(error)
        }
    }

    const handleSearchItems = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`, { withCredentials: true })
            dispatch(setSearchItems(result.data))
        } catch (error) {
            console.log(error)
        }
    }

    // Search query change aana search pannum
    useEffect(() => {
        if (query) {
            handleSearchItems()
        } else {
            dispatch(setSearchItems(null))
        }
    }, [query])

    return (
        <>
            <div className={`w-full h-20 flex items-center justify-between px-6 lg:px-8 fixed top-0 z-50 transition-all duration-300 ${
                isScrolled 
                    ? 'bg-[#eefff3] backdrop-blur-md shadow-lg border-b border-gray-100' 
                    : 'bg-[#eefff3] border-b border-gray-100'
            }`}>
                
                <div className="flex items-center gap-8">
                    <img src={logo} alt="Vingo" className="h-9 w-auto" />
                </div>

                {/* Desktop la search bar - user ku mattum */}
                {userData.role === "user" && (
                    <div className="hidden md:flex items-center flex-1 max-w-2xl mx-8">
                        <div className="w-full relative group">
                            <div className="flex items-center bg-gradient-to-r from-gray-50 to-gray-100/80 rounded-2xl px-6 py-3 border border-gray-200/60 transition-all duration-300 group-hover:border-green-300 group-hover:shadow-md group-focus-within:bg-white group-focus-within:border-green-400 group-focus-within:shadow-lg">
                                <FaLocationDot className="text-green-600 mr-3 flex-shrink-0 transition-colors duration-200" size={18} />
                                <div className="text-sm text-gray-700 font-medium mr-4 border-r border-gray-300 pr-4 min-w-0 truncate max-w-[140px]">
                                    {currentCity}
                                </div>
                                <IoIosSearch className="text-gray-500 mr-3 flex-shrink-0 transition-colors duration-200 group-focus-within:text-green-600" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search delicious food..."
                                    className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500 text-sm font-medium"
                                    onChange={(e) => setQuery(e.target.value)}
                                    value={query}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3">
                    {/* Mobile la search toggle button */}
                    {userData.role === "user" && (
                        <button 
                            onClick={() => setShowSearch(!showSearch)}
                            className="md:hidden p-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-all duration-200 active:scale-95"
                        >
                            {showSearch ? <RxCross2 size={20} /> : <IoIosSearch size={20} />}
                        </button>
                    )}

                    {/* Owner ku specific actions */}
                    {userData.role === "owner" && (
                        <>
                            {myShopData && (
                                <>
                                    <button 
                                        onClick={() => navigate("/add-item")}
                                        className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl active:scale-95"
                                    >
                                        <FaPlus size={16} />
                                        <span>Add Food</span>
                                    </button>
                                    <button 
                                        onClick={() => navigate("/add-item")}
                                        className="md:hidden flex items-center p-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
                                    >
                                        <FaPlus size={18} />
                                    </button>
                                </>
                            )}
                            
                            <button 
                                onClick={() => navigate("/my-orders")}
                                className="hidden md:flex items-center gap-2 px-5 py-2.5 text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md active:scale-95"
                            >
                                <TbReceipt2 size={18} />
                                <span>My Orders</span>
                            </button>
                            <button 
                                onClick={() => navigate("/my-orders")}
                                className="md:hidden flex items-center p-3 text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                            >
                                <TbReceipt2 size={18} />
                            </button>
                        </>
                    )}

                    {/* User ku specific actions */}
                    {userData.role === "user" && (
                        <>
                            <button 
                                onClick={() => navigate("/cart")}
                                className="relative p-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-all duration-200 active:scale-95 group"
                            >
                                <FiShoppingCart size={22} className="group-hover:scale-110" />
                                {cartItems.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                                        {cartItems.length}
                                    </span>
                                )}
                            </button>
                            
                            <button 
                                onClick={() => navigate("/my-orders")}
                                className="hidden md:block px-5 py-2.5 text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md active:scale-95"
                            >
                                My Orders
                            </button>
                        </>
                    )}

                    {/* User profile section */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowInfo(!showInfo)}
                            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center hover:scale-105 active:scale-95 hover:from-green-600 hover:to-green-700"
                        >
                            {userData?.fullName.slice(0, 1).toUpperCase()}
                        </button>

                        {/* Profile dropdown menu */}
                        {showInfo && (
                            <div className={`absolute top-16 right-0 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/60 py-3 animate-in fade-in zoom-in-95 duration-200 ${
                                userData.role === "deliveryBoy" 
                                    ? "md:right-[-20%] lg:right-[-40%]" 
                                    : "md:right-[-10%] lg:right-[-25%]"
                            }`}>
                                <div className="px-4 py-3 border-b border-gray-200/60">
                                    <div className="font-bold text-gray-900 text-lg">{userData.fullName}</div>
                                    <div className="text-sm text-gray-500 mt-1">{userData.email}</div>
                                </div>
                                
                                {userData.role === "user" && (
                                    <button 
                                        onClick={() => { navigate("/my-orders"); setShowInfo(false); }}
                                        className="md:hidden w-full px-4 py-3 text-left text-gray-700 hover:bg-green-50 transition-all duration-200 font-medium flex items-center gap-3"
                                    >
                                        <TbReceipt2 size={18} />
                                        <span>My Orders</span>
                                    </button>
                                )}
                                
                                <button 
                                    onClick={handleLogOut}
                                    className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-all duration-200 font-medium flex items-center gap-3 mt-1"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span>Log Out</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile la search bar - toggle panna varum */}
            {showSearch && userData.role === "user" && (
                <div className="fixed top-20 left-0 right-0 z-40 px-4 py-4 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xl md:hidden animate-in slide-in-from-top duration-300">
                    <div className="flex items-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl px-4 py-3 border border-gray-200 shadow-inner">
                        <FaLocationDot className="text-green-600 mr-3 flex-shrink-0" size={16} />
                        <div className="text-sm text-gray-700 font-medium mr-3 border-r border-gray-300 pr-3 truncate flex-1 min-w-0">
                            {currentCity}
                        </div>
                        <IoIosSearch className="text-gray-500 mr-3 flex-shrink-0" size={18} />
                        <input
                            type="text"
                            placeholder="Search delicious food..."
                            className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500 text-sm font-medium"
                            onChange={(e) => setQuery(e.target.value)}
                            value={query}
                            autoFocus
                        />
                    </div>
                </div>
            )}

            {/* Navbar fixed irukkaraala space add pannanum */}
            <div className="h-20"></div>
        </>
    )
}

export default Nav