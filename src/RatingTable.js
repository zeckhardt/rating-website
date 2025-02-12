import React, { useState, useEffect, useRef } from "react";

const RatingTable = ({entries}) => {
  const [popoverOpen, setPopoverOpen] = useState({});
  const popoverRef = useRef(null);

  const togglePopover = (id) => {
    setPopoverOpen((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setPopoverOpen({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

    let count = 1;
    let keys = Object.keys(dir).sort((a, b) => a.localeCompare(b));

    keys.forEach((artist) => {
      dir[artist].sort((a,b) => new Date(b.releaseDate) - new Date(a.releaseDate));

      const avg = (
        dir[artist].reduce((acc, object) => acc + parseFloat(object.albumRating || 0), 0) /
        dir[artist].length
      ).toFixed(1);

      componets.push(
        <tr key={`artist-${artist}`}>
          <th />
          <th className="heads">{artist}</th>
          <th />
          <th>{avg}</th>
          <th />
        </tr>
      );

      dir[artist].forEach((entry) => {
        let colorClass = "";
        if (entry.albumRating < 5) 
          colorClass = "btn-danger";
        else if (entry.albumRating < 7)
          colorClass = "btn-warning";
        else
          colorClass = "btn-success";


        const popoverId = `popover-${count}`;

        componets.push(
          <tr key={count++}>
            <td height="70" width="70">
              <a href={entry.albumSpotifyURL} target="_blank" rel="noreferrer">
                <img 
                  src={entry.albumArtURL}
                  alt="Cover"
                  height="60"
                  width="60"
                  style={{ display: "block", marginLeft: "auto", marginRight: "auto", border: "2px solid #000"}}
                />
              </a>
            </td>
            <td>{entry.artistName}</td>
            <td>{entry.albumName}</td>
            <td className="rating">{entry.albumRating}</td>
            <td className="pop-over" width="100">
              <button 
                className={`btn ${colorClass}`}
                style={{ fontSize: "large"}}
                onClick={() => togglePopover(popoverId)}
              >
                Review
              </button>
              {popoverOpen[popoverId] && (
                <div className="popover fade show bs-popover-bottom" style={{position: "absolute", zIndex: 10, backgroundColor: "#212529", border: "2px solid #FFF"}} ref={popoverRef}>
                  <div className="popover-header" style={{backgroundColor: "#222222"}}>{entry.albumName} review</div>
                  <div className="popover-body">{entry.albumReview}</div>
                </div>
              )}
            </td>
          </tr>
        );
      });
    });
    return componets;
  }

  return(
      <table dark className="table table-dark">
        <thead>
        <tr>
          <th/>
          <th>Artist</th>
          <th>Album</th>
          <th className="rating">Rating</th>
          <th/>
        </tr>
        </thead>
        <tbody>{parseEntries()}</tbody>
      </table>
  );
};

export default RatingTable;