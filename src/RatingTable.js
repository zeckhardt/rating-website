import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

const RatingTable = ({ entries }) => {
  const [popoverOpen, setPopoverOpen] = useState({});
  const popoverRef = useRef(null);

  /**
   * Toggles the visibility of a popover
   * @param {string} id - The popover ID to toggle
   */
  const togglePopover = useCallback((id) => {
    setPopoverOpen((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setPopoverOpen({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setPopoverOpen({});
      }
    });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleClickOutside);
    };
  }, []);

  /**
   * Gets the appropriate button color class based on rating
   * @param {number} rating - The album rating
   * @returns {string} Bootstrap button class
   */
  const getRatingColorClass = useCallback((rating) => {
    if (rating < 5) return 'btn-danger';
    if (rating < 7) return 'btn-warning';
    return 'btn-success';
  }, []);

  /**
   * Groups albums by artist and calculates averages
   * @returns {Object} Grouped albums with artist averages
   */
  const groupedEntries = useMemo(() => {
    const artistGroups = {};
    
    entries.forEach(album => {
      const artists = album.artistName.split('•').map(artist => artist.trim());
      
      artists.forEach(artist => {
        if (!artistGroups[artist]) {
          artistGroups[artist] = [];
        }
        artistGroups[artist].push(album);
      });
    });

    // Sort artists alphabetically and albums by release date
    const sortedArtists = Object.keys(artistGroups).sort((a, b) => a.localeCompare(b));
    
    sortedArtists.forEach(artist => {
      artistGroups[artist].sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
    });

    return { artistGroups, sortedArtists };
  }, [entries]);

  /**
   * Calculates the average rating for an artist
   * @param {Array} albums - Array of albums for the artist
   * @returns {string} Average rating formatted to 1 decimal place
   */
  const calculateAverageRating = useCallback((albums) => {
    const total = albums.reduce((acc, album) => acc + parseFloat(album.albumRating || 0), 0);
    return (total / albums.length).toFixed(1);
  }, []);

  /**
   * Renders the table rows with grouped artist data
   * @returns {JSX.Element[]} Array of table row elements
   */
  const renderTableRows = useMemo(() => {
    const { artistGroups, sortedArtists } = groupedEntries;
    const rows = [];
    let rowCount = 1;

    sortedArtists.forEach((artist) => {
      const albums = artistGroups[artist];
      const averageRating = calculateAverageRating(albums);

      // Artist header row
      rows.push(
        <tr key={`artist-${artist}`} className="artist-header">
          <th scope="row" className="text-center">
            <span className="visually-hidden">Artist</span>
          </th>
          <th className="heads" scope="col">{artist}</th>
          <th scope="col">
            <span className="visually-hidden">Album</span>
          </th>
          <th scope="col" className="text-center">{averageRating}</th>
          <th scope="col">
            <span className="visually-hidden">Review</span>
          </th>
        </tr>
      );

      // Album rows for this artist
      albums.forEach((album) => {
        const colorClass = getRatingColorClass(album.albumRating);
        const popoverId = `popover-${rowCount}`;
        const isPopoverOpen = popoverOpen[popoverId];

        rows.push(
          <tr key={`album-${rowCount}`} className="album-row">
            <td className="album-art-cell">
              {album.albumSpotifyURL ? (
                <a 
                  href={album.albumSpotifyURL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label={`Listen to ${album.albumName} by ${album.artistName} on Spotify`}
                >
                  <img 
                    src={album.albumArtURL}
                    alt={`${album.albumName} album cover`}
                    className="album-art"
                    loading="lazy"
                  />
                </a>
              ) : (
                <img 
                  src={album.albumArtURL}
                  alt={`${album.albumName} album cover`}
                  className="album-art"
                  loading="lazy"
                />
              )}
            </td>
            <td className="artist-name">{album.artistName}</td>
            <td className="album-name">{album.albumName}</td>
            <td className="rating">{album.albumRating}</td>
            <td className="review-cell">
              <button 
                className={`btn ${colorClass} review-btn`}
                onClick={() => togglePopover(popoverId)}
                aria-expanded={isPopoverOpen}
                aria-describedby={isPopoverOpen ? `${popoverId}-content` : undefined}
                type="button"
                id={`btn-${popoverId}`}
              >
                Review
              </button>
            </td>
          </tr>
        );
        rowCount++;
      });
    });

    return rows;
  }, [groupedEntries, calculateAverageRating, getRatingColorClass, popoverOpen, togglePopover]);

  /**
   * Renders floating popovers for reviews
   * @returns {JSX.Element[]} Array of floating popover elements
   */
  const renderFloatingPopovers = useMemo(() => {
    const { artistGroups, sortedArtists } = groupedEntries;
    const popovers = [];
    let rowCount = 1;

    sortedArtists.forEach((artist) => {
      const albums = artistGroups[artist];
      
      albums.forEach((album) => {
        const popoverId = `popover-${rowCount}`;
        const isPopoverOpen = popoverOpen[popoverId];
        
        if (isPopoverOpen) {
          popovers.push(
            <div 
              key={`floating-${popoverId}`}
              className="floating-popover show"
              role="tooltip"
              id={`${popoverId}-content`}
              ref={popoverRef}
            >
              <div className="popover-header">
                {album.albumName} Review
                <button 
                  className="popover-close-btn"
                  onClick={() => togglePopover(popoverId)}
                  aria-label="Close review"
                  type="button"
                >
                  ×
                </button>
              </div>
              <div className="popover-body">
                {album.albumReview || 'No review available.'}
              </div>
            </div>
          );
        }
        rowCount++;
      });
    });

    return popovers;
  }, [groupedEntries, popoverOpen, togglePopover]);

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">No album ratings found. Add your first rating to get started!</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-responsive">
        <table className="table table-dark" role="table">
          <thead>
            <tr>
              <th scope="col" className="album-art-header">
                <span className="visually-hidden">Album Art</span>
              </th>
              <th scope="col">Artist</th>
              <th scope="col">Album</th>
              <th scope="col" className="rating text-center">Rating</th>
              <th scope="col" className="review-header">
                <span className="visually-hidden">Review</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {renderTableRows}
          </tbody>
        </table>
      </div>
      {renderFloatingPopovers}
    </div>
  );
};

export default RatingTable;