import React from 'react';

const Navbar = ({ 
  isAuthenticated, 
  onLoginClick, 
  onAddClick, 
  onEditClick 
}) => {
  return (
    <nav className="nav-bar" role="navigation" aria-label="Main navigation">
      {isAuthenticated ? (
        <>
          <button 
            className="nav-button btn btn-secondary" 
            onClick={onAddClick}
            type="button"
            aria-label="Add a new album rating"
          >
            Add Rating
          </button>
          {/* Uncomment when EditRatingModal is updated
          <button 
            className="nav-button btn btn-secondary" 
            onClick={onEditClick}
            type="button"
            aria-label="Edit an existing rating"
          >
            Edit Rating
          </button> */}
        </>
      ) : (
        <button 
          className="nav-button btn btn-secondary" 
          onClick={onLoginClick}
          type="button"
          aria-label="Login to access rating features"
        >
          Login
        </button>
      )}
    </nav>
  );
};

export default Navbar;