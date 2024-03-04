document.addEventListener("DOMContentLoaded", function () {
    const genresNames = document.querySelectorAll(".genres-name");
    const movieContainer = document.getElementById("movieContainer");

    movieContainer.addEventListener("click", function (event) {
        const clickedElement = event.target;

        if (clickedElement.classList.contains("movie-images")) {
            const selectedMovieId = clickedElement.parentElement.getAttribute("data-movie-id");
            const apiUrl = `/detailMovie/${selectedMovieId}`;
            console.log("API URL:", apiUrl);
        }
    });

    genresNames.forEach((genreName) => {
        genreName.addEventListener("click", function () {
            const selectedGenreId = this.getAttribute("data-genre-id");

            fetch(`/getMoviesByGenre/${selectedGenreId}`)
                .then((response) => response.json())
                .then((movies) => {
                    if (movies.length === 0) {
                        movieContainer.innerHTML = `
                        <div class="movie-Genres">
                            <button class="back-button">
                                <a href="/movies"> <img src="../Icon/back-button.png" alt=""> </a>
                            </button>
                        </div>
                            <h3 class="Alert-Genres">No movies available for the selected genre.</h3>
                        `;
                        return;
                    }

                    const movieHTML = movies
                        .map((movie) => {
                            return `
                                <div class="movie-list" data-genre-id="${movie.GenresID}" data-movie-id="${movie.MovieID}">
                                    <div class="movie-images">
                                        <a href="/detailMovie/${movie.MovieID}">
                                            <img src="${movie.Image}" alt="">
                                        </a>
                                        <div class="title">${movie.Title}</div>
                                    </div>
                                </div>
                            `;
                        })
                        .join("");

                    movieContainer.innerHTML = `
                        <div class="movie-Genres">
                            <button class="back-button">
                                <a href="/movies"> <img src="../Icon/back-button.png" alt=""> </a>
                            </button>
                        </div>
                        ${movieHTML}
                    `;
                })
                .catch((error) => console.error("Error fetching movies:", error));
        });
    });
});