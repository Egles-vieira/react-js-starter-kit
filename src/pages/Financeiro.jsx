import React from 'react';

export default function SistemaFinanceiro() {
  return (
    <div style={{ margin: '100 auto', maxWidth: 2300, padding: 40 }}>
      <div style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>
          Integração Bancária - Bradesco
        </h2>
        <p style={{ fontSize: 14 }}>
          Conta bancária: <strong>Bradesco Conta PJ 1234-5</strong> / <strong>Agência 1234</strong> <span style={{ color: 'green' }}>&#10003;</span>
        </p>
      </div>



      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 30 }}>
         <div style={boxStyle}>
          <div style={boxHeader}>Saldo</div>
          <div style={textsaldo}>R$ 195,52</div>
        </div>
        <div style={boxStyle}>
          <div style={boxHeader}>Não conciliado</div>
          <div style={textnaoconciliado}>R$ 50,68</div>
        </div>
        <div style={boxStyle}>
          <div style={boxHeader}>Projeção de pagamentos</div>
          <div style={textprojecao}>R$ 18.520,68</div>
        </div>
        <div style={boxStyle}>
          <div style={boxHeader}>Contas a receber</div>
          <button style={btnStyle}>Ver todos</button>
        </div>
        <div style={boxStyle}>
          <div style={boxHeader}>Contas a pagar</div>
          <button style={btnStyle}>Ver contas</button>
        </div>
        <div style={boxStyle}>
          <div style={boxHeader}>Pagamentos Agendados</div>
          <button style={btnStyle}>Ver cedenciamentos</button>
        </div>
      </div>

     <div style={boxStyle}>
        <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Extrato da Conta ( últimos 7 dias )</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginBottom: 10 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
              <th style={thStyle}>Data</th>
              <th style={thStyle}>Descrição</th>
              <th style={thStyle}>Valor</th>
              <th style={thStyle}>Saldo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>26/07/2025</td>
              <td style={tdStyle}>Pagamento Motorista 5898</td>
              <td style={{ ...tdStyle, color: 'green' }}>+R$ 1.200,00</td>
              <td style={tdStyle}>R$ 8.300</td>
            </tr>
            <tr>
              <td style={tdStyle}>25/07/2025</td>
              <td style={tdStyle}>Boleto Pago</td>
              <td style={{ ...tdStyle, color: 'red' }}>-R$ 450,00</td>
              <td style={tdStyle}>R$ 7.100</td>
            </tr>
              <tr>
              <td style={tdStyle}>26/07/2025</td>
              <td style={tdStyle}>Pagamento Motorista 6988</td>
              <td style={{ ...tdStyle, color: 'green' }}>+R$ 1.200,00</td>
              <td style={tdStyle}>R$ 8.300</td>
            </tr>
            <tr>
              <td style={tdStyle}>25/07/2025</td>
              <td style={tdStyle}>Boleto Pago</td>
              <td style={{ ...tdStyle, color: 'red' }}>-R$ 450,00</td>
              <td style={tdStyle}>R$ 7.100</td>
            </tr>
              <tr>
              <td style={tdStyle}>26/07/2025</td>
              <td style={tdStyle}>Pix Recebido</td>
              <td style={{ ...tdStyle, color: 'green' }}>+R$ 1.200,00</td>
              <td style={tdStyle}>R$ 8.300</td>
            </tr>
            <tr>
              <td style={tdStyle}>25/07/2025</td>
              <td style={tdStyle}>Boleto Pago</td>
              <td style={{ ...tdStyle, color: 'red' }}>-R$ 450,00</td>
              <td style={tdStyle}>R$ 7.100</td>
            </tr>
              <tr>
              <td style={tdStyle}>26/07/2025</td>
              <td style={tdStyle}>Pix Recebido</td>
              <td style={{ ...tdStyle, color: 'green' }}>+R$ 1.200,00</td>
              <td style={tdStyle}>R$ 8.300</td>
            </tr>
            <tr>
              <td style={tdStyle}>25/07/2025</td>
              <td style={tdStyle}>Boleto Pago</td>
              <td style={{ ...tdStyle, color: 'red' }}>-R$ 450,00</td>
              <td style={tdStyle}>R$ 7.100</td>
            </tr>
          </tbody>
        </table>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={btnStyle}>Atualizar extrato</button>
          <button style={{ ...btnStyle, backgroundColor: '#FF612B', color: '#fff' }}>Exportar PDF</button>
        </div>
      </div>

      <div style={boxStyle}>
        <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Configurações da Integração</h3>
        <p style={{ marginBottom: 6 }}>Webhook de notificações: <strong>Ativo</strong></p>
        <p style={{ marginBottom: 12 }}>Ambiente: <strong>Homologação</strong></p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <label style={{ fontSize: 14 }}>Token:</label>
          <input type="password" value="••••••••••••••••" readOnly style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: 6 }} />
          <button style={btnStyle}>Copiar</button>
        </div>
        <p style={{ fontSize: 13, textDecoration: 'underline', color: '#007bff', cursor: 'pointer' }}>
          Importar certificado MTLS
        </p>
      </div>
    </div>
  );
}

const boxStyle = {
  border: '1px solid #ccc',
  borderRadius: 8,
  padding: 16,
  flex: '1 1 300px',
  minHeight: 100,
  backgroundColor: '#ffff'
};

const boxHeader = {
  fontWeight: 'bold',
  marginBottom: 10,
  fontSize: 20,
};
const textsaldo = {
  fontWeight: 'bold',
  marginBottom: 10,
  fontSize: 25,
  color: '#13a72cff',
};
const textnaoconciliado = {
  fontWeight: 'bold',
  marginBottom: 10,
  fontSize: 25,
  color: '#c0220dff',
};
const textprojecao = {
  fontWeight: 'bold',
  marginBottom: 10,
  fontSize: 25,
  color: '#1c2536ff',
};
const btnStyle = {
  padding: '6px 12px',
  borderRadius: 6,
  backgroundColor: '#f4f4f4',
  border: '1px solid #ccc',
  cursor: 'pointer'
};

const thStyle = {
  padding: 10,
  borderBottom: '1px solid #ccc'
};

const tdStyle = {
  padding: 10,
  borderBottom: '1px solid #eee'
};
