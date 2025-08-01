import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

const AlbumJukebox = ({ entries, onAlbumClick }) => {
  const [currentJukeboxIndex, setCurrentJukeboxIndex] = useState(0);
  const [activeJukeboxTab, setActiveJukeboxTab] = useState('top'); // 'top' or 'bottom'
  const jukeboxIntervalRef = useRef(null);

  /**
   * Calculates the top 10 highest rated albums
   * @returns {Array} Top 10 albums sorted by rating
   */
  const top10Albums = useMemo(() => {
    if (!entries || entries.length === 0) return [];
    
    return [...entries]
      .sort((a, b) => parseFloat(b.albumRating || 0) - parseFloat(a.albumRating || 0))
      .slice(0, 10);
  }, [entries]);

  /**
   * Calculates the bottom 10 lowest rated albums
   * @returns {Array} Bottom 10 albums sorted by rating (lowest first)
   */
  const bottom10Albums = useMemo(() => {
    if (!entries || entries.length === 0) return [];
    
    return [...entries]
      .sort((a, b) => parseFloat(a.albumRating || 0) - parseFloat(b.albumRating || 0))
      .slice(0, 10);
  }, [entries]);

  /**
   * Gets the current active album list based on selected tab
   * @returns {Array} Current album list (top 10 or bottom 10)
   */
  const currentAlbumList = useMemo(() => {
    return activeJukeboxTab === 'top' ? top10Albums : bottom10Albums;
  }, [activeJukeboxTab, top10Albums, bottom10Albums]);

  // Reset jukebox index when switching tabs
  useEffect(() => {
    setCurrentJukeboxIndex(0);
  }, [activeJukeboxTab]);

  // Auto-rotate jukebox every 4 seconds
  useEffect(() => {
    if (currentAlbumList.length > 1) {
      jukeboxIntervalRef.current = setInterval(() => {
        setCurrentJukeboxIndex((prev) => (prev + 1) % currentAlbumList.length);
      }, 4000);

      return () => {
        if (jukeboxIntervalRef.current) {
          clearInterval(jukeboxIntervalRef.current);
        }
      };
    }
  }, [currentAlbumList.length]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (jukeboxIntervalRef.current) {
        clearInterval(jukeboxIntervalRef.current);
      }
    };
  }, []);

  /**
   * Handles clicking on an album in the jukebox
   * @param {Object} album - The album that was clicked
   */
  const handleAlbumClick = useCallback((album) => {
    if (onAlbumClick) {
      onAlbumClick(album);
    }
  }, [onAlbumClick]);

  // Don't render if no albums
  if (currentAlbumList.length === 0) return null;

  const currentAlbum = currentAlbumList[currentJukeboxIndex];
  
  const getRatingColorClass = (rating) => {
    const numRating = parseFloat(rating || 0);
    if (numRating >= 9) return 'btn-success';
    if (numRating >= 7) return 'btn-warning';
    if (numRating >= 5) return 'btn-secondary';
    return 'btn-danger';
  };

  return (
    <div className="jukebox-container">
      <div className="jukebox-header">
        <div className="jukebox-tabs">
          <button
            className={`jukebox-tab ${activeJukeboxTab === 'top' ? 'active' : ''}`}
            onClick={() => setActiveJukeboxTab('top')}
            aria-pressed={activeJukeboxTab === 'top'}
          >
            <span className="tab-icon"></span>
            Top 10
          </button>
          <button
            className={`jukebox-tab ${activeJukeboxTab === 'bottom' ? 'active' : ''}`}
            onClick={() => setActiveJukeboxTab('bottom')}
            aria-pressed={activeJukeboxTab === 'bottom'}
          >
            <span className="tab-icon"></span>
            Bottom 10
          </button>
        </div>
        <h3 className="jukebox-title">
          <span className="jukebox-icon"></span>
          {activeJukeboxTab === 'top' ? 'Highest' : 'Lowest'} Rated Albums
          <span className="jukebox-counter">{currentJukeboxIndex + 1} / {currentAlbumList.length}</span>
        </h3>
      </div>
      <div className="jukebox-display">
        <div className="jukebox-album">
          <div className="jukebox-album-art">
            {currentAlbum.albumSpotifyURL ? (
              <a 
                href={currentAlbum.albumSpotifyURL}
                target="_blank"
                rel="noopener noreferrer"
                className="jukebox-spotify-link"
                aria-label={`Listen to ${currentAlbum.albumName} by ${currentAlbum.artistName} on Spotify`}
              >
                <img 
                  src={currentAlbum.albumArtURL}
                  alt={`${currentAlbum.albumName} album cover`}
                  className="jukebox-art"
                  loading="lazy"
                />
                <div className="jukebox-spotify-overlay">
                  <span className="spotify-icon">♪</span>
                </div>
              </a>
            ) : (
              <img 
                src={currentAlbum.albumArtURL}
                alt={`${currentAlbum.albumName} album cover`}
                className="jukebox-art"
                loading="lazy"
              />
            )}
          </div>
          <div className="jukebox-info">
            <div 
              className="jukebox-clickable-info"
              onClick={() => handleAlbumClick(currentAlbum)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleAlbumClick(currentAlbum);
                }
              }}
              aria-label={`Jump to ${currentAlbum.albumName} by ${currentAlbum.artistName} in table`}
              title="Click to find this album in the table below"
            >
              <h4 className="jukebox-album-name">{currentAlbum.albumName}</h4>
              <p className="jukebox-artist-name">{currentAlbum.artistName}</p>
            </div>
            <div className="jukebox-rating">
              <span className={`jukebox-rating-badge ${getRatingColorClass(currentAlbum.albumRating)}`}>
                ★ {currentAlbum.albumRating}
              </span>
            </div>
            {currentAlbum.albumReview && (
              <p className="jukebox-review">
                "{currentAlbum.albumReview.length > 100 
                  ? currentAlbum.albumReview.substring(0, 100) + '...' 
                  : currentAlbum.albumReview}"
              </p>
            )}
          </div>
        </div>
        <div className="jukebox-indicators">
          {currentAlbumList.map((_, index) => (
            <button
              key={index}
              className={`jukebox-dot ${index === currentJukeboxIndex ? 'active' : ''}`}
              onClick={() => setCurrentJukeboxIndex(index)}
              aria-label={`Go to album ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlbumJukebox;
