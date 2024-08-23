// Firebase configuration (Replace with your project's configuration)
const firebaseConfig = {
    apiKey: "AIzaSyDvR8wUJiLVnYaRTs9rkl54GezzRy9BUo4",
    authDomain: "hogwarts-events.firebaseapp.com",
    databaseURL: "https://hogwarts-events-default-rtdb.firebaseio.com/", // Update with your actual database URL
    projectId: "hogwarts-events",
    storageBucket: "hogwarts-events.appspot.com",
    messagingSenderId: "236871239749",
    appId: "1:236871239749:web:550fe3c653e02f46fbfb2c"
  };
  
  document.addEventListener('DOMContentLoaded', () => {
      // Initialize Firebase
      const app = firebase.initializeApp(firebaseConfig);
      const database = firebase.database();
      const eventsRef = database.ref("events");
  
      // Event Form Handling (Only for index.html)
      const eventForm = document.getElementById("event-form"); // Get the form element
      const eventsContainer = document.getElementById("events-container"); // Get the container
  
      if (eventForm) { // Check if the form element exists (only on index.html)
          eventForm.addEventListener("submit", (event) => {
              event.preventDefault();
              const eventName = document.getElementById("event-name").value;
              const eventTime = document.getElementById("event-time").value;
  
              eventsRef.push({
                  name: eventName,
                  time: eventTime
              });
  
              // Clear the form
              eventForm.reset();
          });
      }
  
      // Function to display events in the list
      function displayEvents(snapshot) {
          eventsContainer.innerHTML = ""; // Clear previous list
  
          snapshot.forEach(childSnapshot => {
              const eventData = childSnapshot.val();
              const eventKey = childSnapshot.key;
  
              // Create list item
              const listItem = document.createElement("li");
  
              // Determine HTML based on the page
              if (eventForm) { // If eventForm exists, it's index.html (Admin Page)
                  listItem.innerHTML = `
                      <div class="event-details">
                          <h3>${eventData.name}</h3>
                          <p>الوقت: ${formatDateTime(eventData.time)}</p> 
                          <span class="countdown" data-countdown="${eventData.time}"></span> 
                      </div>
                      <div class="edit-delete">
                          <button class="edit-button" data-key="${eventKey}">تعديل</button>
                          <button class="delete-button" data-key="${eventKey}">حذف</button>
                      </div>
                  `;
              } else { // If eventForm doesn't exist, it's events.html (User Page)
                  listItem.innerHTML = `
                      <div class="event-details">
                          <h3>${eventData.name}</h3>
                          <p>الوقت: ${formatDateTime(eventData.time)}</p> 
                          <span class="countdown" data-countdown="${eventData.time}"></span> 
                      </div>
                  `;
              }
  
              // Add the list item to the container
              eventsContainer.appendChild(listItem);
  
              // Start the countdown timer
              startCountdown(listItem.querySelector('.countdown'));
  
              // Attach event listeners *after* the list item is added (only on index.html)
              if (eventForm) { // Check if the form element exists (only on index.html)
                  const editButton = listItem.querySelector('.edit-button');
                  const deleteButton = listItem.querySelector('.delete-button');
  
                  if (editButton && deleteButton) { 
                      editButton.addEventListener('click', editEvent);
                      deleteButton.addEventListener('click', deleteEvent);
                  }
              }
          });
      }
  
      // Function to format date and time
      function formatDateTime(dateTimeString) {
          const dateTime = new Date(dateTimeString);
          const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
          return dateTime.toLocaleDateString('ar-EG', options); // Format for Arabic (Egypt)
      }
  
      // Function to start the countdown timer
      function startCountdown(countdownElement) {
          const targetDate = new Date(countdownElement.dataset.countdown);
      
          // Update the countdown every second
          const countdownInterval = setInterval(() => {
              const now = new Date();
              const difference = targetDate - now;
  
              // Calculate days, hours, minutes, and seconds
              const days = Math.floor(difference / (1000 * 60 * 60 * 24));
              const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((difference % (1000 * 60)) / 1000);
  
              // Display the countdown
              countdownElement.textContent = `${days} يوم ${hours} ساعة ${minutes} دقيقة ${seconds} ثانية`;
  
              // If the countdown has finished
              if (difference < 0) {
                  clearInterval(countdownInterval);
                  countdownElement.textContent = "انتهى الوقت!";
              }
          }, 1000);
      }
  
      // Function to edit an event (Only for index.html)
      function editEvent(event) {
          // Get the event key from the button
          const eventKey = event.target.dataset.key;
  
          // Get the event data from Firebase
          eventsRef.child(eventKey).once('value', snapshot => {
              const eventData = snapshot.val();
  
              // Populate the form with the event data (only on index.html)
              if (eventForm) { // Check if the form element exists (only on index.html)
                  document.getElementById("event-name").value = eventData.name;
                  document.getElementById("event-time").value = eventData.time;
              }
  
              // Update the submit button to update the event (only on index.html)
              if (eventForm) { // Check if the form element exists (only on index.html)
                  eventForm.addEventListener("submit", (e) => {
                      e.preventDefault();
  
                      const updatedEventName = document.getElementById("event-name").value;
                      const updatedEventTime = document.getElementById("event-time").value;
  
                      eventsRef.child(eventKey).update({
                          name: updatedEventName,
                          time: updatedEventTime
                      });
  
                      // Clear the form
                      eventForm.reset();
                      // Update the event list
                      displayEvents(snapshot);
                  });
  
                  // Add a button to cancel the edit
                  const cancelButton = document.createElement('button');
                  cancelButton.textContent = 'إلغاء';
                  cancelButton.classList.add('cancel-button');
                  eventForm.appendChild(cancelButton);
  
                  // Cancel editing
                  cancelButton.addEventListener('click', () => {
                      eventForm.removeEventListener('submit', editEvent);
                      eventForm.removeEventListener('submit', deleteEvent);
                      eventForm.reset();
                      eventForm.removeChild(cancelButton);
                      displayEvents(snapshot);
                  });
              }
          });
      }
  
      // Function to delete an event (Only for index.html)
      function deleteEvent(event) {
          // Get the event key from the button
          const eventKey = event.target.dataset.key;
  
          // Delete the event from Firebase
          eventsRef.child(eventKey).remove();
      }
  
      // Update visitor counts (Only for index.html)
      const totalVisitsSpan = document.getElementById('total-visits');
      const uniqueVisitsSpan = document.getElementById('unique-visits');
  
      if (totalVisitsSpan && uniqueVisitsSpan) { // Check if the elements exist (only on index.html)
          function updateVisitorCounts() {
              // Track unique visitors using localStorage
              let uniqueVisits = localStorage.getItem('uniqueVisits');
              if (uniqueVisits === null) {
                  uniqueVisits = 1;
              } else {
                  uniqueVisits = parseInt(uniqueVisits) + 1;
              }
              localStorage.setItem('uniqueVisits', uniqueVisits);
  
              // Track total visits
              let totalVisits = localStorage.getItem('totalVisits');
              if (totalVisits === null) {
                  totalVisits = 1;
              } else {
                  totalVisits = parseInt(totalVisits) + 1;
              }
              localStorage.setItem('totalVisits', totalVisits);
  
              // Update the displayed counts
              totalVisitsSpan.textContent = totalVisits;
              uniqueVisitsSpan.textContent = uniqueVisits;
          }
  
          // Call updateVisitorCounts on page load (only on index.html)
          updateVisitorCounts();
      }
  
      // **Fetch events from database and display them**
      eventsRef.once('value', displayEvents); 
  });