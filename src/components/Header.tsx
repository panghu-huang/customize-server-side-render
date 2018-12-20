import * as React from 'react';
import { Link } from 'react-router-dom';

const Header = function() {
  return (
    <div className='Header'>
      <Link to='/'>home</Link> <Link to='/login'>login</Link>
    </div>
  )
}

export default Header;
