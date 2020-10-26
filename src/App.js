import React, { useState } from 'react';
import './App.css';
import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebaseConfig';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  };

function App() {
  const [newUser, setNewUser] = useState(false);
  const [ user, setUser ] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    password: '',
    photo: ''
  })
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleSignIn = () =>{
    firebase.auth().signInWithPopup(googleProvider)
    .then(res => {
      const {displayName, email, photoURL} = res.user;
      const signedInUser = {
        isSignedIn: true,
        name: displayName,
        email: email,
        photo: photoURL
      }
      setUser(signedInUser);
      console.log(displayName, email, photoURL)
    })
    .catch( err => {
      console.log(err);
      console.log(err.message);
    })
  }

  const handleFbSignIn = () =>{
    firebase.auth().signInWithPopup(fbProvider).then(function(result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      console.log(user);
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
    })
  }
  const handleSignOut = () => {
    firebase.auth().signOut()
    .then( res => {
      const signedOutUser = {
        isSignedIn: false,
        name: '',
        photo: '',
        email: '',
        error: '',
        success: false
      }
      setUser(signedOutUser)
      console.log(res);
    })
    .catch( err => {

    })
  }

  const handleChange = (event) => {
    //console.log(event.target.name, event.target.value);
    let isFormValid = true;
    if(event.target.name === 'email'){
      isFormValid = /\S+@\S+\.\S+/.test(event.target.value);
      //console.log(isEmailValid);
    }
    if(event.target.name === 'password'){
      const isPasswordValid = (event.target.value).length > 6;
      const passwordHasNumber = /\d{1}/.test(event.target.value);
      isFormValid = isPasswordValid && passwordHasNumber;
      // console.log(passwordHasNumber);
    }
    if(isFormValid){
      const newUserInfo = {...user};
      newUserInfo[event.target.name] = event.target.value;
      setUser(newUserInfo);
    }
  }
  const handleSubmit = (event) => {
    // console.log(user.email, user.password);
    if(newUser && user.email && user.password){
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
      .then(res => {
        const newUserInfo = {...user};
        newUserInfo.error = '';
        newUserInfo.success = true;
        setUser(newUserInfo);
        updateUserName(user.name);
        //console.log(res);
      })
      .catch(error => {
        // Handle Errors here.
        //var errorCode = error.code;
        const newUserInfo = {...user};
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        // var errorMessage = error.message;
        // console.log(errorCode, errorMessage);
        setUser(newUserInfo);
      });
    }
    if(!newUser && user.email && user.password){
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
      .then( res => {
        const newUserInfo = {...user};
        newUserInfo.error = '';
        newUserInfo.success = true;
        setUser(newUserInfo);
        console.log('sign in user info', res.user);
      })
      .catch(function(error) {
        // Handle Errors here.
        //var errorCode = error.code;
        const newUserInfo = {...user};
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        // var errorMessage = error.message;
        // console.log(errorCode, errorMessage);
        setUser(newUserInfo);
      });
    }

    event.preventDefault();
  }

  const updateUserName = (name) => {
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name
      //photoURL: "https://example.com/jane-q-user/profile.jpg"
    }).then(function() {
      console.log('user name updated successfully');
    // Update successful.
    }).catch(function(error) {
      console.log(error);
    // An error happened.
    });
  }
  return (
    <div className="App">
      {
        user.isSignedIn ? <button onClick={handleSignOut}>Sign Out</button> : 
        <button onClick={handleSignIn}>Sign In</button>
      }
      <br/>
      <button onClick={handleFbSignIn}>Sign In Using Facebook</button>
      {
        user.isSignedIn && <div>
          <p>Welcome, {user.name}</p>
          <p>Your email: {user.email}</p>
          <img src={user.photo} alt=""/>
        </div>
      }
      <h1>Our Own Authentication</h1>
      {/* <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Password: {user.password}</p> */}
      <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id=""/>
      <label htmlFor="newUser">Register</label>
      <form onSubmit={handleSubmit}>
        {newUser && <input type="text" name="name" onBlur={handleChange} placeholder="Enter your name"/>}
        <br/>
        <input type="email" name="email" onBlur={handleChange} placeholder="Enter your email" required/>
        <br/>
        <input type="password" name="password" onBlur={handleChange} placeholder="Enter your password" required/>
        <br/>
        <input type="submit" value={newUser ? 'Sign Up' : 'Sign In'}/>
      </form>
      <p style={{color: 'red'}}>{user.error}</p>
      {
        user.success && <p style={{color: 'green'}}>User {newUser ? 'Created' : 'Logged In'} Successfully</p>
      }
    </div>
  );
}

export default App;
