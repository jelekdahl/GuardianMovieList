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
  movieListDiv.classList.add('d-none');

  const movieListSpinner = document.getElementById('movieListSpinner');
  movieListSpinner.classList.remove('d-none');

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

    let movieButton = movieCard.querySelector('.je-button');
    movieButton.setAttribute('data-movieId', movie.id);
    movieButton.setAttribute('data-movieRank', i + 1);

    movieListDiv.appendChild(movieCard);
  }

  movieListSpinner.classList.add('d-none');
  movieListDiv.classList.remove('d-none');
}

async function showMovieDetails(clickedBtn) {
  const modalBody = document.getElementById('modalBody');
  modalBody.classList.add('d-none');

  const modalSpinner = document.getElementById('modalSpinner');
  modalSpinner.classList.remove('d-none');

  // get the ID of the movie that was clicked
  let movieId = clickedBtn.getAttribute('data-movieId');

  // get the details of the movie with that ID from TMDB API
  let movie = await getMovie(movieId);

  // put those details into my modal
  modalBody.style.backgroundImage = getStrImgBG(movie);
  document.getElementById('movieDate').innerText = getYear(movie);
  document.getElementById('movieCert').innerText = await getCert(movieId);
  document.getElementById('movieTime').innerText = getHM(movie);
  document.getElementById('movieScore').innerText = getScoreStr(movie);
  document.getElementById('movieVotes').innerHTML = getVoteStr(movie);
  document.getElementById('movieRank').innerText = rankFromBtn(clickedBtn);
  document.getElementById('movieModalLabel').textContent = movie.title;
  document.getElementById('movieTitle').textContent = movie.title;
  displayGenreLabels(movie, 'movieGenres');
  displayTagline(movie, 'movieTagline');
  document.getElementById('movieOverview').innerText = movie.overview;
  document.getElementById('moviePoster').src = getPosterPath(movie);

  let modalFooter = document.getElementById('movieModal').querySelector('.modal-footer');
  let btnVisit = modalFooter.querySelector('a');
  setSiteBtnVisibility(movie, btnVisit);

  modalSpinner.classList.add('d-none');
  modalBody.classList.remove('d-none');
}

function getStrImgBG(movie) {
  let strImgBG = 'linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75))';

  if (movie.backdrop_path) {
    strImgBG += `, url(https://image.tmdb.org/t/p/w500${movie.backdrop_path})`;
  }

  return strImgBG;
}

function displayGenreLabels(movie, containerId) {
  let containerElement = document.getElementById(containerId);
  containerElement.innerHTML = '';

  let genres = movie.genres;
  if (genres) {
    for (let i = 0; i < genres.length; i++) {
      let newSpan = document.createElement('span');
      newSpan.classList.add('genre')
      newSpan.innerText = genres[i].name;
      containerElement.appendChild(newSpan);
    }
  }
}

function displayTagline(movie, containerId) {
  let containerElement = document.getElementById(containerId);
  containerElement.innerText = `"${movie.tagline}"`;

  if (movie.tagline) {
    containerElement.classList.remove('d-none');
    containerElement.classList.add('d-block');
  }
  else {
    containerElement.classList.remove('d-block');
    containerElement.classList.add('d-none');
  }
}

function getScoreStr(movie) {
  let score = Math.round(movie.vote_average * 10) / 10;
  return score.toFixed(1) + '/10';
}

function getVoteStr(movie) {
  let compactFormat = Intl.NumberFormat(
    'en-US',
    { notation: "compact", maximumFractionDigits: 1 }
  );

  return compactFormat.format(movie.vote_count) + ' vote'
    + (movie.vote_count != 1 ? 's' : '');
}

function rankFromBtn(btn) {
  return '#' + btn.getAttribute('data-movieRank');
}

function getPosterPath(movie) {
  return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
}

function setSiteBtnVisibility(movie, siteBtn) {
  if (movie.homepage) {
    siteBtn.classList.remove('invisible');
    siteBtn.href = movie.homepage;
  } else {
    siteBtn.classList.add('invisible');
    siteBtn.href = '';
  }
}

function getYear(movie) {
  let movieDate = new Date(movie.release_date);
  return movieDate.getFullYear();
}

function getHM(movie) {
  return '' + Math.floor(movie.runtime / 60) + 'h ' + (movie.runtime % 60) + 'm';
}

async function getCert(movieId) {
  let cert = 'MPA Rating Unknown';
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
        let latestDate, releaseDate;

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