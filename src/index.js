import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Home from './Home';
import { initializeApp } from "firebase/app";
import 'bootstrap/dist/css/bootstrap.min.css';

const firebaseConfig = {
  apiKey: "AIzaSyAJlUGJgKiOOzaN-p0u-Vn91JOreEg6kCU",
  authDomain: "music-rating-app.firebaseapp.com",
  projectId: "music-rating-app",
  storageBucket: "music-rating-app.appspot.com",
  messagingSenderId: "664108305658",
  appId: "1:664108305658:web:eed5e0050a9bb6d6514d43",
  measurementId: "G-R0BW1PW09P",
  databaseURL: "https://music-rating-app-default-rtdb.firebaseio.com/"
};

initializeApp(firebaseConfig);

ReactDOM.render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>,
  document.getElementById('root')
);