import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import routes from './routes';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Rotas da aplicação
app.use('/api', routes);

// Rota de Healthcheck
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
