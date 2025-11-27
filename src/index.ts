import { createServer } from 'http';
import app from './app';
import { initSocket } from './socket';
import { config } from './utils/config';

const httpServer = createServer(app);
initSocket(httpServer);

const PORT = config.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${config.NODE_ENV}`);
});
