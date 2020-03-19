const mailgun = require('mailgun-js');
const mongoose = require('mongoose');
const { v1: uuidv1 } = require('uuid');

const Users = mongoose.model('Users');

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: 'mail.mysavedrecipes.com',
});

const setUserToUnverified = id => {
  const verificationKey = uuidv1();

  return Users.findByIdAndUpdate(id, {
    verification: {
      status: false,
      key: verificationKey,
    },
  }).then(() => verificationKey);
};

const setUserToBeVerified = id => {
  return Users.findByIdAndUpdate(id, {
    verification: { status: true },
  });
};

const verifyUser = (req, res) => {
  const {
    params: { id, key },
  } = req;

  if (!id)
    return res.status(400).json({
      errors: { id: 'is required' },
    });

  if (!key)
    return res.status(400).json({
      errors: { key: 'is required' },
    });

  return Users.findById(id).then(user => {
    if (user === null) {
      return res.status(400).json({ errors: { user: 'does not exist' } });
    }

    if (user.verification.status) {
      return res.status(400).json({ errors: { user: 'is already verified' } });
    }

    if (user.verification.key !== key) {
      return res
        .status(400)
        .json({ errors: { key: 'does not match saved verification key' } });
    }
    return setUserToBeVerified(id).then(() => res.sendStatus(200));
  });
};

const sendVerificationEmail = user => {
  return setUserToUnverified(user._id).then(verificationKey => {
    const verificationParams = `id=${user._id}&key=${verificationKey}`;

    const verificationLink = 'TODO: Update me for FE ' + verificationParams;

    const emailTemplate = {
      from: 'My Saved Recipes <support@mail.mysavedrecipes.com>',
      to: user.email,
      subject: 'My Saved Recipes - Email Verification',
      text: `
      Thank you for signing up with My Saved Recipes!

      Please follow the link below to verify your account.

      ${verificationLink} /${user._id}/${verificationKey}
    `,
    };

    mg.messages().send(emailTemplate, (error, body) => {
      if (isDevelopment) {
        console.log(`Mailgun Send Verification Email: ${body}`);
      }
    });
  });
};

module.exports = {
  sendVerificationEmail,
  verifyUser,
};
