// Entry point for MMO server
import express from 'express';

import { createServer } from 'http';
import { Server } from 'socket.io';
import { handlePlayerAction } from './game/actions';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

app.get('/', (req, res) => {
  res.send('Bible MMO Server Running');
});


io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('playerAction', (action) => {
    handlePlayerAction(action, socket.id);
  });

  // TODO: Add more game logic handlers (chat, quest, world state, etc.)
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
