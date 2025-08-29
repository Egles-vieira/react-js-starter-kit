const request = require('supertest');
const app = require('../server');

describe('Todas as rotas principais', () => {
  const rotas = [
    '/login',
    '/usuarios',
    '/localizacoes',
    '/embarcadores',
    '/clientes',
    '/enderecos',
    '/transportadoras',
    '/motoristas',
    '/romaneios',
    '/notas',
    '/notaFiscal',
    '/drivers-info',
    '/veiculos',
    '/registro',
    '/agente-ia',
    '/integracoes',
    '/agendamentos',
    '/jobs',
    '/arquivos',
    '/erros',
    '/webhooks',
  ];

  rotas.forEach((rota) => {
    it(`GET ${rota} deve retornar 200`, async () => {
      await request(app).get(`/api${rota}`).expect(200);
    });
  });
});

