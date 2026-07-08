import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';

import routes from './routes/index.js';
import { isProviderConfigured } from './config/api.js';
import { isIxcConfigured } from './config/ixc.js';

const app = express();
const PORT = Number(process.env.PORT) || 3333;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Healthcheck
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    login: isIxcConfigured() ? 'ixc' : 'mock',
    servicos: isProviderConfigured() ? 'provider' : 'mock',
    timestamp: new Date().toISOString(),
  });
});

// Rotas da aplicação (proxy para a API do provedor)
app.use('/api', routes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Recurso não encontrado.' });
});

// Tratamento central de erros — normaliza erros da API externa/serviços.
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    code: err.code || 'INTERNAL_ERROR',
    message: err.message || 'Erro interno no servidor.',
  });
});

app.listen(PORT, () => {
  const login = isIxcConfigured() ? 'IXC' : 'mock';
  const servicos = isProviderConfigured() ? 'provedor' : 'mock';
  console.log(`\n  Central do Assinante — backend`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  login: ${login} · serviços: ${servicos}\n`);
});
