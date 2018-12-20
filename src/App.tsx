import * as React from 'react';
import { Route } from 'react-router-dom';
import Container from './components/Container';
import Home from './components/Home';
import Login from './components/Login';
import './global.scss';

class App extends React.Component {

  public render() {
    return (
      <Container>
        <Route exact path='/' component={Home}/>
        <Route path='/login' component={Login}/>
      </Container>
    )
  }
  
}

export default App;
