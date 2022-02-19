import http from 'http';
import { createApp } from './src/app.js';

const PORT = process.env.PORT;

http.createServer(createApp()).listen(PORT, () => console.log(`🚀 Server running at ${PORT}`));
