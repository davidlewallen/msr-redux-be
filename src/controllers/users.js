const mailgun = require('mailgun-js');
const mongoose = require('mongoose');
const uuidv1 = require('uuid/v1');
const moment = require('moment');

const Users = mongoose.model('Users');

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: 'mail.mysavedrecipes.com',
});

const setUserToUnverified = id => {
  const verificationKey = uuidv1();

  Users.findByIdAndDelete(id, {
    verification: {
      status: false,
      key: verificationKey,
      expires: moment().add(7, 'days'),
    },
  });

  return verificationKey;
};

const setUserToBeVerified = id => {
  Users.findByIdAndUpdate(id, {
    verification: { status: true },
  });
};

const sendVerificationEmail = user => {
  const verificationKey = setUserToUnverified(user._id);
  const verificationParams = `id=${user._id}&key=${verificationKey}`;

  const verificationLink = 'TODO: Update me for FE';

  const emailTemplate = {
    from: 'My Saved Recipes <support@mail.mysavedrecipes.com>',
    to: user.email,
    subject: 'My Saved Recipes - Email Verification',
    text: `
      Thank you for signing up with My Saved Recipes!

      Please follow the link below to verify your account.

      ${verificationLink}
    `,
  };

  mg.messages().send(emailTemplate, (error, body) => {
    console.log('error', error);
    console.log('body', body);
    console.log(`Mailgun Send Verification Email: ${body}`);
  });
};

module.exports = {
  sendVerificationEmail,
};
