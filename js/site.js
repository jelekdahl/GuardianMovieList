const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3ZjQ1NDc2YmJhYzFlNTYxYjM1OGYwZWMzNTA5ZDliZCIsInN1YiI6IjY1MmVlMTk4MDI0ZWM4MDBlNDQ2ZWNiYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.dB1TN05IM0ZVeeoL6fPAcbbbLU5IYu9IYKQfDtaLMco"

async function getMovies() {
  try {
    let response = await fetch('https://api.themoviedb.org/3/movie/popular', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    let data = await response.json();
    return data;
  } catch (error) {
    Swal.fire({
      backdrop: false,
      title: 'Oops!',
      text: 'Something went wrong reaching the TMDB API.',
      icon: 'error'
    });
  }
}

async function getMovie(movieId) {
  try {
    let response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    let data = await response.json();
    return data;
  } catch (error) {
    Swal.fire({
      backdrop: false,
      title: 'Oops!',
      text: 'Something went wrong reaching the TMDB API.',
      icon: 'error'
    });
  }
}

async function getMovieReleaseDates(movieId) {
  try {
    let response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/release_dates`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    let data = await response.json();
    return data;
  } catch (error) {
    Swal.fire({
      backdrop: false,
      title: 'Oops!',
      text: 'Something went wrong reaching the TMDB API.',
      icon: 'error'
    });
  }
}

async function getMovieVideos(movieId) {
  try {
    let response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    let data = await response.json();
    return data;
  } catch (error) {
    Swal.fire({
      backdrop: false,
      title: 'Oops!',
      text: 'Something went wrong reaching the TMDB API.',
      icon: 'error'
    });
  }
}

async function displayMovies() {
  let data = await getMovies();

  const movieListDiv = document.getElementById('movie-list');
  movieListDiv.innerHTML = '';
  const moviePosterTemplate = document.getElementById('movie-card-template');

  let movies = data.results;

  for (let i = 0; i < movies.length; i++) {
    let movie = movies[i];
    let movieCard = moviePosterTemplate.content.cloneNode(true);

    let movieImgElement = movieCard.querySelector('.card-img-top');
    movieImgElement.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

    let movieTitleElement = movieCard.querySelector('.card-body > h5');
    movieTitleElement.textContent = movie.title;

    let movieParagraphElement = movieCard.querySelector('.card-text');
    movieParagraphElement.textContent = movie.overview;

    let movieButton = movieCard.querySelector('.btn-primary');
    movieButton.setAttribute('data-movieId', movie.id);
    movieButton.setAttribute('data-movieRank', i + 1);

    movieListDiv.appendChild(movieCard);
  }
}

async function showMovieDetails(clickedBtn) {

  // get the ID of the movie that was clicked
  let movieId = clickedBtn.getAttribute('data-movieId');

  // get the details of the movie with that ID from TMDB API
  let movie = await getMovie(movieId);

  // put those details into my modal
  let modal = document.getElementById('movieModal');

  document.getElementById('movieModalLabel').textContent = movie.title;

  let movieTitleElement = document.getElementById('movieTitle');
  movieTitleElement.textContent = movie.title;

  let movieDate = new Date(movie.release_date);
  document.getElementById('movieDate').innerText = movieDate.getFullYear();

  let movieCert = await getCert(movieId);
  if (!movieCert) movieCert = 'Certification Unknown';
  document.getElementById('movieCert').innerText = movieCert;

  let movieTime = '' + Math.floor(movie.runtime / 60) + 'h ' + (movie.runtime % 60) + 'm';
  document.getElementById('movieTime').innerText = movieTime;
  
  let movieGenresElement = document.getElementById('movieGenres');
  movieGenresElement.innerHTML = '';
  let genres = movie.genres;
  if (genres) {
    for (let i = 0; i < genres.length; i++) {
      let newSpan = document.createElement('span');
      newSpan.classList.add('genre')
      newSpan.innerText = genres[i].name;
      movieGenresElement.appendChild(newSpan);
    }
  }

  let movieTaglineElement = document.getElementById('movieTagline');
  movieTaglineElement.innerText = `"${movie.tagline}"`;

  let movieOverviewElement = document.getElementById('movieOverview');
  movieOverviewElement.innerText = movie.overview;

  let movieScore = Math.round(movie.vote_average * 10) / 10;
  let movieScoreElement = document.getElementById('movieScore');
  movieScoreElement.innerText = movieScore.toFixed(1) + '/10';

  let movieVotes = Math.round(movie.vote_count);
  let movieVotesElement = document.getElementById('movieVotes');
  movieVotesElement.innerHTML = Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(movie.vote_count);

  let movieRankElement = document.getElementById('movieRank');
  movieRankElement.innerText = '#' + clickedBtn.getAttribute('data-movieRank');

  let movieImgElement = document.getElementById('moviePoster');
  movieImgElement.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

  let modalFooter = modal.querySelector('.modal-footer');
  let btnVisit = modalFooter.querySelector('a');
  btnVisit.href = movie.homepage;
}

async function getCert(movieId) {
  let cert, latestDate;

  let data = await getMovieReleaseDates(movieId);
  
  if (data) {
    let results = data.results;

    if (results) {
      let releaseDates;

      for (let i = 0; i < results.length; i++) {
        if (results[i].iso_3166_1 === 'US') {
          releaseDates = results[i].release_dates;
          break;
        }
      }

      if (releaseDates) {
        let releaseDate;
        for (let i = 0; i < releaseDates.length; i++) {
          releaseDate = new Date(releaseDates[i].release_date);

          if (releaseDate && (!latestDate || latestDate < releaseDate)) {
            cert = releaseDates[i].certification;
            latestDate = releaseDate;
          }
        }
      }
    }
  }

  return cert;
}