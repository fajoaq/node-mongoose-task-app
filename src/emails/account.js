const mailgun = require("mailgun-js");

//mailgun specific
const mailGunAPIKey = process.env.MAILGUN_API_KEY;
const DOMAIN = 'sandboxe86c0a6adfc7434aa24ff56cb3378235.mailgun.org';
const mg = mailgun({apiKey: mailGunAPIKey, domain: DOMAIN});

const sendWelcomeEmail = (email, name, message={subject: '', text: ''}) => {
    const data = {
        from: email,
        to: 'fajoaq@yandex.com',
        subject: message.subject ? message.subject : 'Welcome to the app!',
        text: `Welcome ${name}! Thanks for using our app! ${message.text}`
    };

    mg.messages().send(data, function (error, body) {
        console.log(body);
    });
}

const sendUnsubEmail = (email, name, message={}) => {
    const data = {
        from: email,
        to: 'fajoaq@yandex.com',
        subject: message.subject ? message.subject : 'Unsubscribed from app',
        text: `Oh no ${name}! Sorry to seeyou go! ${message.text}`
    };

    mg.messages().send(data, function (error, body) {
        console.log(body);
    });
}

module.exports = {
    sendWelcomeEmail,
    sendUnsubEmail
};