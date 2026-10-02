const { handler } = require('../../src/lambda');

// Événement API Gateway HTTP API (payload v2), tel que reçu par la fonction en production.
function httpApiEvent(method, path, { body, query = '' } = {}) {
  return {
    version: '2.0',
    routeKey: '$default',
    rawPath: path,
    rawQueryString: query,
    headers: { 'content-type': 'application/json', host: 'example.execute-api.eu-west-3.amazonaws.com' },
    requestContext: {
      http: { method, path, protocol: 'HTTP/1.1', sourceIp: '127.0.0.1', userAgent: 'jest' },
      stage: '$default',
      requestId: 'test',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    isBase64Encoded: false,
  };
}

describe('handler Lambda', () => {
  it('répond à /health', async () => {
    const res = await handler(httpApiEvent('GET', '/health'), {});
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).status).toBe('ok');
  });

  it('crée puis lit une tâche via des événements API Gateway', async () => {
    const created = await handler(httpApiEvent('POST', '/tasks', { body: { title: 'Depuis Lambda' } }), {});
    expect(created.statusCode).toBe(201);
    const { id } = JSON.parse(created.body);

    const fetched = await handler(httpApiEvent('GET', `/tasks/${id}`), {});
    expect(fetched.statusCode).toBe(200);
    expect(JSON.parse(fetched.body).title).toBe('Depuis Lambda');
  });
});
