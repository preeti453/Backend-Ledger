// All the third party service code is write inside services folder..

// 👉 “This file creates and exports an email sender that uses Gmail SMTP with OAuth2 so our backend can send emails securely.”

const nodemailer = require('nodemailer');

// this transporter is created to contact SMTP servers in behalf of our server to send email to the requested client.() Transporter talks to the SMTP server, and the SMTP server actually delivers the email.)
// SMTP servers are basically used for emails 
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     type: 'OAuth2',  // Secure login method for Gmail
//     user: process.env.EMAIL_USER,
//     clientId: process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//     refreshToken: process.env.REFRESH_TOKEN,
//   },
// });


// Create transporter using Gmail + App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,   // your gmail address
    pass: process.env.EMAIL_PASS,   // 16-character app password
  },
});


// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegistrationEmail(userEmail, name) {
  const subject = "Welcome to Backend Ledger!";
  const text = `Hello ${name},\n\nThank you for registering at Backend Ledger,We are excited to have you on board!\n\nBest regards,\n The Backend Ledger Team'`;
  const html = `<p>Hello ${name},</p><p>Thank you for registering at Backend Ledger, we are excited to have you on board!</p><p>Best regards,<br/>The Backend Ledger Team</p>`;

  await sendEmail(userEmail, subject, text, html)
}


async function sendTransactionSuccessEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Successful - Backend Ledger";

    const text = `Hello ${name},\n\nYour transaction of $${amount} to account ${toAccount} was successful.\n\nBest regards,\nThe Backend Ledger Team`;

   const html = `<p>Hello ${name},</p><p>Your transaction of $${amount} to account ${toAccount} was successful.</p><p>Best regards,<br>The Backend Ledger Team</p>`;
  await sendEmail(userEmail, subject, text, html);
}


async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
    const subject = 'Transaction Failed';
    const text = `Hello ${name},\n\nWe regret to inform you that your transaction of $${amount} to account ${toAccount} has failed. Please try again later.\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hello ${name},</p><p>We regret to inform you that your transaction of $${amount} to account ${toAccount} has failed. Please try again later.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

    await sendEmail(userEmail, subject, text, html);

}




module.exports = {
  sendRegistrationEmail,
  sendTransactionFailureEmail,
  sendTransactionSuccessEmail,
};


// mybe zcfb ksgd ctcv