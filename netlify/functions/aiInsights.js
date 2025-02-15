// netlify/functions/aiInsights.js
const { aiInsights } = require('./dataFunctions');

exports.handler = async (event, context) => {
  return aiInsights(event, context);
};
