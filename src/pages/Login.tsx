import * as React from 'react';

const Login = function({ login }) {
  return (
    <div className='Login'>
      Login {login}
    </div>
  )
}

Login.getInitialProps = function() {
  return {
    login: 'Login',
  }
}


export default Login;
