import React from "react";
import { getDatabase, ref, update } from "firebase/database";
import {Modal, ModalBody, ModalFooter, ModalHeader, Form, Label, Input, Button} from 'reactstrap';

const EditRatingModal = ({editModalState, toggleEditModal, tempRating, tempReview, editIndex, updateTempRating, updateTempReview, originalEntries}) => {
    
    /**
     * Loads all the album reviews for selection in an Input Select.
     * @returns An array of HTMLOption elements.
     */
    const loadOptions = () => {
        const albums = originalEntries;
        let components = [];
        let count = 1;
        albums.forEach(entry => {
            components.push(
                <option key={count++} >{entry.albumName}</option>
            );
        });
        return components;
    }

    /**
     * onChange function that updates the tempRating and TempReview states.
     * @param {HTMLInputElement} e Inout object which its value is extracted.
     */
    const makeEditSelection = e => {
        this.setState({
            tempRating: originalEntries[e.target.selectedIndex].albumRating,
            tempReview: originalEntries[e.target.selectedIndex].albumReview,
            editIndex: e.target.selectedIndex,
        });
    }

    /**
     * Makes an update request to the database to update the albumRating and albumReview values.
     */
    const updateReview = () => {
        const db = getDatabase();
        update(ref(db, 'musicRatings/' + (editIndex)), {
            albumRating: tempRating,
            albumReview: tempReview,
        }).then(() => {
            toggleEditModal();
        }).catch((error) => {
            console.error("Error updating review:", error);
        });
    };
    
    return(
        <div id='edit-modal'>
            <Modal isOpen={editModalState} toggle={toggleEditModal}>
                <ModalHeader>Edit a Review</ModalHeader>
                <ModalBody>
                    <Form>
                        <div>
                            <Label>Album</Label>
                            <Input type="select" onChange={makeEditSelection}>
                                {loadOptions()}
                            </Input>
                        </div>
                        <div>
                            <Label>Rating: {tempRating}</Label>
                            <Input type="range" onChange={updateTempRating} defaultValue={tempRating} />
                        </div>
                        <div>
                            <Label>Review</Label>
                            <Input type="textarea" onChange={updateTempReview} defaultValue={tempReview} />
                        </div>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="success" onClick={updateReview}>Submit</Button>
                    <Button color="danger" onClick={toggleEditModal}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default EditRatingModal;