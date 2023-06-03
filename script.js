const gallaryContainter = document.querySelector(".gallary-container");
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
const PRELOAD = 5; // Determines when pictures loaded in a advanced

const LESS_THAN_KEY = 44; // <
const GREATER_THAN_KEY = 46; // >

const maxDate = new Date(); // Current date
const minDate = new Date(1995, 6, 16); // June 16, 1995
const maxDay = maxDate.getDate();
const minDay = minDate.getDate();

let date = maxDate;
let year = date.getFullYear();
let month = date.getMonth();
let day = date.getDate();

let startDate = new Date();
let endDate = new Date(year, month, day - OFFSET);

function formatDateObject(date) {
  dateString = date.toLocaleDateString();
  reversedDateStringArray = dateString.split("/").reverse();
  return `${reversedDateStringArray[0]}-${reversedDateStringArray[2]}-${reversedDateStringArray[1]}`;
}

async function getMultiplePicturesOfTheDay(startDate, endDate) {
  const params = new URLSearchParams({
    start_date: formatDateObject(endDate), // start date can't be today
    end_date: formatDateObject(startDate), // NASA APOD API accepts dates only in YYYY-MM-DD format
    api_key: API_KEY,
  });
  const response = await fetch(`${baseURL}?${params}`);
  const data = response.json();
  return data;
}

function addDataToLocalStorage(data) {
  for (let article of data) {
    const date = new Date(article.date + "T00:00:00"); // T00:00:00 avoid issue of no timezone
    const dateString = date.toLocaleDateString();

    // console.log(dateString);
    // Check if the item already exists
    if (!localStorage.getItem(dateString))
      localStorage.setItem(dateString, JSON.stringify(article)); // Convert data to string and store it in local storage
  }
}

function setHTMLContentFromLocalStorage(date) {
  const article = JSON.parse(localStorage.getItem(date.toLocaleDateString()));

  // console.log(date.toLocaleDateString());
  // console.log(article);

  if (!article) return; // Check if article exists

  gallaryContent.src = article.media_type === "image" ? article.url : "";
  gallaryContent.alt = article.media_type === "image" ? article.title : "";
  gallaryVideo.src = article.media_type === "video" ? article.url : ""; // Stops the video from playing when style="display: none"

  contentTitle.textContent = article.title;
  contentDescription.textContent = article.explanation;
  contentOwner.textContent = article.copyright ? article.copyright : "NASA"; // Set content owner to NASA because we use their data

  // Check if the media is an image or video
  if (article.media_type === "image") {
    gallaryContent.style.display = "block"; // show image
    gallaryVideo.style.display = "none"; // hide video
  } else {
    gallaryContent.style.display = "none"; // hide image
    gallaryVideo.style.display = "block"; // show video
  }
}

async function loadInitialPicturesOfTheDay(startDate, endDate) {
  const data = await getMultiplePicturesOfTheDay(startDate, endDate);

  // console.log(data);
  // Check if the there's an error in API request
  if (data.error) {
    console.warn(data.error.message);
    return;
  }

  addDataToLocalStorage(data);
  setHTMLContentFromLocalStorage(startDate);
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

async function loadNextPicturesOfTheDay(startDate, endDate) {
  const data = await getMultiplePicturesOfTheDay(startDate, endDate);

  // console.log(data);
  if (data.error) {
    console.warn(data.error.message);
    return;
  }

  // console.log(startDate.toLocaleDateString());
  addDataToLocalStorage(data);
}

function loadNextOrPrevPicture(event) {
  // console.log(event.keyCode);
  if (
    event.target.className === "next btn" ||
    event.keyCode === GREATER_THAN_KEY
  )
    day -= 1;

  if (event.target.className === "prev btn" || event.keyCode === LESS_THAN_KEY)
    day += 1;

  date = errorCheckedDate(new Date(year, month, day));

  // console.log(date.toLocaleDateString());
  // console.log(endDate.toLocaleDateString());

  // Modify to fully utilize localStorage (no need to load the images already loaded)
  // There should be a better way to handle this
  if (date.toString() === endDate.toString()) {
    startDate = endDate;
    endDate = new Date(year, month, day - PRELOAD - OFFSET);
    loadNextPicturesOfTheDay(startDate, endDate);
  }

  setHTMLContentFromLocalStorage(date);
}

prevBtn.addEventListener("click", (event) => loadNextOrPrevPicture(event));
nextBtn.addEventListener("click", (event) => loadNextOrPrevPicture(event));
document.addEventListener("keypress", (event) => loadNextOrPrevPicture(event));

window.onload = () => {
  // Check if today's date article is stored in local storage
  if (!localStorage.getItem(maxDate.toLocaleDateString())) {
    localStorage.clear(); // Clear the storage for new data
    console.warn("Local storage was reset!");
    loadInitialPicturesOfTheDay(startDate, endDate);
  }

  setHTMLContentFromLocalStorage(date);
};
