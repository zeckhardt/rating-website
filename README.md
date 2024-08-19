# Music Rating App

This is a React application that allows users to rate and review music albums. It utilizes the Spotify API to retrieve album data and MongoDB to store and retrieve user reviews. All the data is retrieved using the Flask back-end (https://github.com/zeckhardt/music-rating-backend). The application features authentication for restricted access, allowing authorized users to add, edit, and delete album reviews.<br>

## Funtionality
### Add a Rating
+ After logging in, you can add a new rating by clicking the "Add a Rating" button.
+ Enter the artist name in the search input and click the "Submit" button to search for the artist's albums on Spotify.
+ Select an album from the dropdown list.
+ Use the rating slider to choose a rating for the album.
+ Enter your review in the textarea.
+ Click the "Submit" button to add the rating to the database.
### Edit a Review
+ After logging in, you can edit an existing review by clicking the "Edit Rating" button.
+ Select the album you want to edit from the dropdown list.
+ Use the rating slider to change the rating.
+ Update the review in the textarea.
+ Click the "Submit" button to save the changes.
### View Ratings
+ You can view all the ratings in a table format.
+ The table displays the album cover, artist name, album name, rating, and a button to view the review.
+ The ratings are sorted by artist name in alphabetical order, and within each artist, they are sorted by release date in descending order.

## Database

The reviews are stored as objects with the following properties:

+ artistName: The name of the artist.
+ albumName: The name of the album.
+ albumRating: The rating given to the album.
+ albumReview: The review of the album.
+ albumArtURL: The URL of the album cover image.
+ albumSpotifyURL: The Spotify URL of the album.
+ releaseDate: The release date of the album.
