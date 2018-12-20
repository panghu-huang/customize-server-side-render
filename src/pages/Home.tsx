import * as React from 'react';
import { Link } from 'react-router-dom';

interface IHomeProps {
  name: string;
};

const Home = function({ name }: IHomeProps) {
  console.log('Home name', name);
  return (
    <div className='home'>
      <p>Home {name}</p>
      <Link to='/login'>to login</Link>
    </div>
  )
}

Home.getInitialProps = function() {
  return {
    name: 'Name',
  }
}

export default Home;
