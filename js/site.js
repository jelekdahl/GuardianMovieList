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
    console.error(error)
  }
}

async function displayMovies() {
  let data = await getMovies();
  
  const movieListDiv = document.getElementById('movie-list');
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

    movieListDiv.appendChild(movieCard);
  }
}