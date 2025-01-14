import Fastify from 'fastify';
import cors from '@fastify/cors';
import dockerPlugin from './plugins/docker.ts';
import dockerRoutes from './routes/docker.ts';

const buildApp = async () => {
  const fastify = Fastify({
    logger: true,
  });

  // Register plugins
  await fastify.register(cors, {
    origin: true, // Enable CORS for all origins in development
  });
  await fastify.register(dockerPlugin);

  // Register routes
  await fastify.register(dockerRoutes, { prefix: '/api' });

  return fastify;
};

const startServer = async () => {
  try {
    const app = await buildApp();
    await app.listen({ port: 3001 });
    console.log('Server running at http://localhost:3001');
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();
