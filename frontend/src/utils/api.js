class Api {
  constructor({ address, headers }) {
    this.baseUrl = address;
    this.headers = headers;
  }

  _checkResponse(res) {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(`Error getting user data: ${res.status},
      ${res.statusText}`);
  }

  getAllExercises(token) {
    return fetch(`${this.baseUrl}/exercises`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(this._checkResponse)
      .catch((err) => console.log(err));
  }

  getAllUsers(token) {
    return fetch(`${this.baseUrl}/users`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(this._checkResponse)
      .catch((err) => console.log(err));
  }

  getUserInfo(token) {
    return fetch(`${this.baseUrl}/users/me`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(this._checkResponse)
      .catch((err) => console.log(err));
  }

  postExercise(owner, exercise, description, token) {
    return fetch(`${this.baseUrl}/exercises`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        exercise,
        description,
        owner,
      }),
    })
      .then(this._checkResponse)
      .catch((err) => console.log(err));
  }

  changeExerciseStatus(cardId, iscompleted, token) {
    if (iscompleted) {
      return fetch(`${this.baseUrl}/exercises/${cardId}/completed`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => this._checkResponse(res))
        .catch((err) => console.log(err));
    } else {
      return fetch(`${this.baseUrl}/exercises/${cardId}/completed`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => this._checkResponse(res))
        .catch((err) => console.log(err));
    }
  }

  deleteExercise(cardId, token) {
    return fetch(`${this.baseUrl}/exercises/${cardId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    })
      .then(this._checkResponse)
      .catch((err) => console.log(err));
  }

  setSelectedTrainer(trainer, token) {
    return fetch(`${this.baseUrl}/users/me/trainer`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        trainer,
      }),
    })
      .then((res) => this._checkResponse(res))
      .catch((err) => console.log(err));
  }

  setTrainee(userId, cardId, token) {
    return fetch(`${this.baseUrl}/users/${cardId}/trainees`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        trainee: userId,
        trainer: cardId,
      }),
    })
      .then((res) => this._checkResponse(res))
      .catch((err) => console.log(err));
  }
}
const api = new Api({
  address: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
