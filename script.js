const gallaryContainter = document.querySelector(".gallary-container");
const gallaryLoading = document.querySelector(".gallary-loading");
const gallaryVideo = document.querySelector(".gallary-video");
const gallaryContent = document.querySelector(".gallary-content");
const contentTitle = document.querySelector(".content-title");
const contentDescription = document.querySelector(".content-description");
const contentCopyright = document.querySelector(".content-copyright");
const contentOwner = document.querySelector(".content-owner");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");

const API_KEY = "17eFLQMQpMTycKUNGHZjoyNum4HarzvikaUAPQX9"; // todo: hide the api key
const baseURL = "https://api.nasa.gov/planetary/apod";
const OFFSET = 20; // Determines how many pictures are loaded

const maxDate = new Date(); // Current date
const minDate = new Date(1995, 6, 16); // June 16, 1995
const maxDay = maxDate.getDate();
const minDay = minDate.getDate();

let year = maxDate.getFullYear(); // Today's year
let month = maxDate.getMonth(); // Today's month
let day = maxDate.getDate(); // Today's day

let articles = {};

function addDataToLocalStorage(data) {
  // console.log(data);
  for (let article of data) {
    const date = new Date(article.date + "T00:00:00"); // T00:00:00 avoid issue of no timezone
    const dateString = date.toLocaleDateString();

    articles[dateString] = article;
    localStorage.setItem(dateString, JSON.stringify(article)); // Convert data to string and store it in local storage
  }
}

async function getMultiplePicturesOfTheDay(startDate, endDate) {
  const params = new URLSearchParams({
    start_date: endDate.toLocaleDateString(), // start date can't be today
    end_date: startDate.toLocaleDateString(), // NASA APOD API accepts dates only in YYYY-MM-DD format
    api_key: API_KEY,
  });
  const response = await fetch(`${baseURL}?${params}`);

  if (response.status !== 200) {
    console.warn(`API Error: ${response.statusText}`);
    return;
  }

  response.json().then((data) => {
    if (data.error) {
      console.warn(data.error.message);
      return;
    }

    addDataToLocalStorage(data);
  });
}

function setGallaryContent(article) {
  gallaryVideo.src = ""; // Stops the video from playing when style="display: none";
  gallaryContent.src = article.url ?? "";
  gallaryContent.alt = article.title ?? "";
  gallaryContent.style.display = "block"; // show image
  gallaryVideo.style.display = "none"; // hide video
}

function setGallaryVideo(article) {
  gallaryVideo.src = article.url ?? "";
  gallaryContent.style.display = "none"; // hide image
  gallaryVideo.style.display = "block"; // show video
}

function setHTMLContentFromLocalStorage(date) {
  const dateString = date.toLocaleDateString();
  let article = articles[dateString];

  gallaryLoading.style.visibility = "visible"; // Show the loading screen
  if (!article && !localStorage.getItem(dateString)) return;

  article = JSON.parse(localStorage.getItem(dateString));

  // Check if the media is an image or video
  if (article.media_type === "image") setGallaryContent(article);
  else setGallaryVideo(article);

  contentTitle.textContent = article.title;
  contentDescription.textContent = article.explanation;
  contentOwner.textContent = article.copyright ?? "NASA"; // Set content owner to NASA because we use their data
}

function errorCheckedDate(date) {
  // Check if the date is the future date
  if (date > maxDate) {
    date = maxDate; // set date to today's date
    day = maxDay; // set day to the today's day
  }

  // Check if the date is beond the past
  if (date < minDate) {
    date = minDate; // set date to the existent past
    day = minDay; // set day to the existent past day
  }
  return date;
}

async function loadNextOrPrevPicture() {
  const date = errorCheckedDate(new Date(year, month, day));
  const nextDate = errorCheckedDate(new Date(year, month, day - 1));

  // Request next data if the next date is not in the local storage
  // TODO: Make the loading and prevent user from switching image
  if (!localStorage.getItem(nextDate.toLocaleDateString())) {
    const startDate = nextDate;
    const endDate = new Date(year, month, day - OFFSET);
    await getMultiplePicturesOfTheDay(startDate, endDate);
  }

  setHTMLContentFromLocalStorage(date);
}

async function setInitialPictureOfTheDay() {
  // Check if today's date article is stored in local storage
  if (!localStorage.getItem(maxDate.toLocaleDateString())) {
    const startDate = new Date();
    const endDate = new Date(year, month, day - OFFSET);
    await getMultiplePicturesOfTheDay(startDate, endDate);
  }

  setHTMLContentFromLocalStorage(maxDate);
}

prevBtn.addEventListener("click", async () => {
  day += 1;
  await loadNextOrPrevPicture();
});

nextBtn.addEventListener("click", async () => {
  day -= 1;
  await loadNextOrPrevPicture();
});

document.addEventListener("keydown", async (event) => {
  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
    if (event.key === "ArrowRight") day -= 1;
    if (event.key === "ArrowLeft") day += 1;
    await loadNextOrPrevPicture();
  }
});

// Removes the loading screen when the image/video was loaded
gallaryContent.onload = () => (gallaryLoading.style.visibility = "hidden");
gallaryVideo.onload = () => (gallaryLoading.style.visibility = "hidden");

// Replaces template article with today's when the page is loaded
window.onload = setInitialPictureOfTheDay();
