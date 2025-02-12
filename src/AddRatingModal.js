import React from "react";
import axios from 'axios';

const AddRatingModal = ({artistSearchResults, setArtistSearchResults,tempArtist, tempRating, tempAlbum, tempReview, tempURL, tempSpotifyURL, tempDate, addModalState, toggleAddModal, updateTempAlbum, updateTempArtist, updateTempRating, updateTempReview}) => {

    /**
     * Queries the Spotify API for all of a certain artist's albums.
     * @param {String} artist The string name of the artist for the query
     */
    const searchAlbums = artist => {
        let lookup = {};
        let output = [];

        axios.get(`https://zeckhardt.pythonanywhere.com/spotify/${artist.data.artists.items[0].id}`)
            .then(function (response) {
                let albums = [];
                response.data.forEach(entry => {
                    if(entry.album_type === "album" && !response.data.includes(entry.name)) {
                        albums.push(entry);
                    }
                });

                //Filters out duplicate album names.
                albums.forEach((item) => {
                    let name = item.name;

                    if (!(name in lookup)) {
                        lookup[name] = 1;
                        output.push(item);
                    }
                });

                setArtistSearchResults(output);
            })
            .catch((error) => console.log(error));
    };

    /**
     * Queries the spotify API for user inputed artist name.
     */
    const getArtistResults = () => {
        axios.get(`https://zeckhardt.pythonanywhere.com/spotify/artists/${tempArtist}`)
        .then((response) => searchAlbums(response))
        .catch((error) => console.log(error));
    };

    /**
     * Reads the artistSearchResult state and creates option elements with the names of each album in the results.
     * @returns An array containing HTML option components.
     */
    const renderInput = () => {
        let components = [<option value='default' disabled key='default'></option>]
        
        artistSearchResults.forEach((entry, index) => {
            components.push(<option key={index}>{entry.name}</option>)
        });
        return components;
    }

    /**
    * Writes the inputted user review into a new database entry.
    */
    const addEntry = (e) => {
        e.preventDefault();
        axios.post('https://zeckhardt.pythonanywhere.com/album', {
            "albumArtURL": tempURL,
            "albumSpotifyURL": tempSpotifyURL,
            "albumName": tempAlbum,
            "albumRating": tempRating,
            "albumReview": tempReview,
            "artistName": tempArtist,
            "releaseDate": tempDate
          })
          .then(toggleAddModal())
          .catch((error) => console.log(error));
    }
    
    
    return(
        <div id="add-rating" className={`modal ${addModalState ? "show d-block" : "d-none"}`} tabIndex="-1">
            <div className="modal-dialog modal-lg">
                <div className="modal-content" style={{border: "2px solid #FFF"}}>
                    <div className="modal-header">
                        <h5 className="modal-title">Add a Rating</h5>
                        <button type="button" className="btn-close" onClick={toggleAddModal}></button>
                    </div>
                    <div className="modal-body">
                        <form>
                            <div className="mb-3">
                                <label className="form-label">Artist Name</label>
                                <div className="d-flex gap-2">
                                    <input type="search" className="form-control" onChange={updateTempArtist} />
                                    <button type="button" className="btn btn-secondary" onClick={getArtistResults}>
                                        Submit
                                    </button>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Album Name</label>
                                <select className="form-select loadlist" onChange={updateTempAlbum}>
                                    {renderInput()}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Rating: {tempRating}</label>
                                <input type="range" className="form-range" onChange={updateTempRating} />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Review</label>
                                <textarea className="form-control" onChange={updateTempReview}></textarea>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-success" onClick={addEntry}>
                                    Submit
                                </button>
                                <button className="btn btn-danger" onClick={toggleAddModal}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddRatingModal;