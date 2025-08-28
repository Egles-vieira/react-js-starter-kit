import React, { useEffect, useState } from 'react';
import { FiEdit2, FiRefreshCw, FiPlay, FiPause, FiPlus } from 'react-icons/fi';

const API_URL = process.env.REACT_APP_API_URL || 'https://app.roadweb.com.br';

export default function ConfiguracaoCrons() {
  const [crons, setCrons] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState({ nome: '', descricao: '', schedule: '*/5 * * * *' });
  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    carregarCrons();
  }, []);

  const carregarCrons = async () => {
    try {
      const res = await fetch(`${API_URL}/api/crons`);
      const data = await res.json();
      setCrons(data.map(item => ({ ...item, id: item.id })));
    } catch (err) {
      console.error('Erro ao carregar CRONs:', err);
      setErro('Erro ao carregar tarefas.');
    }
  };

  const abrirModal = (cron = null) => {
    setMensagem(null);
    setErro(null);
    if (cron) {
      setForm({ nome: cron.nome, descricao: cron.descricao, schedule: cron.schedule });
      setEditandoId(cron.id);
    } else {
      setForm({ nome: '', descricao: '', schedule: '*/5 * * * *' });
      setEditandoId(null);
    }
    setModalAberto(true);
  };

  const salvarCron = async () => {
    if (!form.nome.trim() || !form.schedule.trim()) {
      setErro('Preencha o nome e o agendamento.');
      return;
    }
    const url = editandoId ? `${API_URL}/api/crons/${editandoId}` : `${API_URL}/api/crons`;
    const method = editandoId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Erro ao salvar');

      setMensagem('Tarefa salva com sucesso.');
      setModalAberto(false);
      carregarCrons();
    } catch (err) {
      setErro('Erro ao salvar tarefa.');
    }
  };

  const alternarAtivacao = async (cron) => {
    try {
      await fetch(`${API_URL}/api/crons/${cron.id}/ativar`, { method: 'PATCH' });
      carregarCrons();
    } catch {
      setErro('Erro ao alterar status.');
    }
  };

  const executarAgora = async (cron) => {
    try {
      await fetch(`${API_URL}/api/crons/${cron.id}/executar`, { method: 'POST' });
      setMensagem(`Tarefa "${cron.nome}" executada.`);
    } catch {
      setErro('Erro ao executar tarefa.');
    }
  };

  return (
    <>
      <style>{`
        .cron-container { max-width: 1200px; margin: 0 auto; padding: 16px; font-family: Poppins, sans-serif; }
        .cron-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .cron-add-btn { background-color: #00796B; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; display: flex; align-items: center; cursor: pointer; }
        .cron-add-btn svg { margin-right: 8px; }
        .cron-message { padding: 12px; border-radius: 4px; margin-bottom: 16px; }
        .cron-message.success { background-color: #C8E6C9; color: #2E7D32; }
        .cron-message.error { background-color: #FFCDD2; color: #C62828; }
        .cron-table { width: 100%; border-collapse: collapse; }
        .cron-table th, .cron-table td { padding: 12px; text-align: left; border: 1px solid #ddd; }
        .cron-table thead { background-color: #00796B; color: #fff; }
        .cron-table tbody tr.even { background-color: #f4f8fb; }
        .cron-table tbody tr.odd { background-color: #fff; }
        .status.ativo { color: #388E3C; font-weight: 500; }
        .status.inativo { color: #999; font-weight: 500; }
        .action-btn { background: none; border: none; cursor: pointer; margin-right: 8px; }
      `}</style>
      <div className="cron-container">
        <div className="cron-header">
          <h2>🕒 Tarefas Agendadas (CRONs)</h2>
          <button className="cron-add-btn" onClick={() => abrirModal()}>
            <FiPlus /> Nova Tarefa
          </button>
        </div>

        {mensagem && <div className="cron-message success">{mensagem}</div>}
        {erro && <div className="cron-message error">{erro}</div>}

        <table className="cron-table">
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Agendamento</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {crons.map((cron, idx) => (
              <tr key={cron.id} className={idx % 2 === 0 ? 'even' : 'odd'}>
                <td><input type="checkbox" /></td>
                <td>{cron.nome}</td>
                <td>{cron.descricao}</td>
                <td>{cron.schedule}</td>
                <td className={`status ${cron.ativo ? 'ativo' : 'inativo'}`}>{cron.ativo ? 'Ativo' : 'Inativo'}</td>
                <td>
                  <button className="action-btn" onClick={() => abrirModal(cron)} title="Editar"><FiEdit2 /></button>
                  <button className="action-btn" onClick={() => alternarAtivacao(cron)} title={cron.ativo ? 'Inativar' : 'Ativar'}>
                    {cron.ativo ? <FiPause /> : <FiPlay />}
                  </button>
                  <button className="action-btn" onClick={() => executarAgora(cron)} title="Executar agora"><FiRefreshCw /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {modalAberto && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
            <div style={{ background: '#fff', padding: 16, borderRadius: 4, width: 400 }}>
              <h3>{editandoId ? 'Editar Tarefa' : 'Nova Tarefa Agendada'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                <input
                  type="text"
                  placeholder="Nome da tarefa"
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                />
                <input
                  type="text"
                  placeholder="Descrição"
                  value={form.descricao}
                  onChange={e => setForm({ ...form, descricao: e.target.value })}
                  style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                />
                <input
                  type="text"
                  placeholder="Agendamento (ex: */5 * * * *)"
                  value={form.schedule}
                  onChange={e => setForm({ ...form, schedule: e.target.value })}
                  style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                  <button onClick={salvarCron} style={{ padding: '8px 16px', backgroundColor: '#00796B', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                    {editandoId ? 'Atualizar' : 'Salvar'}
                  </button>
                  <button onClick={() => setModalAberto(false)} style={{ padding: '8px 16px', background: 'none', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
