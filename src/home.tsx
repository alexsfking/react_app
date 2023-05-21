import React from 'react';
import { Link } from 'react-router-dom';
import logo from './logo.svg';

function Home(){
  return (
    <div>
      <h1>Welcome to the Main Page!</h1>
      <img src={logo} alt="Main Page Image" />
      <div>
        <Link to="/original">Go to original</Link>
      </div>
      <div>
        <Link to="/original">Go to alternative</Link>
      </div>
    </div>
  );
};

export default Home;
