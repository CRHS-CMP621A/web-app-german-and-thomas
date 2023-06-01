const gallaryContent = document.querySelector(".gallary-content");

const contentTitle = document.querySelector(".content-title");
const contentDescription = document.querySelector(".content-description");
const contentCopyright = document.querySelector(".content-copyright");
const contentOwner = document.querySelector(".content-owner");

const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");

const KEY = "DEMO_KEY"; // todo: hide the api key
const baseURL = "https://api.nasa.gov/planetary/apod";

const maxDate = new Date(); // Current date
const minDate = new Date(1995, 6, 16); // June 16, 1995

const maxDay = maxDate.getDate();
const minDay = minDate.getDate();

let date = maxDate;
let year = date.getFullYear();
let month = date.getMonth();
let day = date.getDate();

let jsonData;

function formatDateObject(date) {
  dateString = date.toLocaleDateString();
  reversedDateStringArray = dateString.split("/").reverse();
  return `${reversedDateStringArray[0]}-${reversedDateStringArray[2]}-${reversedDateStringArray[1]}`;
}

async function getJSON(dateString) {
  const params = new URLSearchParams({
    date: dateString,
    api_key: KEY,
  });
  const response = await fetch(`${baseURL}?${params}`);
  const jsonData = response.json();
  return jsonData;
}

function checkDate(date) {
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

function setHTMLContent(jsonData) {
  contentTitle.textContent = jsonData.title;
  contentDescription.textContent = jsonData.explanation;

  if (jsonData.copyright) {
    contentOwner.textContent = jsonData.copyright;
    contentCopyright.style.visibility = "visible";
  } else {
    contentCopyright.style.visibility = "hidden";
  }
}

async function setInitialHTMLContent() {
  jsonData = await getJSON(formatDateObject(date));
  setHTMLContent(jsonData);
  console.log(jsonData);
}

prevBtn.addEventListener("click", async () => {
  day += 1;
  date = checkDate(new Date(year, month, day));
  jsonData = await getJSON(formatDateObject(date));
  setHTMLContent(jsonData);
  console.log(jsonData);
});

nextBtn.addEventListener("click", async () => {
  day -= 1;
  date = checkDate(new Date(year, month, day));
  jsonData = await getJSON(formatDateObject(date));
  setHTMLContent(jsonData);
  console.log(jsonData);
});

// window.onload = setInitialHTMLContent();
