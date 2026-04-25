// Entry point for the OrchestrAI Express server —
// loads environment variables, creates the app, and starts listening
'use strict';

require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🎵 OrchestrAI server running on port ${PORT}`);
});
