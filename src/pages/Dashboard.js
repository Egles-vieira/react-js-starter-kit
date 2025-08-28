import React from 'react';

function Dashboard() {
  const iframeUrl = "http://bi.cfernandes.heavy.tec.br/public/dashboard/e00a56bc-5713-44be-8463-51a94927ed47";

  return (
    <div style={{ marginLeft: '2px', padding: '20px',   borderRadius: '50px' }}>
      <iframe
        src={iframeUrl}
        frameBorder="0"
        width="100%"
        height="1000"
        allowTransparency="true"
        title="Dashboard Público Metabase"
        
      />
    </div>
  );
}

export default Dashboard;
