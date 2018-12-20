import * as React from 'react';
import Header from './components/Header';
import './global.scss';

interface IAppProps {
  children?: any;
};

class App extends React.Component<IAppProps> {

  public render() {
    const { children } = this.props;
    return (
      <>
        <Header />
        {children}
      </>
    )
  }

}

export default App;
