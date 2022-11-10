import React, {Component} from "react";
import axios from 'axios';
import jimmyJohn from './gloob';
import { Buffer } from "buffer";
import spotifyConfig from "./SpotifyConfig";
import { getDatabase, ref, set, onValue, update } from "firebase/database";
import { Container, Row, Table, Button, ModalHeader, ModalBody, Label, Modal, Input, Form, ModalFooter, UncontrolledPopover, PopoverHeader, PopoverBody, Col } from "reactstrap";


export default class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            addModalState: false,
            editModalState: false,
            loginModalState: false,
            hiddenState: true,
            inPass: "",
            tempAlbum: "",
            tempArtist: "",
            tempRating: null,
            tempReview: "",
            tempURL: "",
            entries: [],
            accessToken: "",
            artistSearchResults: [],
            editIndex: null,
            originalEntries: [],
        }

        //Bindings
        this.toggleAddModal = this.toggleAddModal.bind(this);
        this.toggleEditModal = this.toggleEditModal.bind(this);
        this.updateTempAlbum = this.updateTempAlbum.bind(this);
        this.updateTempArtist = this.updateTempArtist.bind(this);
        this.updateTempRating = this.updateTempRating.bind(this);
        this.addEntry = this.addEntry.bind(this);
        this.updateTempReview = this.updateTempReview.bind(this);
        this.getAccessToken = this.getAccessToken.bind(this);
        this.getAlbum = this.getAlbum.bind(this);
        this.getArtistResults = this.getArtistResults.bind(this);
        this.makeEditSelection = this.makeEditSelection.bind(this);
        this.updateReview = this.updateReview.bind(this);
        this.toggleLoginModal = this.toggleLoginModal.bind(this);
        this.updatePassState = this.updatePassState.bind(this);
        this.loginHandler = this.loginHandler.bind(this);
    }


    componentDidMount() {
        const db = getDatabase();
        const starCountRef = ref(db, 'musicRatings/');
        onValue(starCountRef, (snapshot) => {
            const data = snapshot.val();
            this.setState({
                entries: data,
                originalEntries: data
            });
        });
        this.getAccessToken();
    }

    /**
     * Makes a post request to the Spotify API to get an access token string used for further API requests.
     */
    getAccessToken() {

        const serialize = function(obj) {
            var str = [];
            for (var p in obj) {
                if (obj.hasOwnProperty(p)) {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
            }
            return str.join("&");
        }
      
        axios.post('https://accounts.spotify.com/api/token',
                serialize({
                    grant_type: 'client_credentials'
                }), {
                headers: {
                    'Authorization': 'Basic ' + (new Buffer.from(spotifyConfig.clientId + ':' + spotifyConfig.clientSecret).toString('base64')),
                }
            })
            .then(response => this.setState({
                accessToken: response.data.access_token,
            }))
            .catch(error => {
                console.log(error);
            });
    }

    /**
     * Retrieves a list of albums for a given artst using the Spotify API.
     * @param {Number} id The numerical representation of the queried artist.
     * @param {Function} callback Callback function that uses the response data as a parameter.
     */
    getAlbum(id, callback) {
        axios.get(`https://api.spotify.com/v1/albums/${id}`, {
            headers: {
                'Authorization': 'Bearer ' + this.state.accessToken,
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
    updateTempReview(e) {
        let review = e.target.value;
        this.setState({
            tempReview: review,
        });
    }

    /** 
     * Used to change the state of the edit review modal from on and off.
    */
    toggleEditModal() {
        this.setState({
            editModalState: !this.state.editModalState,
            tempRating: null,
            tempReview: ""
        });
    }
      
    /**
     * Used to change the state of the add review modal from on and off.
     */
    toggleAddModal() {
        this.setState({
            addModalState: !this.state.addModalState,
            tempAlbum: "",
            tempArtist: "",
            tempRating: null,
            artistSearchResults: []
        });
    }

    /**
     * onChange function used to update the tempArtist state.
     * @param {HTMLInputElement} e Input object which its value is extracted.
     */
    updateTempArtist(e) {
        let artistInit = e.target.value;
        let artist = artistInit.replace(' ', '%20'); //Replaces spaces with URL encoding for spaces used in Spotify API call.
        this.setState({
            tempArtist: artist,
        });
    }

    /**
     * Queries the spotify API for user inputed artist name.
     */
    getArtistResults() {
        let artist = this.state.tempArtist;
        const token = this.state.accessToken;
        const context = this;

        axios.get(`https://api.spotify.com/v1/search?q=artist%3A${artist}&type=artist`, {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application-json'
            }
        })
        .then(function (response) {
            context.searchAlbums(response);
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    /**
     * Queries the Spotify API for all of a certain artist's albums.
     * @param {String} artist The string name of the artist for the query
     */
    searchAlbums(artist) {
        const context = this;
        let lookup = {};
        let output = [];

        axios.get(`https://api.spotify.com/v1/artists/${artist.data.artists.items[0].id}/albums?limit=30&offset=0`,{ 
                headers: {
                    'Authorization': 'Bearer ' + this.state.accessToken,
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
                context.setState({
                    artistSearchResults: output,
                });
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    /**
     * onChange function used to update the tempAlbum state.
     * @param {HTMLInputElement} e Input object which its value is extracted.
     */
    updateTempAlbum(e) {
        const albums = this.state.artistSearchResults;
        const index = e.target.selectedIndex -1;
        const selectedAlbum = albums[index];
        this.setState({
            tempAlbum: selectedAlbum.name,
            tempArtist: selectedAlbum.artists[0].name,
            tempURL: selectedAlbum.images[2].url,
        });
    }

    /**
     * onChange function used to update the tempRating state.
     * @param {HTMLInputElement} e Inout object which its value is extracted.
     */
    updateTempRating(e) {
        let rating = (e.target.value)/10; //formats rating into a range of 0-10 rather than 0-100.
        rating = rating.toPrecision(2)
        rating = this.nearestHalf(rating);
        this.setState({
            tempRating: rating,
        });
    }

    /**
     * Helper function used for rounding to the nearest half number.
     * @param {Number} num Number that is being rounded.
     * @returns A number value rounded to the nearest 0.5.
     */
    nearestHalf(num) {
        return Math.round(num/.5)*.5;
    }

    /**
     * Reads the artistSearchResult state and creates option elements with the names of each album in the results.
     * @returns An array containing HTML option components.
     */
    renderInput() {
        const results = this.state.artistSearchResults;
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
    addEntry() {
        const db = getDatabase();
        set(ref(db, 'musicRatings/' + (this.state.entries.length)), {
            artistName: this.state.tempArtist,
            albumName: this.state.tempAlbum,
            albumRating: this.state.tempRating,
            albumReview: this.state.tempReview,
            albumArtURL: this.state.tempURL,
        });

        this.toggleAddModal();
    }

    /**
     * Iterates through the array of album reviews and creates table entries for each of them with all the embedded data.
     * @returns An array of HTMLTableRow elements.
     */
    parseEntries() {
        let list = this.state.entries.slice();
        let componets = [];

        let count = 1;
        list.sort((a,b) => {
            return a.artistName.localeCompare(b.artistName);
        });
        console.log(list)
        list.forEach(entry => {
            let color = '';
            if(entry.albumRating < 5)
                color = 'danger';
            else if(entry.albumRating < 7)
                color = 'warning';
            else
                color = 'success';

            componets.push(
                <tr key={count++}>
                    <td height="70" width="70" >
                        <img src={entry.albumArtURL} alt="Cover"  height="60" width="60" style={{display: "block", marginLeft: 'auto', marginRight: 'auto'}}></img>
                    </td>
                    <td>{entry.artistName}</td>
                    <td>{entry.albumName}</td>
                    <td class="rating">{entry.albumRating}</td>
                    <td class="pop-over" width="100">
                        <Button color={color} id={"popoverClick" +count}>Review</Button>
                        <UncontrolledPopover placement="bottom" target={"popoverClick" + count} trigger="legacy">
                            <PopoverHeader>
                                {entry.albumName + " review"}
                            </PopoverHeader>
                            <PopoverBody>
                                    {entry.albumReview}
                            </PopoverBody>
                        </UncontrolledPopover>
                    </td>
                </tr>
            );
        });
        return componets;
    }

    /**
     * Loads all the album reviews for selection in an Input Select.
     * @returns An array of HTMLOption elements.
     */
    loadOptions() {
        const albums = this.state.originalEntries;
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
    makeEditSelection(e) {
        this.setState({
            tempRating: this.state.originalEntries[e.target.selectedIndex].albumRating,
            tempReview: this.state.originalEntries[e.target.selectedIndex].albumReview,
            editIndex: e.target.selectedIndex,
        });
    }

    /**
     * Makes an update request to the database to update the albumRating and albumReview values.
     */
    updateReview() {
        const db = getDatabase();
        update(ref(db, 'musicRatings/' + (this.state.editIndex)), {
            albumRating: this.state.tempRating,
            albumReview: this.state.tempReview,
        });
        this.toggleEditModal();
    }

    toggleLoginModal() {
        this.setState({
            loginModalState: !this.state.loginModalState,
            inPass: "",
        });
    }

    updatePassState(e) {
        let pass = e.target.value;
        this.setState({
            inPass: pass,
        });
    }

    loginHandler() {
        if(this.state.inPass === jimmyJohn) {
            this.toggleLoginModal();
            this.setState({
                hiddenState: !this.state.hiddenState,
            });
        } 
    }

    render() {
        return(
            <Container>
                <Row />                    
                <Row lg={5}></Row>
                    <h1>
                        Music Rating
                    </h1>
                <Row>
                    <div id="nav-bar">
                        <button hidden={this.state.hiddenState} class="nav-button" id="add-rating" onClick={this.toggleAddModal}>
                            Add a Rating
                        </button>
                        <button hidden={!this.state.hiddenState} class="nav-button" id="login-b" onClick={this.toggleLoginModal}>
                            Login
                        </button>
                        <button hidden={this.state.hiddenState} class="nav-button" id="edit-rating" onClick={this.toggleEditModal}>
                            Edit Rating
                        </button>
                    </div>
                    <Modal isOpen={this.state.loginModalState} toggle={() => this.toggleLoginModal}>
                        <ModalHeader>
                            Admin Login
                        </ModalHeader>
                        <ModalBody>
                            <Form>
                                <div>
                                    <Label>Admin Login</Label>
                                    <Input type="password" placeholder="Password" id="password" onChange={this.updatePassState} />
                                </div>
                            </Form>
                        </ModalBody>
                        <ModalFooter>
                            <Button color='danger' onClick={this.toggleLoginModal}>Cancel</Button>
                            <Button class="submit-login" id="good-login" onClick={this.loginHandler}>Login</Button>
                        </ModalFooter>
                    </Modal>
                        <Modal isOpen={this.state.editModalState} toggle={()=> this.toggleEditModal}>
                            <ModalHeader>
                                Edit a Review
                            </ModalHeader>
                            <ModalBody>
                                <Form>
                                    <div>
                                        <Label>Album</Label>
                                        <Input type="select" onChange={this.makeEditSelection}>
                                            {this.loadOptions()}
                                        </Input>
                                    </div>
                                    <div>
                                        <Label>Rating: {this.state.tempRating}</Label>
                                        <Input type="range" onChange={this.updateTempRating} defaultValue={this.state.tempRating}/>
                                    </div>
                                    <div>
                                        <Label>Review</Label>
                                        <Input type="textarea" onChange={this.updateTempReview} defaultValue={this.state.tempReview} />
                                    </div>
                                </Form>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="success" onClick={this.updateReview}>Submit</Button>
                                <Button color='danger' onClick={this.toggleEditModal}>Cancel</Button>
                            </ModalFooter>
                        </Modal>
                            <Table striped bordered hover dark>
                                <thead>
                                    <tr>
                                        <th/>
                                        <th>Artist</th>
                                        <th>Album</th>
                                        <th class="rating">Rating</th>
                                        <th/>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.parseEntries()}
                                </tbody>
                            </Table>
                            <Modal isOpen={this.state.addModalState} centered size="lg" toggle={()=> this.toggleAddModal}>
                                <ModalHeader>
                                    Add a Rating
                                </ModalHeader>
                                <ModalBody>
                                    <Form>
                                        <div>
                                            <Label>Artist name</Label>
                                            <Row>
                                                <Col>
                                                    <Input  type="search" onChange={this.updateTempArtist} />
                                                </Col>
                                                <Col>
                                                    <Button onClick={this.getArtistResults}>Submit</Button>
                                                </Col>
                                            </Row>
                                        </div>
                                        <div>
                                            <Label>Album name</Label>
                                            <Input class="loadList" type="select" onChange={this.updateTempAlbum}>
                                                {this.renderInput()}
                                            </Input>
                                        </div>
                                        <div>
                                            <Label>Rating: {this.state.tempRating}</Label>
                                            <Input type="range" onChange={this.updateTempRating} />
                                        </div>
                                        <div>
                                            <Label>Review</Label>
                                            <Input type="textarea" onChange={this.updateTempReview} />
                                        </div>
                                    </Form>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="success" onClick={this.addEntry} >Submit</Button>
                                    <Button onClick={this.toggleAddModal} color="danger" >Cancel</Button>
                                </ModalFooter>
                            </Modal>
                </Row>
            </Container>
        );
    }
}