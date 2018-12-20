import * as React from 'react';
import { Link } from 'react-router-dom';

const Home = function() {
  return (
    <div className='home'>
      Home <Link to='/login'>to login</Link>
    </div>
  )
}

export default Home;
