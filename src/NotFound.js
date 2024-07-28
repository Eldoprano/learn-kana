import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();
  const location = useLocation();
  const customTitle = location.state?.title || "Oops!";
  const customMessage = location.state?.message || "Page not found";

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);

    const redirectTimeout = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimeout);
    };
  }, [navigate]);

  const handleRedirectNow = () => {
    navigate('/');
  };

  return (
    <div className="container">
      <h1 className="heading">{customTitle}</h1>
      <p className="paragraph">{customMessage}</p>
      <p className="paragraphBelow">Redirecting back in {countdown} seconds...</p>
      <button className="button" onClick={handleRedirectNow}>Redirect Now</button>
    </div>
  );
};

export default NotFound;