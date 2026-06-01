import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";

// Елементи інтерфейсу
const datetimePicker = document.querySelector('#datetime-picker');
const startBtn = document.querySelector('[data-start]');
const daysField = document.querySelector('[data-days]');
const hoursField = document.querySelector('[data-hours]');
const minutesField = document.querySelector('[data-minutes]');
const secondsField = document.querySelector('[data-seconds]');

let userSelectedDate = null;
let timerId = null;

// Налаштування для flatpickr
const options = {
  enableTime: true,
  time_24hr: true,
  defaultDate: new Date(),
  minuteIncrement: 1,
  onClose(selectedDates) {
    const selectedDate = selectedDates[0];
    
    if (selectedDate <= new Date()) {
      // Якщо дата в минулому — показуємо помилку та деактивуємо кнопку
      iziToast.error({
        title: 'Error',
        message: 'Please choose a date in the future',
        position: 'topRight',
      });
      startBtn.disabled = true;
      userSelectedDate = null;
    } else {
      // Якщо дата валідна — записуємо її та активуємо кнопку
      userSelectedDate = selectedDate;
      startBtn.disabled = false;
    }
  },
};

// Ініціалізація flatpickr
const fpInstance = flatpickr(datetimePicker, options);

// Слухач на кнопку Start
startBtn.addEventListener('click', () => {
  if (!userSelectedDate) return;

  // Блокуємо кнопку та інпут під час роботи таймера
  startBtn.disabled = true;
  datetimePicker.disabled = true;
  // Додатково можна вимкнути сам flatpickr, щоб календар не відкривався при кліку
  fpInstance.destroy(); 

  timerId = setInterval(() => {
    const currentTime = new Date();
    const deltaTime = userSelectedDate - currentTime;

    // Якщо таймер дійшов до кінця
    if (deltaTime <= 0) {
      clearInterval(timerId);
      updateTimerInterface({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      
      // Повертаємо інпут у робочий стан, кнопка залишається неактивною
      datetimePicker.disabled = false;
      // Переініціалізуємо flatpickr для можливості вибору нової дати
      flatpickr(datetimePicker, options);
      return;
    }

    const timeComponents = convertMs(deltaTime);
    updateTimerInterface(timeComponents);
  }, 1000);
});

// Функція для оновлення DOM тексту таймера
function updateTimerInterface({ days, hours, minutes, seconds }) {
  daysField.textContent = addLeadingZero(days);
  hoursField.textContent = addLeadingZero(hours);
  minutesField.textContent = addLeadingZero(minutes);
  secondsField.textContent = addLeadingZero(seconds);
}

// Функція форматування (додавання нуля попереду)
function addLeadingZero(value) {
  return String(value).padStart(2, '0');
}

// Функція підрахунку значень
function convertMs(ms) {
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  const days = Math.floor(ms / day);
  const hours = Math.floor((ms % day) / hour);
  const minutes = Math.floor(((ms % day) % hour) / minute);
  const seconds = Math.floor((((ms % day) % hour) % minute) / second);

  return { days, hours, minutes, seconds };
}