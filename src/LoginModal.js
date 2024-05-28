import React from 'react';
import {useState} from "react";
import secret from './secrets';
import {Modal, ModalHeader, ModalBody, ModalFooter, Form, Label, Input, Button, FormGroup} from 'reactstrap';

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
        <div id='login-modal'>
            <Modal isOpen={loginModalState} toggle={toggleLoginModal}>
                <ModalHeader>Admin Login</ModalHeader>
                <ModalBody>
                    <Form>
                        <FormGroup>
                            <Label for="password">Password</Label>
                            <Input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => {setPassword(e.target.value)}}
                            />
                        </FormGroup>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" onClick={toggleLoginModal}>Cancel</Button>
                    <Button className="submit-login" onClick={loginHandler}>Login</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default LoginModal;