import React, {useEffect, useState} from "react";
import axios from 'axios';
import { getDatabase, ref, onValue, } from "firebase/database";
import { Buffer } from "buffer";
import spotifyConfig from "./SpotifyConfig";
import { Container } from "reactstrap";
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
    const [accessToken, setAccessToken] = useState('');
    const [artistSearchResults, setArtistSearchResults] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const [originalEntries, setOriginalEntries] = useState([]);


    useEffect(() => {
        const fetchData = async () => {
            const db = getDatabase();
            const starCountRef = ref(db, 'musicRatings/');
            onValue(starCountRef, (snapshot) => {
                const data = snapshot.val();
                setEntries(data);
                setOriginalEntries(data);
            });
        }

        fetchData();
        getAccessToken();
    }, []);

    /**
     * Makes a post request to the Spotify API to get an access token string used for further API requests.
     * @returns {Promise<string>}
     */
    const getAccessToken = async () => {
        const params = new URLSearchParams({
            grant_type: 'client_credentials',
        });
    
        try {
        const response = await axios.post('https://accounts.spotify.com/api/token', params.toString(), {
            headers: {
                Authorization: `Basic ${Buffer.from(`${spotifyConfig.clientId}:${spotifyConfig.clientSecret}`).toString('base64')}`,
            },
        });
    
            const accessToken = response.data.access_token;
            setAccessToken(accessToken);
            return accessToken;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    /**
     * Retrieves a list of albums for a given artst using the Spotify API.
     * @param {Number} id The numerical representation of the queried artist.
     * @param {Function} callback Callback function that uses the response data as a parameter.
     */
    const getAlbum = (id, callback) => {
        axios.get(`https://api.spotify.com/v1/albums/${id}`, {
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application-json'
            }
        })
            .then(function (response)  {
                callback(response.data);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    /**
     * onChange function that updates the tempReview state.
     * @param {HTMLInputElement} e Input object which its value is extracted.
     */
    const updateTempReview = e => {
        let review = e.target.value;
        setTempReview(review);
    }

    /** 
     * Used to change the state of the edit review modal from on and off.
    */
    const toggleEditModal = () => {
        setEditModalState(!editModalState);
        setTempRating(null);
        setTempReview('');
    }
      
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
    const updateTempArtist = e => {
        let artistInit = e.target.value;
        let artist = artistInit.replace(' ', '%20'); //Replaces spaces with URL encoding for spaces used in Spotify API call.
        setTempArtist(artist);
    }

    /**
     * onChange function used to update the tempAlbum state.
     * @param {HTMLInputElement} e Input object which its value is extracted.
     */
    const updateTempAlbum = e => {
        const albums = artistSearchResults;
        const index = e.target.selectedIndex -1;
        const selectedAlbum = albums[index];
        const spotifyURL = selectedAlbum['external_urls']['spotify'];
        let artist = ''
        selectedAlbum.artists.forEach(a => {
            artist += (a.name + ' • ');
        });
        if(artist.slice(-2) === '• ')
            artist=artist.slice(0,-3);
        setTempAlbum(selectedAlbum.name);
        setTempArtist(artist);
        setTempURL(selectedAlbum.images[2].url);
        setTempSpotifyURL(spotifyURL);
        setTempDate(selectedAlbum['release_date']);
    }

    /**
     * onChange function used to update the tempRating state.
     * @param {HTMLInputElement} e Inout object which its value is extracted.
     */
    const updateTempRating = e => {
        let rating = (e.target.value)/10; //formats rating into a range of 0-10 rather than 0-100.
        rating = rating.toPrecision(2)
        rating = Math.round(rating/.5)*.5;
        setTempRating(rating);
    }

    /**
     * Handles the state of the login modal, toggling it on and off.
     */
    const toggleLoginModal = () => {
        setLoginModalState(!loginModalState);
        setInPass('');
    }

    /**
     * Handles updating the currently typed password and setting the inPass state.
     * @param {HTMLInputElement} e Input object which its value is extracted.
     */
    const updatePassState = e => {
        let pass = e.target.value;
        setInPass(pass);
    }

    return (
        <Container>
            <h1>Music Rating</h1>
            <Navbar
                hiddenState={hiddenState}
                toggleLoginModal={toggleLoginModal}
                toggleAddModal={toggleAddModal}
                toggleEditModal={toggleEditModal}
            />
      
            <LoginModal
                toggleLoginModal={toggleLoginModal}
                loginModalState={loginModalState}
                updatePassState={updatePassState}
                hiddenState={hiddenState}
                setHiddenState={setHiddenState}
                inPass={inPass}
            />

            <EditRatingModal
                editModalState={editModalState}
                toggleEditModal={toggleEditModal}
                tempRating={tempRating}
                tempReview={tempReview}
                editIndex={editIndex}
                updateTempRating={updateTempRating}
                updateTempReview={updateTempReview}
                originalEntries={originalEntries}
            />
      
            <RatingTable entries={entries} />
      
            <AddRatingModal
                artistSearchResults={artistSearchResults}
                setArtistSearchResults={setArtistSearchResults}
                tempArtist={tempArtist}
                tempRating={tempRating}
                tempAlbum={tempAlbum}
                entries={entries}
                tempReview={tempReview}
                tempURL={tempURL}
                tempSpotifyURL={tempSpotifyURL}
                tempDate={tempDate}
                addModalState={addModalState}
                toggleAddModal={toggleAddModal}
                accessToken={accessToken}
                updateTempAlbum={updateTempAlbum}
                updateTempArtist={updateTempArtist}
                updateTempRating={updateTempRating}
                updateTempReview={updateTempReview}
            />
        </Container>
    );
}
export default Home;