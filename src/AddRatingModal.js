import React, { useState, useCallback } from 'react';
import axios from 'axios';

const AddRatingModal = ({
  artistSearchResults,
  onArtistSearchResultsChange,
  formData,
  isOpen,
  onToggle,
  onAlbumChange,
  onArtistChange,
  onRatingChange,
  onReviewChange
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchError, setSearchError] = useState(null);

  /**
   * Searches for albums by a specific artist using Spotify API
   * @param {Object} artistData - Artist data from Spotify search
   */
  const searchAlbums = useCallback(async (artistData) => {
    try {
      const artistId = artistData.data.artists.items[0]?.id;
      if (!artistId) {
        throw new Error('Artist not found');
      }

      const response = await axios.get(`https://zeckhardt.pythonanywhere.com/spotify/${artistId}`);
      
      if (!response.data) {
        throw new Error('No albums found for this artist');
      }

      // Filter and deduplicate albums
      const lookup = new Set();
      const uniqueAlbums = response.data.filter(entry => {
        if (entry.album_type === 'album' && !lookup.has(entry.name)) {
          lookup.add(entry.name);
          return true;
        }
        return false;
      });

      onArtistSearchResultsChange(uniqueAlbums);
      setSearchError(null);
    } catch (error) {
      console.error('Error searching albums:', error);
      setSearchError('Failed to load albums. Please try again.');
      onArtistSearchResultsChange([]);
    }
  }, [onArtistSearchResultsChange]);

  /**
   * Searches for artist and their albums
   */
  const handleArtistSearch = useCallback(async () => {
    if (!formData.artist.trim()) {
      setSearchError('Please enter an artist name');
      return;
    }

    try {
      setIsSearching(true);
      setSearchError(null);
      
      const response = await axios.get(`https://zeckhardt.pythonanywhere.com/spotify/artists/${formData.artist}`);
      
      if (!response.data?.artists?.items?.length) {
        throw new Error('Artist not found');
      }
      
      await searchAlbums(response);
    } catch (error) {
      console.error('Error searching artist:', error);
      setSearchError('Artist not found. Please check the spelling and try again.');
    } finally {
      setIsSearching(false);
    }
  }, [formData.artist, searchAlbums]);

  /**
   * Renders album options for the select dropdown
   * @returns {JSX.Element[]} Array of option elements
   */
  const renderAlbumOptions = useCallback(() => {
    const options = [
      <option value="" disabled key="default">
        {artistSearchResults.length > 0 ? 'Select an album' : 'Search for an artist first'}
      </option>
    ];
    
    artistSearchResults.forEach((album, index) => {
      options.push(
        <option key={`${album.id}-${index}`} value={album.name}>
          {album.name}
        </option>
      );
    });
    
    return options;
  }, [artistSearchResults]);

  /**
   * Submits the new album rating to the database
   * @param {Event} e - Form submit event
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.album || !formData.artist || !formData.rating) {
      setSearchError('Please fill in all required fields (artist, album, and rating)');
      return;
    }

    try {
      setIsSubmitting(true);
      setSearchError(null);
      
      const payload = {
        albumArtURL: formData.imageUrl,
        albumSpotifyURL: formData.spotifyUrl,
        albumName: formData.album,
        albumRating: formData.rating,
        albumReview: formData.review,
        artistName: formData.artist,
        releaseDate: formData.releaseDate
      };

      await axios.post('https://zeckhardt.pythonanywhere.com/album', payload);
      
      // Success - close modal and refresh data
      onToggle();
      // Note: In a real app, you'd want to refresh the entries list here
      
    } catch (error) {
      console.error('Error adding entry:', error);
      setSearchError('Failed to save the rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onToggle]);
    
  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" role="dialog" aria-labelledby="addRatingModalTitle">
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="addRatingModalTitle">Add a Rating</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onToggle}
              aria-label="Close"
            ></button>
          </div>
          
          <div className="modal-body">
            {searchError && (
              <div className="alert alert-danger" role="alert">
                {searchError}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="artistInput" className="form-label">
                  Artist Name <span className="text-danger">*</span>
                </label>
                <div className="d-flex gap-2">
                  <input 
                    id="artistInput"
                    type="search" 
                    className="form-control" 
                    value={formData.artist.replace('%20', ' ')}
                    onChange={onArtistChange}
                    placeholder="Enter artist name"
                    disabled={isSearching}
                    required
                  />
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleArtistSearch}
                    disabled={isSearching || !formData.artist.trim()}
                  >
                    {isSearching ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Searching...
                      </>
                    ) : (
                      'Search'
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="albumSelect" className="form-label">
                  Album Name <span className="text-danger">*</span>
                </label>
                <select 
                  id="albumSelect"
                  className="form-select" 
                  value={formData.album}
                  onChange={onAlbumChange}
                  disabled={artistSearchResults.length === 0}
                  required
                >
                  {renderAlbumOptions()}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="ratingRange" className="form-label">
                  Rating: <strong>{formData.rating || '0.0'}</strong> / 10
                  <span className="text-danger">*</span>
                </label>
                <input 
                  id="ratingRange"
                  type="range" 
                  className="form-range" 
                  min="0"
                  max="100"
                  step="5"
                  value={formData.rating ? (formData.rating * 10) : 0}
                  onChange={onRatingChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="reviewTextarea" className="form-label">Review</label>
                <textarea 
                  id="reviewTextarea"
                  className="form-control" 
                  rows="4"
                  value={formData.review}
                  onChange={onReviewChange}
                  placeholder="Share your thoughts about this album..."
                ></textarea>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={isSubmitting || !formData.album || !formData.artist || !formData.rating}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : (
                    'Save Rating'
                  )}
                </button>
                <button 
                  type="button"
                  className="btn btn-danger" 
                  onClick={onToggle}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRatingModal;