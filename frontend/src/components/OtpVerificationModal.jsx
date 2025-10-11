import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeOtpModal, setOtpError } from '../redux/userSlice';

const OtpVerificationModal = ({ email, onVerify }) => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(300); 
  const [resendDisabled, setResendDisabled] = useState(false);
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      
      return () => clearInterval(interval);
    } else {
      setResendDisabled(false);
    }
  }, [timer]);

  const handleResend = async () => {
    if (resendDisabled) return;
    
    dispatch(setOtpError(null));
    setTimer(300);
    setResendDisabled(true);
    
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        dispatch(setOtpError('Failed to resend OTP. Please try again later.'));
      }
    } catch (error) {
      dispatch(setOtpError('Network error. Please check your connection.'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setOtpError(null));
    
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      
      if (response.ok) {
        onVerify();
      } else {
        dispatch(setOtpError('Invalid or expired OTP. Please try again.'));
      }
    } catch (error) {
      dispatch(setOtpError('Network error. Please check your connection.'));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-4">Verify OTP</h2>
        <p className="mb-6">An OTP has been sent to {email}. Please enter it below.</p>
        
        {resendDisabled && (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-700 rounded">
            OTP resent successfully. Please check your inbox.
          </div>
        )}
        
        {otpError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {otpError}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-6 flex justify-between items-center">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Verify
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendDisabled}
              className="text-blue-500 hover:underline"
            >
              Resend OTP
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            {Math.floor(timer / 60)}:{timer % 60 < 10 ? '0' + timer % 60 : timer % 60}
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtpVerificationModal;