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

      
    // return sent mailbox of the current user
    load_mailbox('sent');
      
  };
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  // delete the all emails from view - better than just hiding via display = none due to browser memory?
  document.querySelectorAll('#emails').forEach(email => {email.innerHTML=""});
  // hide all emailDetails from view
  document.querySelector('#emailDetails').style.display ="none";   

  // Show the mailbox name
  document.querySelector('#pageHeading').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // create item for each email in db
  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      document.querySelectorAll('#emails').forEach(email => {email.style.display="block"});
      emails.forEach(showEmails);
    });
  
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
  let email = document.createElement('div');
  let emailSender = document.createElement('div');
  let emailSubject = document.createElement('div');
  let emailTimestamp = document.createElement('div');

  // assign a class to each div
  email.className = "emailsContainer";
  emailSender.className = "emailsSender";
  emailSubject.className = "emailsSubject";
  emailTimestamp.className = "emailsTimestamp";
  
  // assign the innerHTML to each div, based on queried data
  emailSender.innerHTML = `<hr> <b>Sender: </b>${emailContent.sender}`;
  emailSubject.innerHTML = `<b>Subject: </b>${emailContent.subject}`;
  emailTimestamp.innerHTML = `<b>Timestamp: </b>  ${emailContent.timestamp}`;

  email.dataset.emailId = emailContent.id;
 
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

  // when email is clicked, show details of this mail
  email.addEventListener('click', ()  =>{
    show_Email_Details(emailContent.id);
  })

  // append another email div to the document
  document.querySelector('#emails').append(email);
}



function show_Email_Details(emailId){

  // delete the all emails from view - better than just hiding via display = none due to browser memory?
  document.querySelectorAll('#emails').forEach(email => {email.innerHTML=""});
  document.querySelector('#emailDetailsContent').innerHTML = "";
  document.querySelector('#emailDetails').style.display ="block";

  fetch(`emails/${emailId} `)
  .then(response => response.json())
  .then(email => {

      // only display archive button when not in sent mailbox
      if (document.querySelector('#pageHeading').innerHTML.includes("Sent")){
        document.querySelector('#archiveButton').style.display = "none";
      }else{
        // display archive button and click event listener
        document.querySelector('#archiveButton').style.display = "block";
        document.querySelector('#archiveButton').onclick = () => {
          archiveUnarchive(emailId);
        };
        // display reply button and click event listener
        document.querySelector('#replyButton').style.display = "block";
        document.querySelector('#replyButton').onclick = () => {
          compose_email()
          document.querySelector('#compose-recipients').value = email.sender;
          if (email.subject.includes("Re: ")){
            document.querySelector('#compose-subject').value = email.subject;
          }else{            
            document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
          }
          document.querySelector('#compose-body').value = `On ${email.timestamp}, ${email.sender} wrote:\n\n${email.body}`;
        };
      }
      
      // create all needed divs
      let emailContainer = document.createElement('div');
      let emailSender = document.createElement('div');
      let emailRecipients = document.createElement('div');
      let emailSubject = document.createElement('div');
      let emailTimestamp = document.createElement('div');
      let emailBody = document.createElement('div');

      // define email content class
      emailContainer.className = "emailDetailsContent"
      emailSender.className = "emailDetailsContent"
      emailRecipients.className = "emailDetailsContent"
      emailSubject.className = "emailDetailsContent"
      emailBody.className = "emailDetailsContent"
      emailBody.className = "emailDetailsContent"

      // display content of each div from database
      emailSender.innerHTML = `<hr> <b>Sender: </b>${email.sender}`;
      emailRecipients.innerHTML = `<b>Recipients: </b>${email.recipients}`;
      emailTimestamp.innerHTML = `<b>Timestamp: </b>${email.timestamp}`;
      emailSubject.innerHTML = `<hr> <b>Subject: </b>${email.subject}`;
      emailBody.innerHTML = `<br> <b>Content: </b>${email.body}`;

      emailContainer.appendChild(emailSender);
      emailContainer.appendChild(emailRecipients);
      emailContainer.appendChild(emailTimestamp);
      emailContainer.appendChild(emailSubject);
      emailContainer.appendChild(emailBody);

      document.querySelector('#emailDetailsContent').append(emailContainer);
  });

  fetch(`emails/${emailId} `,{
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  });
}



function archiveUnarchive(emailId){
  // get the current archive state of the email
  fetch(`emails/${emailId} `)
  .then(response => response.json())
  .then(email =>{
    let archivedState = email.archived;
    // togle the archivedState
    archivedState = !archivedState;
    // modify the archivestate in the db
    fetch(`emails/${emailId}`,{
      method: 'PUT',
      body: JSON.stringify({
        archived: archivedState
      })
    })
    .then(() => load_mailbox('inbox'));
  })
}