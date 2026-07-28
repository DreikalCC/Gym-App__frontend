export const BASE_URL = process.env.REACT_APP_API_URL || '/api';

export const register = (name, lastname, email, password, role) => {
  return fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, lastname, email, password, role }),
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      if (data.error) {
        throw new Error(data.error);
      }
    });
};

export const authorize = (email, password) => {
  return fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
      throw new Error(res.error);
    })
    .then((data) => {
      localStorage.setItem('jwt', data.token);
      return Promise.resolve(data);
    });
};

export const checkToken = (token) => {
  return fetch(`${BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => {
    return res.json();
  });
};
