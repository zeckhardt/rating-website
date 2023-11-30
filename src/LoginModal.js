import React from 'react';
import secret from './secrets';
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, Label, Input, Button } from 'reactstrap';

const LoginModal = ({toggleLoginModal, loginModalState, updatePassState, hiddenState, setHiddenState, inPass}) => {
    /**
     * Handles when a user tries to enter a password and evaluates if it is the correct one.
     */
    const loginHandler = () => {
        if(inPass === secret) {
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
                        <div>
                            <Label>Admin Login</Label>
                            <Input type="password" placeholder="Password" id="password" onChange={updatePassState} />
                        </div>
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