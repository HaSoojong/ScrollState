// Entry point for the OrchestrAI Express server —
// loads environment variables, creates the app, and starts listening
'use strict';

require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3001;

// TODO: implement — start the server
app.listen(PORT, () => {
  // TODO: log startup message
});
