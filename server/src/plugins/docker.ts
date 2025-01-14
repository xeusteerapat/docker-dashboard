import fp from 'fastify-plugin';
import { DockerService } from '../services/docker.ts';

declare module 'fastify' {
  interface FastifyInstance {
    docker: DockerService;
  }
}

export default fp(async (fastify) => {
  const docker = new DockerService();
  fastify.decorate('docker', docker);
});
