// netlify/functions/storeSubmission.js
const { storeSubmission } = require('./dataFunctions');

exports.handler = async (event, context) => {
  return storeSubmission(event, context);
};
