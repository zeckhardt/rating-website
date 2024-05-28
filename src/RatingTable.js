import React, { useMemo } from "react";
import {Table, Button, UncontrolledPopover, PopoverHeader, PopoverBody} from "reactstrap";

const RatingTable = ({ entries }) => {
  const parsedEntries = useMemo(() => {
    const dir = new Map();

    entries.forEach((album) => {
      const artists = album.artistName.split("•");
      artists.forEach((artist) => {
        artist = artist.trim();
        if (!dir.has(artist)) {
          dir.set(artist, []);
        }
        dir.get(artist).push(album);
      });
    });

    // Sort the keys
    const keys = Array.from(dir.keys()).sort((a, b) => a.localeCompare(b));

    // Sort the values
    keys.forEach((artist) => {
      dir.get(artist).sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
    });

    return keys.map((artist) => (
      <React.Fragment key={artist}>
        <tr>
          <th />
          <th className="heads">{artist}</th>
          <th />
          <th>
            {(dir.get(artist).reduce((acc, obj) => acc + obj.albumRating, 0) / dir.get(artist).length).toFixed(1)}
          </th>
          <th />
        </tr>
        {dir.get(artist).map((entry, index) => (
          <AlbumRow key={index} entry={entry} />
        ))}
      </React.Fragment>
    ));
  }, [entries]);

  return (
    <Table dark>
      <thead>
        <tr>
          <th />
          <th>Artist</th>
          <th>Album</th>
          <th className="rating">Rating</th>
          <th />
        </tr>
      </thead>
      <tbody>{parsedEntries}</tbody>
    </Table>
  );
};

const AlbumRow = ({ entry }) => {
  const color =
    entry.albumRating < 5 ? "danger" : entry.albumRating < 7 ? "warning" : "success";

  return (
    <tr>
      <td height="70" width="70">
        <a href={entry.albumSpotifyURL} target="_blank" rel="noreferrer">
          <img
            src={entry.albumArtURL}
            alt="Cover"
            height="60"
            width="60"
            style={{ display: "block", marginLeft: "auto", marginRight: "auto" }}
          />
        </a>
      </td>
      <td>{entry.artistName}</td>
      <td>{entry.albumName}</td>
      <td className="rating">{entry.albumRating}</td>
      <td className="pop-over" width="100">
        <Button color={color} style={{ fontSize: "large" }} id={"popoverClick" + entry.id}>
          Review
        </Button>
        <UncontrolledPopover placement="bottom" target={"popoverClick" + entry.id} trigger="legacy">
          <PopoverHeader>{entry.albumName + " review"}</PopoverHeader>
          <PopoverBody>{entry.albumReview}</PopoverBody>
        </UncontrolledPopover>
      </td>
    </tr>
  );
};

export default RatingTable;