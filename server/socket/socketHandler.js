const socketHandler = (io) => {
  const sessionUsers = {};

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join session room
    socket.on('join-session', ({ sessionId, user }) => {
      socket.join(sessionId);

      if (!sessionUsers[sessionId]) {
        sessionUsers[sessionId] = [];
      }

      // Add user if not already in list
      const exists = sessionUsers[sessionId].find(u => u.id === user.id);
      if (!exists) {
        sessionUsers[sessionId].push({ ...user, socketId: socket.id });
      }

      // Broadcast updated users list to everyone in room
      io.to(sessionId).emit('users-update', sessionUsers[sessionId]);
      console.log(`${user.name} joined session ${sessionId}`);
    });

    // Code change — broadcast to everyone except sender
    socket.on('code-change', ({ sessionId, code }) => {
      socket.to(sessionId).emit('code-update', code);
    });

    // New comment — broadcast to everyone in room
    socket.on('add-comment', ({ sessionId, comment }) => {
      socket.to(sessionId).emit('new-comment', comment);
    });

    // Leave session
    socket.on('leave-session', ({ sessionId }) => {
      socket.leave(sessionId);
      if (sessionUsers[sessionId]) {
        sessionUsers[sessionId] = sessionUsers[sessionId].filter(
          u => u.socketId !== socket.id
        );
        io.to(sessionId).emit('users-update', sessionUsers[sessionId]);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      // Remove user from all sessions
      Object.keys(sessionUsers).forEach(sessionId => {
        sessionUsers[sessionId] = sessionUsers[sessionId].filter(
          u => u.socketId !== socket.id
        );
        io.to(sessionId).emit('users-update', sessionUsers[sessionId]);
      });
      console.log('Client disconnected:', socket.id);
    });
  });
};

module.exports = socketHandler;