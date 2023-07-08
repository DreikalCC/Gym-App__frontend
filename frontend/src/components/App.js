import React, { useEffect, useId, useCallback } from 'react';
import { Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Exercises } from './Exercises';
import { TrainerUsers } from './TrainerUsers';
import api from '../utils/api';
import * as auth from '../utils/auth';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import { DeleteCardPopup } from './DeleteCardPopup';
import { ProtectedRoute } from './ProtectedRoute';
import { Login } from './Login';
import { Register } from './Register';
import { InfoTooltip } from './InfoTooltip';
import { Trainers } from './Trainers';

export default function App() {
  const navigate = useNavigate();
  React.useState(false);

  //tools
  const [isEraseCardPopupOpen, setEraseCardPopupOpen] = React.useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false);
  const [isMenuOn, setIsMenuOn] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [token, setToken] = React.useState(localStorage.getItem('jwt'));

  //data
  const [description, setDescription] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [lastname, setLastname] = React.useState('');
  const [name, setName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [exercise, setExercise] = React.useState('');

  //information
  const [routine, setRoutine] = React.useState([]);
  const [deletableCard, setDeletableCard] = React.useState('');
  const [userList, setUserList] = React.useState([]);
  const [trainerList, setTrainerList] = React.useState([]);
  const [currentUser, setCurrentUser] = React.useState({});
  const [userIdExercise, setUserIdExercise] = React.useState('');

  //functionality
  const handleTokenCheckMemo = useCallback((token) => {
    if (!token) return;
    auth.checkToken(token).then((res) => {
      if (res.status === true) {
        setLoggedIn(true);
        navigate('/');
      }
    });
  }, []);

  React.useEffect(() => {
    if (!token) return;
    handleTokenCheckMemo(token);
    userPromise(token);
  }, [token]);

  function userPromise(token) {
    if (token) {
      Promise.all([api.getUserInfo(token), api.getAllExercises(token)])
        .then(([user, exercises]) => {
          setCurrentUser(user.data);
          setEmail(user.data.email);
          setRoutine(exercises.data);
        })
        .then(() => {
          if (currentUser.role === 'trainee') {
            api
              .getAllUsers(token)
              .then((users) => {
                const filtered = users.filter((u) => u.role !== 'trainer');
                return filtered;
              })
              .then((filtered) => {
                setTrainerList(filtered);
              });
          }
          if (currentUser.role === 'trainer') {
            api
              .getAllUsers(token)
              .then((users) => {
                const filtered = users.filter((u) => u.role !== 'trainer');
                return filtered;
              })
              .then((filtered) => {
                setUserList(filtered);
              });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  function handleTrainerSelect(trainer) {
    api.setSelectedTrainer(trainer._id, token).then(() => {
      navigate('/exercises');
    });
  }

  function handleExerciseCompletion(exercise, isCompleted) {
    api
      .changeExerciseStatus(exercise._id, isCompleted, token)
      .then((newExercises) => {
        setRoutine((state) => {
          return state.map((c) =>
            c._id === exercise._id ? newExercises.data : c
          );
        });
      });
  }

  function handleAddExercise({ exercise, description, owner }) {
    api
      .postExercise(owner, exercise, description, token)
      .then((newExercise) => {
        setRoutine([newExercise.data, ...routine]);
      });
  }

  function handleEraseExercise(exercise, selectedUser) {
    api
      .deleteExercise(exercise._id, token)
      .then(
        setRoutine((state) => {
          const remainingExercises = state.filter(
            (c) => c._id !== exercise._id
          );
          return remainingExercises.map((c) => c);
        })
      )
      .finally(closeAllPopups());
  }

  function handleEraseExerciseClick(card, id) {
    setDeletableCard(card);
    setUserIdExercise(id);

    setEraseCardPopupOpen(true);
  }

  function handleMenuClick() {
    setIsMenuOn(true);
  }
  function closeAllPopups() {
    setEraseCardPopupOpen(false);
    setIsTooltipOpen(false);
    setDeletableCard('');
    setUserIdExercise('');
    setIsMenuOn(false);
  }
  /*function routing(user) {
    if (user === 'trainee') {
      if (currentUser.trainer.length === 0) {
        navigate('/trainers');
      }
      if (currentUser.trainer.length > 0) {
        navigate('/exercises');
      }
    }
    if (user === 'trainer') {
      navigate('/users');
    }
  }*/
  /*useEffect(() => {
    const saveData = localStorage.getItem('jwt');
    if (saveData) {
      const user = JSON.parse(saveData);
      setCurrentUser(user);
    }
  }, []);*/
  /*useEffect(() => {
    if (!currentUser || !currentUser._id) {
      return;
    }
    localStorage.setItem('jwt', JSON.stringify(currentUser));
    routing(currentUser.role);

    setRoutine(currentUser.exercises);
    setEmail(currentUser.email);
    setLoggedIn(true);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);*/

  ////registry

  function handleLoginSubmit({ email, password }) {
    auth
      .authorize(email, password)
      .then((data) => {
        setToken(data.token);
        setCurrentUser(data.user);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleLogout() {
    setLoggedIn(false);
    setIsMenuOn(false);
    localStorage.removeItem('jwt');
    setEmail('');
    setCurrentUser('');
    navigate('/login');
  }

  function handleSignupSubmit({ name, lastname, email, password, role }) {
    auth
      .register(name, lastname, email, password, role)
      .then((res) => {
        navigate('/login');
      })
      .then(() => {
        setSuccess(true);
        setIsTooltipOpen(true);
      })
      .catch((err) => {
        setSuccess(false);
        setIsTooltipOpen(true);
        console.log(err);
      });
  }

  ////events handlers
  function handleExerciseChange(e) {
    setExercise(e.target.value);
  }
  function handleLastnameChange(e) {
    setLastname(e.target.value);
  }
  function handleNameChange(e) {
    setName(e.target.value);
  }
  function handleDescriptionChange(e) {
    setDescription(e.target.value);
  }
  function handleEmailChange(e) {
    setEmail(e.target.value);
  }
  function handlePasswordChange(e) {
    setPassword(e.target.value);
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className='page'>
        <Header
          isOpen={isMenuOn}
          onClose={closeAllPopups}
          handleMenuClick={handleMenuClick}
          handleLogoutClick={handleLogout}
          loggedIn={loggedIn}
          email={email}
        />
        <Routes>
          <Route
            path='/trainers'
            element={
              <ProtectedRoute
                loggedIn={
                  currentUser.role === 'trainee' &&
                  currentUser.trainer.length === 0
                }
                element={
                  <Trainers
                    trainerList={trainerList}
                    trainerSelect={handleTrainerSelect}
                  />
                }
              />
            }
          />
          <Route
            path='/exercises'
            element={
              <ProtectedRoute
                loggedIn={
                  currentUser.role === 'trainee' &&
                  currentUser.trainer.length > 0
                }
                element={
                  <Exercises
                    exercises={routine}
                    handleExerciseCompletion={handleExerciseCompletion}
                  />
                }
              />
            }
          />
          <Route
            path='/users'
            element={
              <ProtectedRoute
                loggedIn={loggedIn && currentUser.role === 'trainer'}
                element={
                  <TrainerUsers
                    userList={userList}
                    routine={routine}
                    handleAddExercise={handleAddExercise}
                    handleEraseExerciseClick={handleEraseExerciseClick}
                    onDescriptionChange={handleDescriptionChange}
                    onExerciseChange={handleExerciseChange}
                    exercise={exercise}
                    description={description}
                  />
                }
              />
            }
          />
          <Route
            path='/login'
            element={<Login onLoginSubmit={handleLoginSubmit} />}
          />

          <Route
            path='/signup'
            element={
              <Register
                onNameChange={handleNameChange}
                onLastnameChange={handleLastnameChange}
                onEmailChange={handleEmailChange}
                onPasswordChange={handlePasswordChange}
                onSignupSubmit={handleSignupSubmit}
                name={name}
                lastname={lastname}
                email={email}
                password={password}
              />
            }
          />
          <Route
            path='/'
            element={
              loggedIn && currentUser.role === 'trainer' ? (
                <Navigate to='/users' />
              ) : (
                <Navigate to='/trainers' />
              )
            }
          />
        </Routes>
        <InfoTooltip
          isTooltipOpen={isTooltipOpen}
          onClose={closeAllPopups}
          isSuccess={success}
        />
        <DeleteCardPopup
          isOpen={isEraseCardPopupOpen}
          onClose={closeAllPopups}
          card={deletableCard}
          selectedUser={userIdExercise}
          onConfirm={handleEraseExercise}
        />
        <Footer />
      </div>
    </CurrentUserContext.Provider>
  );
}
