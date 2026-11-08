import playgroundRoutes from './routes/playgroundRoutes.js';
import * as playgroundController from './controllers/playgroundController.js';
import * as codeExecutionService from './services/codeExecutionService.js';
import Snippet from './models/Snippet.js';
import * as playgroundAuth from './middleware/playgroundAuth.js';

export {
  playgroundRoutes,
  playgroundController,
  codeExecutionService,
  Snippet,
  playgroundAuth
};

export default {
  routes: playgroundRoutes,
  controller: playgroundController,
  services: codeExecutionService,
  models: { Snippet },
  auth: playgroundAuth
};
