import React from 'react';
import { Credentials } from './Credentials';

export function Login(props) {
  function handleSubmit(e) {
    e.preventDefault();
    props.onLoginSubmit({
      email: e.target.email.value,
      password: e.target.password.value,
    });
  }
  return (
    <section className='credentials'>
      <Credentials
        title='Log in'
        buttonText='Log in'
        linkText='Not a member yet? Sign up here!'
        link='/signup'
        onSubmit={handleSubmit}
      />
    </section>
  );
}
