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

const maxDate = new Date(); // Current date
const minDate = new Date(1995, 6, 16); // June 16, 1995
const maxDay = maxDate.getDate();
const minDay = minDate.getDate();

let date = maxDate;
let year = date.getFullYear();
let month = date.getMonth();
let day = date.getDate();

function formatDateObject(date) {
  dateString = date.toLocaleDateString();
  reversedDateStringArray = dateString.split("/").reverse();
  return `${reversedDateStringArray[0]}-${reversedDateStringArray[2]}-${reversedDateStringArray[1]}`;
}

async function getMultiplePicturesOfTheDay(startDate, endDate) {
  const params = new URLSearchParams({
    start_date: formatDateObject(endDate), // start date can't be before today's date
    end_date: formatDateObject(startDate),
    api_key: API_KEY,
  });
  const response = await fetch(`${baseURL}?${params}`);
  const data = response.json();
  return data;
}

function addDataToLocalStorage(data) {
  for (let article of data) {
    const date = new Date(article.date + "T00:00:00");
    const dateString = date.toLocaleDateString();

    // console.log(dateString);
    localStorage.setItem(dateString, JSON.stringify(article));
  }
}

function setHTMLContentFromLocalStorage(date) {
  const article = JSON.parse(localStorage.getItem(date.toLocaleDateString()));

  // console.log(date.toLocaleDateString());
  // console.log(article);

  if (!article) return; // Check if article exists

  if (article.media_type === "image") {
    gallaryContent.alt = article.title;
    gallaryContent.src = article.url;
    gallaryVideo.style.display = "none";
    gallaryContent.style.display = "block";
  }

  if (article.media_type === "video") {
    gallaryVideo.src = article.url;
    gallaryContent.style.display = "none";
    gallaryVideo.style.display = "block";
  }

  contentTitle.textContent = article.title;
  contentDescription.textContent = article.explanation;

  if (article.copyright) {
    contentOwner.textContent = article.copyright;
    contentCopyright.style.visibility = "visible";
  } else {
    contentCopyright.style.visibility = "hidden";
  }
}

async function loadInitialPicturesOfTheDay() {
  const startDate = maxDate;
  const endDate = new Date(year, month, day - OFFSET);
  const data = await getMultiplePicturesOfTheDay(startDate, endDate);

  // console.log(data);

  if (data.error) {
    console.warn(data.error.message);
    return;
  }

  addDataToLocalStorage(data);
  setHTMLContentFromLocalStorage(startDate);
}

function errorCheckedDate(date) {
  if (date > maxDate) {
    date = maxDate;
    day = maxDay;
  }

  if (date < minDate) {
    date = minDate;
    day = minDay;
  }
  return date;
}

prevBtn.addEventListener("click", () => {
  day += 1;
  date = errorCheckedDate(new Date(year, month, day));
  setHTMLContentFromLocalStorage(date);
});

nextBtn.addEventListener("click", () => {
  day -= 1;
  date = errorCheckedDate(new Date(year, month, day));
  setHTMLContentFromLocalStorage(date);
});

window.onload = loadInitialPicturesOfTheDay();
