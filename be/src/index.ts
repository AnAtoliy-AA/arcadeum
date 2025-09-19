const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

type Socket = import('socket.io').Socket;

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

interface Player {
  id: string;
  name: string;
  score: number;
  role?: string;
}

interface Lobby {
  players: Player[];
  gameState: string;
  sabotageTargets: string[];
}

const lobbies: Record<string, Lobby> = {};

app.get('/health', (_req: any, res: any) => res.json({ ok: true }));

io.on('connection', (socket: Socket) => {
  interface CreateLobbyPayload {
    name: string;
  }

  type CreateLobbyCallback = (lobbyCode: string) => void;

  console.log('client connected:', socket.id);
  socket.emit('message', 'Hello from backend!');

  socket.on('createLobby', ({ name }: CreateLobbyPayload, cb: CreateLobbyCallback) => {
    const lobbyCode = Math.random().toString(36).substr(2, 4).toUpperCase();
    lobbies[lobbyCode] = { players: [{ id: socket.id, name, score: 0 }], gameState: 'waiting', sabotageTargets: [] };
    socket.join(lobbyCode);
    cb(lobbyCode);
    io.to(lobbyCode).emit('lobbyUpdate', lobbies[lobbyCode]);
  });

  interface JoinLobbyPayload {
    lobbyCode: string;
    name: string;
  }

  type JoinLobbyCallback = (success: boolean) => void;

  socket.on('joinLobby', ({ lobbyCode, name }: JoinLobbyPayload, cb: JoinLobbyCallback) => {
    if (lobbies[lobbyCode]) {
      lobbies[lobbyCode].players.push({ id: socket.id, name, score: 0 });
      socket.join(lobbyCode);
      cb(true);
      io.to(lobbyCode).emit('lobbyUpdate', lobbies[lobbyCode]);
    } else {
      cb(false);
    }
  });

  socket.on('startGame', ({ lobbyCode }: { lobbyCode: string }) => {
    const lobby = lobbies[lobbyCode];
    if (!lobby) return;
    const players = lobby.players;
    const imposterIdx = Math.floor(Math.random() * players.length);
    players.forEach((p, i) => p.role = i === imposterIdx ? 'imposter' : 'villager');
    lobby.gameState = 'roleReveal';
    io.to(lobbyCode).emit('gameUpdate', lobby);
  });

  socket.on('disconnect', () => {
    for (const code in lobbies) {
      if (lobbies[code]) {
        lobbies[code].players = lobbies[code].players.filter(p => p.id !== socket.id);
        io.to(code).emit('lobbyUpdate', lobbies[code]);
      }
    }
  });
});

server.listen(4000, () => console.log('Game server running on port 4000'));