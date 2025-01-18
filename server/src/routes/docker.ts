import type { FastifyPluginAsync } from 'fastify';
import type { Container, Image, Volume } from '../types/docker.ts';

interface ContainerParams {
  id: string;
}

const dockerRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all containers
  fastify.get<{
    Reply: Container[] | { error: string };
  }>(
    '/containers',
    {
      schema: {
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                image: { type: 'string' },
                status: {
                  type: 'string',
                  enum: ['running', 'stopped', 'exited'],
                },
                ports: { type: 'array', items: { type: 'string' } },
                created: { type: 'string' },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const containers = await fastify.docker.listContainers();
        return containers;
      } catch (error) {
        reply.status(500).send({ error: 'Failed to list containers' });
      }
    }
  );

  // Start container
  fastify.post<{
    Params: ContainerParams;
  }>(
    '/containers/:id/start',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await fastify.docker.startContainer(request.params.id);
        return result;
      } catch (error) {
        reply.status(500).send({ error: 'Failed to start container' });
      }
    }
  );

  // Stop container
  fastify.post<{
    Params: ContainerParams;
  }>(
    '/containers/:id/stop',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await fastify.docker.stopContainer(request.params.id);
        return result;
      } catch (error) {
        reply.status(500).send({ error: 'Failed to stop container' });
      }
    }
  );

  // Get all images
  fastify.get<{
    Reply: Image[] | { error: string };
  }>(
    '/images',
    {
      schema: {
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                repository: { type: 'string' },
                tag: { type: 'string' },
                size: { type: 'string' },
                created: { type: 'string' },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const images = await fastify.docker.listImages();
        return images;
      } catch (error) {
        reply.status(500).send({ error: 'Failed to list images' });
      }
    }
  );

  // Get all volumes
  fastify.get<{
    Reply: Volume[] | { error: string };
  }>(
    '/volumes',
    {
      schema: {
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                driver: { type: 'string' },
                mountpoint: { type: 'string' },
                usedBy: { type: 'array' },
                size: { type: 'string' },
                createdAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const volumes = await fastify.docker.listVolumes();
        return volumes;
      } catch (error) {
        reply.status(500).send({ error: 'Failed to list volumes' });
      }
    }
  );
};

export default dockerRoutes;
