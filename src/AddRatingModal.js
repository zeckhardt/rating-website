import React from "react";
import axios from 'axios';
import {Modal, ModalBody, ModalHeader, Form, Label, Row, Col, Input, Button, ModalFooter} from 'reactstrap';

const AddRatingModal = ({artistSearchResults, setArtistSearchResults,tempArtist, tempRating, tempAlbum, entries, tempReview, tempURL, tempSpotifyURL, tempDate, addModalState, toggleAddModal, accessToken, updateTempAlbum, updateTempArtist, updateTempRating, updateTempReview}) => {

    /**
     * Queries the Spotify API for all of a certain artist's albums.
     * @param {String} artist The string name of the artist for the query
     */
    const searchAlbums = artist => {
        let lookup = {};
        let output = [];

        axios.get(`https://music-rating-backend.onrender.com/spotify/${artist.data.artists.items[0].id}`)
            .then(function (response) {
                let albums = [];
                response.data.forEach(entry => {
                    if(entry.album_type === "album" && !response.data.includes(entry.name)) {
                        albums.push(entry);
                    }
                });
                //Filters out duplicate album names.
                albums.forEach(item => {
                    let name = item.name;

                    if (!(name in lookup)) {
                        lookup[name] = 1;
                        output.push(item);
                    }
                });
                setArtistSearchResults(output);
            })
            .catch(function (error) {
                console.log(error);
            });
    }
    /**
     * Queries the spotify API for user inputed artist name.
     */
    const getArtistResults = () => {
        axios.get(`https://music-rating-backend.onrender.com/spotify/artists/${tempArtist}`)
        .then(function (response) {
            searchAlbums(response);
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    /**
     * Reads the artistSearchResult state and creates option elements with the names of each album in the results.
     * @returns An array containing HTML option components.
     */
    const renderInput = () => {
        let results = artistSearchResults;
        let components = [];
        let count =1;
        components.push(
            <option  value={"default"} disabled></option>
        );
        
        results.forEach(entry => {
            components.push(
                <option key={count++}>{entry.name}</option>
            );
        });
        return components;
    }

    /**
    * Writes the inputted user review into a new database entry.
    */
    const addEntry = () => {
        axios.post('https://music-rating-backend.onrender.com/album', {
            "albumArtURL": tempSpotifyURL,
            "albumName": tempAlbum,
            "albumRating": tempRating,
            "albumReview": tempReview,
            "artistName": tempArtist,
            "releaseDate": tempDate
          }).then(
            toggleAddModal()
          ).catch(function (error) {
            console.log(error);
        });
    }
    
    
    return(
        <div id='add-rating'>
            <Modal isOpen={addModalState} centered size="lg" toggle={toggleAddModal}>
                <ModalHeader>Add a Rating</ModalHeader>
                <ModalBody>
                    <Form>
                        <div>
                            <Label>Artist name</Label>
                            <Row>
                                <Col>
                                    <Input type="search" onChange={updateTempArtist} />
                                </Col>
                                <Col>
                                    <Button onClick={getArtistResults}>Submit</Button>
                                </Col>
                            </Row>
                        </div>
                        <div>
                            <Label>Album name</Label>
                            <Input className="loadList" type="select" onChange={updateTempAlbum}>
                            {renderInput()}
                            </Input>
                        </div>
                        <div>
                            <Label>Rating: {tempRating}</Label>
                            <Input type="range" onChange={updateTempRating} />
                        </div>
                        <div>
                            <Label>Review</Label>
                            <Input type="textarea" onChange={updateTempReview} />
                        </div>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="success" onClick={addEntry}>Submit</Button>
                    <Button color="danger" onClick={toggleAddModal}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default AddRatingModal;