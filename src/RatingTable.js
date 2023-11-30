import React from "react";
import {Table, Button, UncontrolledPopover, PopoverHeader, PopoverBody} from 'reactstrap';

const RatingTable = ({entries}) => {

    /**
     * Iterates through the array of album reviews and creates table entries for each of them with all the embedded data.
     * @returns An array of HTMLTableRow elements.
     */
    const parseEntries = () => {
        let list = entries.slice();
         let componets = [];
         let dir = {};
 
         list.forEach(album => {
             let artists = album.artistName.split('•')
             artists.forEach(artist => {
                 artist = artist.trim();
                 if(dir.hasOwnProperty(artist))
                     dir[artist].push(album);
                 else
                     dir[artist] = [album];
             })
         });
 
 
         //sort the keys
         let count = 1;
         let keys = Object.keys(dir);
         keys.sort((a,b) => {
             return a.localeCompare(b);
         });
         //sort the values
         Object.keys(dir).forEach(artist => {
             dir[artist].sort((a,b) => {
                 return new Date(b.releaseDate) - new Date(a.releaseDate);
             });
         });
 
         //Don't need to list this
         keys.splice(keys.indexOf('KAYTRAMINÉ'), 1);
 
         keys.forEach(artist => {
             const avg = (dir[artist].reduce((accumulator, object) => {
                 return accumulator + object.albumRating;
             }, 0) / dir[artist].length).toFixed(1);
             componets.push(
                 <tr>
                     <th/>
                     <th className="heads">{artist}</th>
                     <th/>
                     <th>{avg}</th>
                     <th/>
                 </tr>
             );
             dir[artist].forEach(entry => {
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
                         <a href={entry.albumSpotifyURL} target="_blank" rel="noreferrer">
                             <img src={entry.albumArtURL} alt="Cover"  height="60" width="60" style={{display: "block", marginLeft: 'auto', marginRight: 'auto'}}></img>
                         </a>
                     </td>
                     <td>{entry.artistName}</td>
                     <td>{entry.albumName}</td>
                     <td className="rating">{entry.albumRating}</td>
                     <td className="pop-over" width="100">
                         <Button color={color} style={{fontSize: "large"}} id={"popoverClick" +count}>Review</Button>
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
         });
         return componets;
    }

    return(
        <Table dark>
            <thead>
                <tr>
                    <th/>
                    <th>Artist</th>
                    <th>Album</th>
                    <th className="rating">Rating</th>
                    <th/>
                </tr>
            </thead>
            <tbody>
                {parseEntries()}
            </tbody>
        </Table>
    );
};

export default RatingTable;