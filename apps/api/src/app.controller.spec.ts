import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

test('AppController returns Hello World!', () => {
  const service = new AppService();
  const controller = new AppController(service);

  assert.equal(controller.getHello(), 'Hello World!');
});
