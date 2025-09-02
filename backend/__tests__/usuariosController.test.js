const bcrypt = require('bcrypt');

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('../models/usuario', () => ({
  findById: jest.fn(),
  updatePassword: jest.fn(),
}));

const Usuario = require('../models/usuario');
const { changePassword } = require('../controllers/usuariosController');

describe('usuariosController.changePassword', () => {
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('retorna 404 se usuário não encontrado', async () => {
    Usuario.findById.mockResolvedValue(null);
    const req = { params: { id: 1 }, body: { currentPassword: 'a', newPassword: 'b' } };

    await changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado.' });
  });

  test('retorna 400 se senha atual incorreta', async () => {
    Usuario.findById.mockResolvedValue({ senha: 'hash' });
    bcrypt.compare.mockResolvedValue(false);
    const req = { params: { id: 1 }, body: { currentPassword: 'a', newPassword: 'b' } };

    await changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Senha atual incorreta.' });
  });

  test('altera senha com sucesso', async () => {
    Usuario.findById.mockResolvedValue({ senha: 'hash' });
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('newhash');
    const req = { params: { id: 1 }, body: { currentPassword: 'a', newPassword: 'b' } };

    await changePassword(req, res);

    expect(Usuario.updatePassword).toHaveBeenCalledWith(1, 'newhash');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Senha alterada com sucesso.' });
  });
});
