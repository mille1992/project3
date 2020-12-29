document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');


});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // post mail if form has been submitted
  document.querySelector('#compose-form').onsubmit = event => {
    event.preventDefault();
    
    // Get data from input fields
    let recipientsData = document.querySelector('#compose-recipients').value;
    let subjectData = document.querySelector('#compose-subject').value;
    let bodyData = document.querySelector('#compose-body').value;

    // upload form content as an email
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipientsData,
          subject: subjectData,
          body: bodyData
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    }); 
      
    // return sent mailbox of the current user
    load_mailbox('sent');
      
  };
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#pageHeading').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // create list item for each email
  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);
      // ... do something else with emails ...
      document.querySelectorAll('#emails').forEach(email => { email.innerHTML=""});

      emails.forEach(showEmails)
    });

  document.addEventListener
}


/*
//first option how to display all mails - more difficult to read but maybe faster?
function showEmails(emailContent){
  const email = document.createElement('div');
  email.className = 'email';
  email.innerHTML = `<hr> <b>Sender: </b>${emailContent.sender}<br> <b>Subject: </b>${emailContent.subject} <br><b>Timestamp: </b>  ${emailContent.timestamp}`;
  if (emailContent.read === false){
    email.style.backgroundColor = "white";
  }else{
    email.style.backgroundColor = "gray";
  }
  console.log(emailContent.read);

  document.querySelector('#emails').append(email);
}*/

//second option how to display all mails - easier to read but maybe slower?
function showEmails(emailContent){

  // create all needed divs
  const email = document.createElement('div');
  const emailSender = document.createElement('div');
  const emailSubject = document.createElement('div');
  const emailTimestamp = document.createElement('div');

  // assign a class to each div
  email.className = "email";
  emailSender.className = "emailSender";
  emailSubject.className = "emailSubject";
  emailTimestamp.className = "emailTimestamp";
  
  // assign the innerHTML to each div, based on queried data
  emailSender.innerHTML = `<hr> <b>Sender: </b>${emailContent.sender}`;
  emailSubject.innerHTML = `<b>Subject: </b>${emailContent.subject}`;
  emailTimestamp.innerHTML = `<b>Timestamp: </b>  ${emailContent.timestamp}`;
 
  // change background to white when Email has not been read and grey if it has been read
  if (emailContent.read === false){
    email.style.backgroundColor = "white";
  }else{
    email.style.backgroundColor = "gray";
  }

  // Append all child divs to the parent div email
  email.appendChild(emailSender);
  email.appendChild(emailSubject);
  email.appendChild(emailTimestamp);

  // append another email div to the document
  document.querySelector('#emails').append(email);
}