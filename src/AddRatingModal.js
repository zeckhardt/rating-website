import React from "react";
import axios from 'axios';
import { getDatabase, ref, set } from "firebase/database";
import {Modal, ModalBody, ModalHeader, Form, Label, Row, Col, Input, Button, ModalFooter} from 'reactstrap';

const AddRatingModal = ({artistSearchResults, setArtistSearchResults,tempArtist, tempRating, tempAlbum, entries, tempReview, tempURL, tempSpotifyURL, tempDate, addModalState, toggleAddModal, accessToken, updateTempAlbum, updateTempArtist, updateTempRating, updateTempReview}) => {

    /**
     * Queries the Spotify API for all of a certain artist's albums.
     * @param {String} artist The string name of the artist for the query
     */
    const searchAlbums = artist => {
        let lookup = {};
        let output = [];

        axios.get(`https://api.spotify.com/v1/artists/${artist.data.artists.items[0].id}/albums?limit=30&offset=0`,{
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application-json'
            }
        })
            .then(function (response) {
                console.log(response)
                let albums = [];
                response.data.items.forEach(entry => {
                    if(entry.album_type === "album" && !response.data.items.includes(entry.name)) {
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
        axios.get(`https://api.spotify.com/v1/search?q=artist%3A${tempArtist}&type=artist`, {
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application-json'
            }
        })
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
        const db = getDatabase();
        set(ref(db, 'musicRatings/' + (entries.length)), {
            artistName: tempArtist,
            albumName: tempAlbum,
            albumRating: tempRating,
            albumReview: tempReview,
            albumArtURL: tempURL,
            albumSpotifyURL: tempSpotifyURL,
            releaseDate: tempDate,
        });
        toggleAddModal();
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