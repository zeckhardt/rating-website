import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Home from './Home';
import { initializeApp } from "firebase/app";
import firebaseConfig from './FirebaseConfig';
import 'bootstrap/dist/css/bootstrap.min.css';

initializeApp(firebaseConfig);

ReactDOM.render(
    <Home />,
  document.getElementById('root')
);