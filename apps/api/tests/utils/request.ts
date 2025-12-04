import type { INestApplication } from '@nestjs/common';
import supertest from 'supertest';

/** Base path helper to keep tests readable */
export const base = (path = '') => `/api/v1${path}`;

export function api(app: INestApplication) {
  const agent = supertest(app.getHttpServer());
  const json = (req: supertest.Test) => req.set('Accept', 'application/json');

  return {
    get: (path: string) => json(agent.get(base(path))),
    post: (path: string) => json(agent.post(base(path))),
    patch: (path: string) => json(agent.patch(base(path))),
    delete: (path: string) => json(agent.delete(base(path))),
  };
}
