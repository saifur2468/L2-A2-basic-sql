import express, {
  type Application
} from 'express';

import cors from 'cors';

import authRouter
from './modules/auth/auth.router';

import issuesRouter
from './modules/issues/issues.router';

import { errorHandler }
from './middleware/error.middleware';

const app: Application = express();

app.use(cors());

app.use(express.json());


app.use('/api/auth', authRouter);

app.use('/api/issues', issuesRouter);


app.use(errorHandler);

export default app;