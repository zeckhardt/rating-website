import React, {Component} from "react";
import axios from 'axios';
import { Buffer } from "buffer";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { Card, CardBody, Container, Nav, NavItem,Row, Table, Button, ModalHeader, ModalBody, Label, Modal, Input, Form, ModalFooter, UncontrolledPopover, PopoverHeader, PopoverBody, Col, NavLink } from "reactstrap";


export default class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            addModalState: false,
            editModalState: false,
            tempAlbum: "",
            tempArtist: "",
            tempRating: null,
            tempReview: "",
            tempURL: "",
            entries: [],
            accessToken: "",
            artistSearchResults: [],
        }

        this.toggle = this.toggle.bind(this);
        this.toggle2 = this.toggle2.bind(this);
        this.updateTempAlbum = this.updateTempAlbum.bind(this);
        this.updateTempArtist = this.updateTempArtist.bind(this);
        this.updateTempRating = this.updateTempRating.bind(this);
        this.addEntry = this.addEntry.bind(this);
        this.updateTempReview = this.updateTempReview.bind(this);
        this.getAccessToken = this.getAccessToken.bind(this);
        this.getAlbum = this.getAlbum.bind(this);
        this.getArtistResults = this.getArtistResults.bind(this);
    }

    writeRatingData(artist, album, rating, review, url,ratingId) {
        const db = getDatabase();
        set(ref(db, 'musicRatings/' + ratingId), {
            artistName: artist,
            albumName: album,
            albumRating: rating,
            albumReview: review,
            albumArtURL: url,
        });
      }

    componentDidMount() {
        const db = getDatabase();
        const starCountRef = ref(db, 'musicRatings/');
        onValue(starCountRef, (snapshot) => {
            const data = snapshot.val();
            this.setState({
                entries: data,
            });
            this.updateList(data);
        });
        this.getAccessToken();
    }

    getAccessToken() {
        const clientId = 'c149d4214bc541c388548ecbfa1910e7';
        const clientSecret = 'f556a7cface44607a151118d96ec9fd1';

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
                    'Authorization': 'Basic ' + (new Buffer.from(clientId + ':' + clientSecret).toString('base64')),
                }
            })
            .then(response => this.setState({
                accessToken: response.data.access_token,
            }))
            .catch(error => {
                console.log(error);
            });
    }

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

    updateList(data) {
        this.setState({
            list: data,
        });
    }

    updateTempReview(e) {
        let review = e.target.value;
        this.setState({
            tempReview: review,
        });
    }

    toggle2() {
        this.setState({
            editModalState: !this.state.editModalState,
        });
    }
      
    toggle() {
        this.setState({
            addModalState: !this.state.addModalState,
            tempAlbum: "",
            tempArtist: "",
            tempRating: null
        });
    }

    updateTempArtist(e) {
        let artistInit = e.target.value;
        let artist = artistInit.replace(' ', '%20');
        console.log(artist)
        this.setState({
            tempArtist: artist,
        });
    }

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

    searchAlbums(artist) {
        const context = this;
        axios.get(`https://api.spotify.com/v1/artists/${artist.data.artists.items[0].id}/albums`,{ 
                headers: {
                    'Authorization': 'Bearer ' + this.state.accessToken,
                    'Content-Type': 'application-json'
                }
            })
            .then(function (response) {
                let albums = [];
                response.data.items.forEach(entry => {
                    if(entry.album_type === "album" && !response.data.items.includes(entry.name)) {
                        
                        albums.push(entry);
                    }
                });
                context.setState({
                    artistSearchResults: albums,
                });
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    updateTempAlbum(e) {       
        const albums = this.state.artistSearchResults;
        const index = e.target.selectedIndex;
        const selectedAlbum = albums[index];
        this.setState({
            tempAlbum: selectedAlbum.name,
            tempArtist: selectedAlbum.artists[0].name,
            tempURL: selectedAlbum.images[2].url,
        });
    }

    updateTempRating(e) {
        let rating = (e.target.value)/20;
        this.setState({
            tempRating: rating,
        });
    }

    renderInput() {
        const results = this.state.artistSearchResults;
        let components = [];
        let count =1;
        results.forEach(entry => {
            components.push(
                <option key={count++}>{entry.name}</option>
            );
        });
        return components;
    }

    addEntry() {
        let artist = this.state.tempArtist;
        let album = this.state.tempAlbum;
        let rating = this.state.tempRating;
        let review = this.state.tempReview;
        let list = this.state.entries;
        let url = this.state.tempURL;
        list.push({'artistName': artist, 'albumName':album, 'albumRating': rating});

        this.writeRatingData(artist, album, rating, review, url,list.length-1);
        this.toggle();
    }

    parseEntries() {
        let list = this.state.entries;
        let componets = [];
        let count = 1;
        list.forEach(entry => {
            let color = '';
            if(entry.albumRating <= 1.75)
                color = 'danger';
            else if(entry.albumRating <= 3.5)
                color = 'warning';
            else
                color = 'success';

            componets.push(
                <tr key={count++}>
                    <td height="50" width="50" >
                        <img src={entry.albumArtURL} alt="Cover"  height="50" width="50" style={{display: "block", marginLeft: 'auto', marginRight: 'auto'}}></img>
                    </td>
                    <td>{entry.artistName}</td>
                    <td>{entry.albumName}</td>
                    <td>{entry.albumRating}</td>
                    <td width="100">
                        <Button color={color} id={"popoverClick" +count}>Review</Button>
                        <UncontrolledPopover placement="bottom" target={"popoverClick" + count} trigger="focus">
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

    loadOptions() {
        const albums = this.state.entries;
        let components = [];
        let count = 1;
        albums.forEach(entry => {
            components.push(
                <option id={count++}>{entry.albumName}</option>
            );
        });
        return components;
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
                    <Card>
                        <Nav tabs pills >
                            <NavItem>
                                <NavLink onClick={this.toggle}>
                                    Add a Rating
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink>
                                    Remove Rating
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink onClick={this.toggle2}>
                                    Edit Rating
                                </NavLink>
                            </NavItem>
                        </Nav>
                        <Modal isOpen={this.state.editModalState} toggle={()=> this.toggle2}>
                            <ModalHeader>
                                Edit a Review
                            </ModalHeader>
                            <ModalBody>
                                <Form>
                                    <div>
                                        <Label>Album</Label>
                                        <Input type="select">
                                            {this.loadOptions()}
                                        </Input>
                                    </div>
                                </Form>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="success">Submit</Button>
                                <Button color='danger' onClick={this.toggle2}>Cancel</Button>
                            </ModalFooter>
                        </Modal>
                        <CardBody>
                            <Table striped responsive bordered hover>
                                <thead>
                                    <tr>
                                        <th/>
                                        <th>Artist</th>
                                        <th>Album</th>
                                        <th>Rating</th>
                                        <th/>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.parseEntries()}
                                </tbody>
                            </Table>
                            <Modal isOpen={this.state.addModalState} centered size="lg" toggle={()=> this.toggle}>
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
                                            <Input type="select" onChange={this.updateTempAlbum}>
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
                                    <Button onClick={this.toggle} color="danger" >Cancel</Button>
                                </ModalFooter>
                            </Modal>
                        </CardBody>
                    </Card>
                </Row>
            </Container>
        );
    }
}