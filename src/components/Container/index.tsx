import * as React from 'react';
import './style.scss';

interface IContainerProps {
  children?: any;
};

const Container = function({ children }: IContainerProps) {
  return (
    <div className='container'>
      {children}
    </div>
  )
}

export default Container;
