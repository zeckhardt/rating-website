import React, { useEffect, useState, useCallback } from 'react';
import AddRatingModal from './AddRatingModal';
import RatingTable from './RatingTable';
import Navbar from './Navbar';
import EditRatingModal from './EditRatingModal';
import LoginModal from './LoginModal';

const Home = () => {
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Form data states
  const [formData, setFormData] = useState({
    album: '',
    artist: '',
    rating: null,
    review: '',
    imageUrl: '',
    spotifyUrl: '',
    releaseDate: ''
  });
  
  // App data states
  const [entries, setEntries] = useState([]);
  const [artistSearchResults, setArtistSearchResults] = useState([]);
  const [editIndex, setEditIndex] = useState('');
  const [originalEntries, setOriginalEntries] = useState([]);
  const [password, setPassword] = useState('');
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  // Fetch albums on component mount
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('https://zeckhardt.pythonanywhere.com/album');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setEntries(data);
        setOriginalEntries(data);
      } catch (err) {
        console.error('Error fetching albums:', err);
        setError('Failed to load albums. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  // Form data update handlers
  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleReviewChange = useCallback((e) => {
    updateFormData('review', e.target.value);
  }, [updateFormData]);

  const handleArtistChange = useCallback((e) => {
    const artistValue = e.target.value.replace(' ', '%20');
    updateFormData('artist', artistValue);
  }, [updateFormData]);

  const handleAlbumChange = useCallback((e) => {
    const index = e.target.selectedIndex - 1;
    const selectedAlbum = artistSearchResults[index];
    
    if (!selectedAlbum) return;
    
    const spotifyUrl = selectedAlbum.external_urls?.spotify || '';
    const artist = selectedAlbum.artists?.map(a => a.name).join(' • ') || '';
    const imageUrl = selectedAlbum.images?.[2]?.url || '';
    const releaseDate = selectedAlbum.release_date || '';
    
    setFormData({
      ...formData,
      album: selectedAlbum.name,
      artist,
      imageUrl,
      spotifyUrl,
      releaseDate
    });
  }, [artistSearchResults, formData, updateFormData]);

  const handleRatingChange = useCallback((e) => {
    const rating = Math.round((e.target.value / 10) / 0.5) * 0.5;
    updateFormData('rating', rating.toPrecision(2));
  }, [updateFormData]);

  // Modal toggle handlers
  const toggleEditModal = useCallback(() => {
    setIsEditModalOpen(prev => !prev);
    if (!isEditModalOpen) {
      setFormData(prev => ({ ...prev, rating: null, review: '' }));
    }
  }, [isEditModalOpen]);

  const toggleAddModal = useCallback(() => {
    setIsAddModalOpen(prev => !prev);
    if (!isAddModalOpen) {
      setFormData({
        album: '',
        artist: '',
        rating: null,
        review: '',
        imageUrl: '',
        spotifyUrl: '',
        releaseDate: ''
      });
      setArtistSearchResults([]);
    }
  }, [isAddModalOpen]);

  const toggleLoginModal = useCallback(() => {
    setIsLoginModalOpen(prev => !prev);
    if (!isLoginModalOpen) {
      setPassword('');
    }
  }, [isLoginModalOpen]);


  // Error boundary fallback
  if (error) {
    return (
      <div className="container">
        <h1>Album Rating Index</h1>
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Album Rating Index</h1>
      
      <Navbar
        isAuthenticated={isAuthenticated}
        onLoginClick={toggleLoginModal}
        onAddClick={toggleAddModal}
        onEditClick={toggleEditModal}
      />
      
      <LoginModal
        isOpen={isLoginModalOpen}
        onToggle={toggleLoginModal}
        isAuthenticated={isAuthenticated}
        onAuthenticationChange={setIsAuthenticated}
        password={password}
        onPasswordChange={setPassword}
      />
      
      {/* Commented out until EditRatingModal is updated
      <EditRatingModal
        isOpen={isEditModalOpen}
        onToggle={toggleEditModal}
        rating={formData.rating}
        review={formData.review}
        editIndex={editIndex}
        onRatingChange={handleRatingChange}
        onReviewChange={handleReviewChange}
        originalEntries={originalEntries}
      /> */}
      
      {isLoading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <RatingTable entries={entries} />
      )}
      
      <AddRatingModal
        artistSearchResults={artistSearchResults}
        onArtistSearchResultsChange={setArtistSearchResults}
        formData={formData}
        isOpen={isAddModalOpen}
        onToggle={toggleAddModal}
        onAlbumChange={handleAlbumChange}
        onArtistChange={handleArtistChange}
        onRatingChange={handleRatingChange}
        onReviewChange={handleReviewChange}
      />
    </div>
  );
}
export default Home;