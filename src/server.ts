

import app from './app';
import { pool } from './config/databese';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
   
    await pool.query('SELECT NOW()');
    console.log(' Connected to PostgreSQL database cluster pool successfully.');
    
    app.listen(PORT, () => {
      console.log(` Server processing application traffic on port ${PORT}`);
    });
  } catch (error) {
    console.error(' Critical server boot orchestration failure:', error);
    process.exit(1);
  }
};

startServer();