import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

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
      <h1 className="heading">Oops!</h1>
      <p className="paragraph">Page not found</p>
      <p className="paragraphBelow">Redirecting back in {countdown} seconds...</p>
      <button className="button" onClick={handleRedirectNow}>Redirect Now</button>
    </div>
  );
};

export default NotFound;