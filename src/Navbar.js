import React from "react";

const Navbar = ({ hiddenState, toggleAddModal, toggleLoginModal, toggleEditModal}) => {
    return(
        <div id="nav-bar">
            <button hidden={hiddenState} className="nav-button" onClick={toggleAddModal}>
                Add a Rating
            </button>
            <button hidden={!hiddenState} className="nav-button" onClick={toggleLoginModal}>
                Login
            </button>
            <button hidden={hiddenState} className="nav-button" onClick={toggleEditModal}>
                Edit Rating
            </button>
        </div>
    );
};

export default Navbar;