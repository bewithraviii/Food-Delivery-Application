
let ioInstance;


module.exports = {
    init: (io) => {
      ioInstance = io;
      return io;
    },
    getIO: () => {
      if (!ioInstance) {
        throw new Error("Socket.io not initialized!");
      }
      return ioInstance;
    },
    disconnectClient: (client) => {
      client.on('disconnect', () => {
        console.log('Client disconnected: ' + client.id);
      });
    }
  };