import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import AlbumJukebox from './AlbumJukebox';

const RatingTable = ({ entries }) => {
  const [popoverOpen, setPopoverOpen] = useState({});
  const [expandedArtists, setExpandedArtists] = useState({});
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

  /**
   * Toggles the expanded state of an artist row
   * @param {string} artist - The artist name to toggle
   */
  const toggleArtistExpansion = useCallback((artist) => {
    setExpandedArtists((prev) => ({
      ...prev,
      [artist]: !prev[artist]
    }));
  }, []);

  /**
   * Jumps to an album in the table and expands its artist row
   * @param {Object} album - The album to jump to
   */
  const jumpToAlbum = useCallback((album) => {
    // First, expand the artist row if it's not already expanded
    setExpandedArtists((prev) => ({
      ...prev,
      [album.artistName]: true
    }));

    // Wait a brief moment for the DOM to update, then scroll
    setTimeout(() => {
      // Find the album row in the table
      const albumRows = document.querySelectorAll('.album-row');
      let targetRow = null;
      
      albumRows.forEach((row) => {
        const albumNameCell = row.querySelector('.album-name');
        const artistNameCell = row.querySelector('.artist-name');
        
        if (albumNameCell && artistNameCell && 
            albumNameCell.textContent.trim() === album.albumName &&
            artistNameCell.textContent.trim() === album.artistName) {
          targetRow = row;
        }
      });

      if (targetRow) {
        // Scroll to the album row with smooth animation
        targetRow.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // Add a temporary highlight effect
        targetRow.classList.add('highlight-album');
        setTimeout(() => {
          targetRow.classList.remove('highlight-album');
        }, 2000);
      }
    }, 100);
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
   * Renders the table rows with collapsible artist groups
   * @returns {JSX.Element[]} Array of table row elements
   */
  const renderTableRows = useMemo(() => {
    const { artistGroups, sortedArtists } = groupedEntries;
    const rows = [];
    let rowCount = 1;

    sortedArtists.forEach((artist) => {
      const albums = artistGroups[artist];
      const averageRating = calculateAverageRating(albums);
      const isExpanded = expandedArtists[artist];
      const albumCount = albums.length;

      // Artist header row (clickable to expand/collapse)
      rows.push(
        <tr 
          key={`artist-${artist}`} 
          className="artist-header clickable" 
          onClick={() => toggleArtistExpansion(artist)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleArtistExpansion(artist);
            }
          }}
          aria-expanded={isExpanded}
          aria-controls={`artist-albums-${artist}`}
        >
          <th scope="row" className="text-center">
            <span className={`expand-icon ${isExpanded ? 'expanded' : 'collapsed'}`}>
              {isExpanded ? '▼' : '▶'}
            </span>
          </th>
          <th className="heads" scope="col">
            {artist}
          </th>
          <th scope="col" className="album-count-cell">
            {!isExpanded && (
              <span className="album-count">{albumCount} album{albumCount !== 1 ? 's' : ''}</span>
            )}
          </th>
          <th scope="col" className="text-center">{averageRating}</th>
          <th scope="col">
            <span className="visually-hidden">Review</span>
          </th>
        </tr>
      );

      // Album rows for this artist (only show if expanded)
      if (isExpanded) {
        albums.forEach((album) => {
          const colorClass = getRatingColorClass(album.albumRating);
          const popoverId = `popover-${rowCount}`;
          const isPopoverOpen = popoverOpen[popoverId];

          rows.push(
            <tr 
              key={`album-${rowCount}`} 
              className="album-row" 
              id={`artist-albums-${artist}`}
            >
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
      } else {
        // Still increment rowCount for albums even when collapsed to maintain consistent IDs
        rowCount += albums.length;
      }
    });

    return rows;
  }, [groupedEntries, calculateAverageRating, getRatingColorClass, popoverOpen, togglePopover, expandedArtists, toggleArtistExpansion]);

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
      const isExpanded = expandedArtists[artist];
      
      // Only render popovers for expanded artists
      if (isExpanded) {
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
      } else {
        // Still increment rowCount for albums even when collapsed to maintain consistent IDs
        rowCount += albums.length;
      }
    });

    return popovers;
  }, [groupedEntries, popoverOpen, togglePopover, expandedArtists]);



  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">No album ratings found. Add your first rating to get started!</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <AlbumJukebox entries={entries} onAlbumClick={jumpToAlbum} />
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