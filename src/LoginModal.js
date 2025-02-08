import React from 'react';
import {useState} from "react";
import secret from './secrets';
import './Modal.css'

const LoginModal = ({toggleLoginModal, loginModalState, hiddenState, setHiddenState}) => {
    const [password, setPassword] = useState('');
    
    /**
     * Handles when a user tries to enter a password and evaluates if it is the correct one.
     */
    const loginHandler = () => {
        if(password === secret) {
            toggleLoginModal();
            setHiddenState(!hiddenState);
        } 
    }

    return(
        <div id='login-modal' className={`modal ${loginModalState ? "show d-block": "d-done"}`} tabIndex="-1">
            <div className='modal-dialog'>
                <div className='modal-content'>
                    <div className='modal-header'>
                        <h5 className='modal-title'>Admin Login</h5>
                        <button type='button' className='btn-close' onClick={toggleLoginModal}></button>
                    </div>
                    <div className='modal-body'>
                        <form>
                            <div className='mb-3'>
                                <label htmlFor='password' className='form-label'>Password</label>
                                <input 
                                    type='password'
                                    id='password'
                                    className='form-control'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </form>
                    </div>
                    <div className='modal-footer'>
                        <button className='btn btn-danger' onClick={toggleLoginModal}>Cancel</button>
                        <button className='btn btn-primary submit-login' onClick={loginHandler}>Login</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;