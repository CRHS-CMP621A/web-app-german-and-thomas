const leftBtn = document.querySelector(".leftBtn");
const rightBtn = document.querySelector(".rightBtn");

const KEY = "DEMO_API"; // todo: hide the api key
const baseURL = "https://api.nasa.gov/planetary/apod";

const maxDate = new Date(); // Current date
const minDate = new Date(1995, 6, 16); // June 16, 1995

const maxDay = maxDate.getDate();
const minDay = minDate.getDate();

let date = maxDate;
let year = date.getFullYear();
let month = date.getMonth();
let day = date.getDate();

leftBtn.addEventListener("click", async () => {
  day -= 1;
  date = new Date(year, month, day);

  if (date < minDate) {
    date = minDate;
    day = minDay;
  }
});

rightBtn.addEventListener("click", async () => {
  day += 1;
  date = new Date(year, month, day);

  if (date > maxDate) {
    date = maxDate;
    day = maxDay;
  }

  await getJSON(
    formatDateObject(date),
    formatDateObject(new Date(year, month, day + 4))
  );
});

function formatDateObject(date) {
  dateString = date.toLocaleDateString();
  reversedDateStringArray = dateString.split("/").reverse();
  return `${reversedDateStringArray[0]}-${reversedDateStringArray[2]}-${reversedDateStringArray[1]}`;
}

async function getJSON(startDate, endDate) {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
    api_key: KEY,
  });
  const response = await fetch(`${baseURL}?${params}`);
  const jsonData = response.json();
  console.log(jsonData);
}
