import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Home from './Home';
import { initializeApp } from "firebase/app";
import firebaseConfig from './FirebaseConfig';
import 'bootstrap/dist/css/bootstrap.min.css';

initializeApp(firebaseConfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Home />
);