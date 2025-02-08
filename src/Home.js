import React, {useEffect, useState} from "react";
import AddRatingModal from "./AddRatingModal";
import RatingTable from "./RatingTable";
import Navbar from "./Navbar";
import EditRatingModal from "./EditRatingModal";
import LoginModal from "./LoginModal";



const Home = () => {

    const [addModalState, setAddModalState] = useState(false);
    const [editModalState, setEditModalState] = useState(false);
    const [loginModalState, setLoginModalState] = useState(false);
    const [hiddenState, setHiddenState] = useState(true);
    const [inPass, setInPass] = useState('');
    const [tempAlbum, setTempAlbum] = useState('');
    const [tempArtist, setTempArtist] = useState('');
    const [tempRating, setTempRating] = useState(null);
    const [tempReview, setTempReview] = useState('');
    const [tempURL, setTempURL] = useState('');
    const [tempSpotifyURL, setTempSpotifyURL] = useState('');
    const [tempDate, setTempDate] = useState('');
    const [entries, setEntries] = useState([]);
    const [artistSearchResults, setArtistSearchResults] = useState([]);
    const [editIndex, setEditIndex] = useState('');
    const [originalEntries, setOriginalEntries] = useState([]);


    useEffect(() => {
        fetch('https://zeckhardt.pythonanywhere.com/album').then((res) =>
            res.json().then((data) => {
                setEntries(data);
                setOriginalEntries(data);
            }
        ))
        .catch((error) =>   console.log(error));
    }, []);

    /**
     * onChange function that updates the tempReview state.
     * @param {HTMLInputElement} e Input object which its value is extracted.
     */
    const updateTempReview = (e) => setTempReview(e.target.value);

    /** 
     * Used to change the state of the edit review modal from on and off.
    */
    const toggleEditModal = () => {
        setEditModalState(!editModalState);
        setTempRating(null);
        setTempReview('');
    };
      
    /**
     * Used to change the state of the add review modal from on and off.
     */
    const toggleAddModal = () => {
        setAddModalState(!addModalState);
        setTempAlbum('');
        setTempArtist('');
        setTempRating(null);
        setTempSpotifyURL('');
        setTempDate('');
        setArtistSearchResults([]);
    }

    /**
     * onChange function used to update the tempArtist state.
     * @param {HTMLInputElement} e Input object which its value is extracted.
     */
    const updateTempArtist = (e) => setTempArtist(e.target.value.replace(' ', '%20'));

    /**
     * onChange function used to update the tempAlbum state.
     * @param {HTMLInputElement} e Input object which its value is extracted.
     */
    const updateTempAlbum = (e) => {
        const index = e.target.selectedIndex - 1;
        const selectedAlbum = artistSearchResults[index];
        if (!selectedAlbum) return;
        const spotifyURL = selectedAlbum['external_urls']['spotify'];
        let artist = selectedAlbum.artists.map(a => a.name).join(' • ');
        setTempAlbum(selectedAlbum.name);
        setTempArtist(artist);
        setTempURL(selectedAlbum.images[2]?.url || '');
        setTempSpotifyURL(spotifyURL);
        setTempDate(selectedAlbum['release_date']);
    };

    /**
     * onChange function used to update the tempRating state.
     * @param {HTMLInputElement} e Inout object which its value is extracted.
     */
    const updateTempRating = (e) => {
        let rating = Math.round((e.target.value / 10) / 0.5) * 0.5;
        setTempRating(rating.toPrecision(2));
    };

    /**
     * Handles the state of the login modal, toggling it on and off.
     */
    const toggleLoginModal = () => {
        setLoginModalState(!loginModalState);
        setInPass('');
    };


    return (
        <div className="container">
            <h1>Album Rating Index</h1>
            <Navbar
                hiddenState={hiddenState}
                toggleLoginModal={toggleLoginModal}
                toggleAddModal={toggleAddModal}
                toggleEditModal={toggleEditModal}
            />
            <LoginModal
                toggleLoginModal={toggleLoginModal}
                loginModalState={loginModalState}
                hiddenState={hiddenState}
                setHiddenState={setHiddenState}
            />
            {/* <EditRatingModal
                editModalState={editModalState}
                toggleEditModal={toggleEditModal}
                tempRating={tempRating}
                tempReview={tempReview}
                editIndex={editIndex}
                updateTempRating={updateTempRating}
                updateTempReview={updateTempReview}
                originalEntries={originalEntries}
            /> */}
            <RatingTable entries={entries} />
            <AddRatingModal
                artistSearchResults={artistSearchResults}
                setArtistSearchResults={setArtistSearchResults}
                tempArtist={tempArtist}
                tempRating={tempRating}
                tempAlbum={tempAlbum}
                tempReview={tempReview}
                tempURL={tempURL}
                tempSpotifyURL={tempSpotifyURL}
                tempDate={tempDate}
                addModalState={addModalState}
                toggleAddModal={toggleAddModal}
                updateTempAlbum={updateTempAlbum}
                updateTempArtist={updateTempArtist}
                updateTempRating={updateTempRating}
                updateTempReview={updateTempReview}
            />
        </div>
    );
}
export default Home;