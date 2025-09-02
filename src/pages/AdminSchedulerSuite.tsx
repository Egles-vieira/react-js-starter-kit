import React, { useEffect, useMemo, useState } from "react";

/**
 * Road‑RW — Admin Suite (Agendamentos / Execuções / Erros / Arquivos / Logs)
 * Integração real com backend (mantém fallback em preview)
 * --------------------------------------------------------------
 *
 * O que mudou nesta versão:
 * - Ligações reais dos botões de Agendamentos (Criar, Editar, (Des)Ativar, Rodar agora)
 *   usando os endpoints do backend. Mantém fallback para dados mock APENAS nas consultas
 *   quando o preview não tem backend.
 * - Pequeno modal inline para criar/editar agendamento sem dependências externas.
 * - Listagens continuam tentando `/api/...` primeiro e caem para mock no preview.
 *
 * Se seus endpoints tiverem paths diferentes, ajuste as URLs em `API` abaixo.
 */

// -----------------------------
// Config de endpoints
// -----------------------------
const API = {
  health: "/api/cron/health",           // mantenha se já montado no server.js
  agendamentos: "/api/agendamentos",    // ok
  execucoes: "/api/jobs",               // backend monta /jobs (confirme subrota /execucoes)
  erros: "/api/erros",                  // backend usa /erros
  arquivos: "/api/arquivos",            // backend usa /arquivos
  logs: "/api/logs",                    // só funcionará se você criar esse endpoint
  agendamento: (id: number | string) => `/api/agendamentos/${id}`,
  agendamentoStatus: (id: number | string) => `/api/agendamentos/${id}/status`,
  agendamentoRun: (id: number | string) => `/api/agendamentos/${id}/run`,
};

// -----------------------------
// Utils
// -----------------------------
function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

async function fetchJson(url: string, init?: RequestInit) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), 10000);
  try {
    const token = localStorage.getItem('token');
    const headers: Record<string,string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(url, { ...init, signal: ctrl.signal, headers: { ...headers, ...(init?.headers||{}) } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    try { return text ? JSON.parse(text) : {}; } catch { return text as any; }
  } finally {
    clearTimeout(id);
  }
}

async function tryOrMock<T>(fn: () => Promise<T>, mock: T): Promise<{ data: T; mocked: boolean }>{
  try {
    const data = await fn();
    return { data, mocked: false };
  } catch (err) {
    return { data: mock, mocked: true };
  }
}

// -----------------------------
// Componentes básicos
// -----------------------------
function FilterBar({ onApply, placeholder = "Buscar…", extra }: {
  onApply?: (f: { q: string; from?: string; to?: string }) => void;
  placeholder?: string;
  extra?: React.ReactNode;
}) {
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  return (
    <div style={{display:"grid", gridTemplateColumns:"1fr 160px 160px 140px", gap: 8, alignItems: "end"}}>
      <label style={{display:"grid", gap:4}}>
        <span style={{fontSize:12, opacity:.75}}>Busca</span>
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder={placeholder} />
      </label>
      <label style={{display:"grid", gap:4}}>
        <span style={{fontSize:12, opacity:.75}}>De (data)</span>
        <input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} />
      </label>
      <label style={{display:"grid", gap:4}}>
        <span style={{fontSize:12, opacity:.75}}>Até (data)</span>
        <input type="date" value={to} onChange={(e)=>setTo(e.target.value)} />
      </label>
      <div style={{display:"flex", gap:8}}>
        {extra}
        <button onClick={()=>onApply?.({ q, from, to })}>Filtrar</button>
      </div>
    </div>
  );
}

function Section({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }){
  return (
    <section style={{border:"1px solid #e5e7eb", borderRadius:8, overflow:"hidden", background:"white"}}>
      <header style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", borderBottom:"1px solid #e5e7eb", background:"#f9fafb"}}>
        <h2 style={{margin:0, fontSize:14, fontWeight:600}}>{title}</h2>
        {right}
      </header>
      <div style={{padding:16}}>{children}</div>
    </section>
  );
}

function Badge({ ok, children }: { ok?: boolean; children: React.ReactNode }){
  return (
    <span style={{
      display:"inline-block",
      padding:"2px 8px",
      borderRadius:999,
      fontSize:12,
      color: ok ? "#065f46" : "#991b1b",
      background: ok ? "#d1fae5" : "#fee2e2",
      border: `1px solid ${ok?"#10b981":"#fca5a5"}`
    }}>{children}</span>
  );
}

// -----------------------------
// Modal simples para criar/editar agendamento
// -----------------------------
function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode }){
  if (!open) return null;
  return (
    <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,.35)", display:"grid", placeItems:"center", zIndex:50}}>
      <div style={{width:"min(800px, 92vw)", background:"#fff", borderRadius:8, overflow:"hidden", boxShadow:"0 10px 30px rgba(0,0,0,.2)"}}>
        <header style={{padding:"12px 16px", borderBottom:"1px solid #e5e7eb", background:"#f9fafb", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <strong>{title}</strong>
          <button onClick={onClose} aria-label="Fechar">✕</button>
        </header>
        <div style={{padding:16}}>{children}</div>
        {footer && <footer style={{padding:16, borderTop:"1px solid #e5e7eb", background:"#fafafa"}}>{footer}</footer>}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }){
  return (
    <label style={{display:"grid", gap:4}}>
      <span style={{fontSize:12, opacity:.75}}>{label}</span>
      {children}
    </label>
  );
}

// -----------------------------
// Main component
// -----------------------------
export default function AdminSchedulerSuite() {
  const TABS = ["Cron Health", "Agendamentos", "Execuções", "Erros", "Arquivos", "Logs"] as const;
  type Tab = typeof TABS[number];
  const [tab, setTab] = useState<Tab>("Cron Health");

  // State slices
  const [health, setHealth] = useState<any>(null);
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [execucoes, setExecucoes] = useState<any[]>([]);
  const [erros, setErros] = useState<any[]>([]);
  const [arquivos, setArquivos] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  const [mocked, setMocked] = useState<Record<string, boolean>>({});

  // Modal state
  const [editing, setEditing] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<any>({ nome:"", transportadora_id:"", cron:"", ativo:true, url:"", metodo:"POST", janela_minutos:5, headers:"{}", payload:"{}", metas:"{}" });

  // Loaders
  async function reloadAll() {
    const { data: h, mocked: mH } = await tryOrMock(
      () => fetchJson(API.health),
      { scheduler_ok: true, last_reconcile_at: new Date().toISOString(), db_agendamentos: [], bull_repeatables: [] }
    );
    setHealth(h); setMocked(s => ({ ...s, health: mH }));

    const { data: ag, mocked: mA } = await tryOrMock(
      () => fetchJson(API.agendamentos),
      [
        { id: 1, nome: "FETCH_EXTERNO_PULL", transportadora_id: 101, cron: "*/5 * * * *", janela_minutos: 5, ativo: true },
        { id: 2, nome: "CALLBACK_PUSH", transportadora_id: 102, cron: "0 * * * *", janela_minutos: 15, ativo: false },
      ]
    );
    setAgendamentos(Array.isArray(ag) ? ag : (ag?.data ?? [])); setMocked(s => ({ ...s, agendamentos: mA }));

    const { data: ex, mocked: mE } = await tryOrMock(
      () => fetchJson(API.execucoes),
      [
        { id: 9001, agendamento_id: 1, sucesso: true, inicio: new Date().toISOString(), fim: new Date().toISOString(), trace_id: "demo-1" },
        { id: 9002, agendamento_id: 2, sucesso: false, inicio: new Date().toISOString(), fim: new Date().toISOString(), trace_id: "demo-2" },
      ]
    );
    setExecucoes(Array.isArray(ex) ? ex : (ex?.data ?? [])); setMocked(s => ({ ...s, execucoes: mE }));

    const { data: er, mocked: mR } = await tryOrMock(
      () => fetchJson(API.erros),
      [ { id: 1, created_at: new Date().toISOString(), agendamento_id: 2, codigo: 500, mensagem: "Timeout no parceiro", trace_id: "demo-err-1"} ]
    );
    setErros(Array.isArray(er) ? er : (er?.data ?? [])); setMocked(s => ({ ...s, erros: mR }));

    const { data: arq, mocked: mF } = await tryOrMock(
      () => fetchJson(API.arquivos),
      [ { id: 1, created_at: new Date().toISOString(), nome: "romaneios_2025_09_01.csv", origem: "S3", bytes: 10240, trace_id: "file-1" } ]
    );
    setArquivos(Array.isArray(arq) ? arq : (arq?.data ?? [])); setMocked(s => ({ ...s, arquivos: mF }));

    const { data: lg, mocked: mL } = await tryOrMock(
      () => fetchJson(API.logs),
      [ { id: 1, timestamp: new Date().toISOString(), level: "info", message: "Scheduler tick", trace_id: "trace-123" } ]
    );
    setLogs(Array.isArray(lg) ? lg : (lg?.data ?? [])); setMocked(s => ({ ...s, logs: mL }));
  }

  useEffect(() => { reloadAll(); }, []);

  // Smoke tests
  useEffect(() => {
    if (!health) return;
    console.group("[AdminSchedulerSuite] smoke tests");
    console.assert(typeof health === "object", "health should be object");
    console.assert(Array.isArray(agendamentos), "agendamentos should be array");
    console.assert(Array.isArray(execucoes), "execucoes should be array");
    console.assert(Array.isArray(erros), "erros should be array");
    console.assert(Array.isArray(arquivos), "arquivos should be array");
    console.assert(Array.isArray(logs), "logs should be array");
    console.groupEnd();
  }, [health, agendamentos, execucoes, erros, arquivos, logs]);

  // -----------------------------
  // Ações de agendamentos (integração real)
  // -----------------------------
  async function runNow(id: number) {
    try {
      await fetchJson(API.agendamentoRun(id), { method: 'POST' });
      alert('Solicitado com sucesso');
    } catch (e: any) {
      alert('Falha ao executar: ' + (e?.message||e));
    }
  }

  async function toggleActive(r: any) {
    try {
      await fetchJson(API.agendamentoStatus(r.id), { method: 'PATCH', body: JSON.stringify({ ativo: !r.ativo }) });
      await reloadAll();
    } catch (e: any) {
      alert('Falha ao alterar status: ' + (e?.message||e));
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ nome:"", transportadora_id:"", cron:"", ativo:true, url:"", metodo:"POST", janela_minutos:5, headers:"{}", payload:"{}", metas:"{}" });
    setModalOpen(true);
  }

  function openEdit(r: any) {
    setEditing(r);
    setForm({
      nome: r.nome||"",
      transportadora_id: String(r.transportadora_id ?? ""),
      cron: r.cron||"",
      ativo: !!r.ativo,
      url: r.url||"",
      metodo: r.metodo||"POST",
      janela_minutos: r.janela_minutos ?? 5,
      headers: JSON.stringify(r.headers ?? {}, null, 2),
      payload: JSON.stringify(r.payload ?? {}, null, 2),
      metas: JSON.stringify(r.metas ?? {}, null, 2),
    });
    setModalOpen(true);
  }

  async function saveForm() {
    // sanitização mínima
    let payload: any;
    try {
      payload = {
        ...form,
        transportadora_id: Number(form.transportadora_id),
        janela_minutos: Number(form.janela_minutos)||5,
        headers: JSON.parse(form.headers||'{}'),
        payload: JSON.parse(form.payload||'{}'),
        metas: JSON.parse(form.metas||'{}'),
      };
    } catch (e) {
      alert('JSON inválido em headers/payload/metas');
      return;
    }

    try {
      if (editing) {
        await fetchJson(API.agendamento(editing.id), { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await fetchJson(API.agendamentos, { method: 'POST', body: JSON.stringify(payload) });
      }
      setModalOpen(false);
      await reloadAll();
    } catch (e: any) {
      alert('Erro ao salvar: ' + (e?.message||e));
    }
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div style={{fontFamily:"ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell", padding: 16, background: "#f3f4f6"}}>
      <h1 style={{fontSize: 22, fontWeight: 700, marginBottom: 12}}>Admin — Scheduler / Jobs / Erros</h1>
      <p style={{marginTop:0, marginBottom:16, color:"#374151"}}>
        {"Modo: "}
        <strong>{Object.values(mocked).some(Boolean) ? "preview com mocks (sem backend em consultas)" : "dados reais da API"}</strong>
      </p>

      {/* Tabs */}
      <div style={{display:"flex", gap:8, marginBottom:12, flexWrap:"wrap"}}>
        {TABS.map(t => (
          <button key={t} onClick={()=>setTab(t)}
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid #d1d5db",
              background: tab===t? "#111827": "#fff",
              color: tab===t? "#fff": "#111827",
              cursor:"pointer"
            }}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Cron Health" && (
        <div className="stack" style={{display:"grid", gap:12}}>
          <Section title="Saúde do Scheduler">
            {health ? (
              <div style={{display:"grid", gridTemplateColumns:"repeat(3, minmax(0,1fr))", gap:12}}>
                <div style={{border:"1px solid #e5e7eb", borderRadius:8, padding:12}}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                    <strong>Scheduler</strong>
                    <Badge ok={!!health.scheduler_ok}>{health.scheduler_ok? "OK":"FALHA"}</Badge>
                  </div>
                  <div style={{marginTop:8, fontSize:12, color:"#374151"}}>last_reconcile_at: {health.last_reconcile_at}</div>
                </div>
                <div style={{border:"1px solid #e5e7eb", borderRadius:8, padding:12}}>
                  <strong>Agendamentos (DB)</strong>
                  <div style={{marginTop:8, fontSize:12}}>total: {health.db_agendamentos?.length ?? 0}</div>
                </div>
                <div style={{border:"1px solid #e5e7eb", borderRadius:8, padding:12}}>
                  <strong>Repeatables (Bull)</strong>
                  <div style={{marginTop:8, fontSize:12}}>total: {health.bull_repeatables?.length ?? 0}</div>
                </div>
              </div>
            ) : (
              <div>Carregando…</div>
            )}
          </Section>

          <Section title="Payload bruto (debug)">
            <pre style={{fontSize:12, background:"#111827", color:"#e5e7eb", padding:12, borderRadius:8, overflow:"auto"}}>
              {JSON.stringify(health, null, 2)}
            </pre>
          </Section>
        </div>
      )}

      {tab === "Agendamentos" && (
        <div className="stack" style={{display:"grid", gap:12}}>
          <Section title="Ações" right={<button onClick={openCreate}>Novo</button>}>
            <FilterBar onApply={(f)=>{
              const q = f.q?.toLowerCase?.() || "";
              setAgendamentos(prev => prev.filter(x => String(x.nome).toLowerCase().includes(q)));
            }} />
          </Section>

          <Section title="Lista de Agendamentos" right={<span style={{fontSize:12, color:"#6b7280"}}>{agendamentos.length} itens</span>}>
            <div style={{overflow:"auto"}}>
              <table style={{width:"100%", fontSize:14, borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"#f9fafb"}}>
                    {"Nome,Transportadora,Cron,Janela,Status,Ações".split(",").map(h => (
                      <th key={h} style={{textAlign:"left", padding:8, borderBottom:"1px solid #e5e7eb"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {agendamentos.length === 0 && (
                    <tr><td style={{padding:8}} colSpan={6}>Nenhum registro</td></tr>
                  )}
                  {agendamentos.map(r => (
                    <tr key={r.id} style={{borderTop:"1px solid #e5e7eb"}}>
                      <td style={{padding:8, fontWeight:600}}>{r.nome}</td>
                      <td style={{padding:8}}>{r.transportadora_id}</td>
                      <td style={{padding:8, fontFamily:"ui-monospace, SFMono-Regular, Menlo, Monaco"}}>{r.cron}</td>
                      <td style={{padding:8}}>{r.janela_minutos ?? 5} min</td>
                      <td style={{padding:8}}><Badge ok={!!r.ativo}>{r.ativo? "Ativo":"Inativo"}</Badge></td>
                      <td style={{padding:8, display:"flex", gap:8, flexWrap:"wrap"}}>
                        <button onClick={()=>openEdit(r)}>Editar</button>
                        <button onClick={()=>toggleActive(r)}>{r.ativo?"Pausar":"Ativar"}</button>
                        <button onClick={()=>runNow(r.id)}>Rodar agora</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      )}

      {tab === "Execuções" && (
        <div className="stack" style={{display:"grid", gap:12}}>
          <Section title="Filtros"><FilterBar onApply={()=>{}} /></Section>
          <Section title="Execuções" right={<span style={{fontSize:12, color:"#6b7280"}}>{execucoes.length} itens</span>}>
            <div style={{overflow:"auto"}}>
              <table style={{width:"100%", fontSize:14, borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"#f9fafb"}}>
                    {"ID,Agendamento,Status,Início,Fim,Trace".split(",").map(h => (
                      <th key={h} style={{textAlign:"left", padding:8, borderBottom:"1px solid #e5e7eb"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {execucoes.length === 0 && (<tr><td style={{padding:8}} colSpan={6}>Nenhum registro</td></tr>)}
                  {execucoes.map(r => (
                    <tr key={r.id} style={{borderTop:"1px solid #e5e7eb"}}>
                      <td style={{padding:8, fontFamily:"ui-monospace"}}>{r.id}</td>
                      <td style={{padding:8}}>{r.agendamento_id}</td>
                      <td style={{padding:8}}><Badge ok={!!r.sucesso}>{r.sucesso?"OK":"FALHA"}</Badge></td>
                      <td style={{padding:8}}>{r.inicio || r.created_at}</td>
                      <td style={{padding:8}}>{r.fim || r.updated_at}</td>
                      <td style={{padding:8, fontFamily:"ui-monospace"}}>{r.trace_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      )}

      {tab === "Erros" && (
        <div className="stack" style={{display:"grid", gap:12}}>
          <Section title="Filtros"><FilterBar onApply={()=>{}} /></Section>
          <Section title="Erros de Integração" right={<span style={{fontSize:12, color:"#6b7280"}}>{erros.length} itens</span>}>
            <div style={{overflow:"auto"}}>
              <table style={{width:"100%", fontSize:14, borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"#f9fafb"}}>
                    {"Quando,Agendamento,Código,Mensagem,Trace".split(",").map(h => (
                      <th key={h} style={{textAlign:"left", padding:8, borderBottom:"1px solid #e5e7eb"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {erros.length === 0 && (<tr><td style={{padding:8}} colSpan={5}>Nenhum registro</td></tr>)}
                  {erros.map(r => (
                    <tr key={r.id} style={{borderTop:"1px solid #e5e7eb"}}>
                      <td style={{padding:8}}>{r.created_at || r.data}</td>
                      <td style={{padding:8}}>{r.agendamento_id}</td>
                      <td style={{padding:8}}>{r.codigo || r.http_status}</td>
                      <td style={{padding:8}}><pre style={{margin:0, whiteSpace:"pre-wrap", fontSize:12}}>{r.mensagem || r.detalhes}</pre></td>
                      <td style={{padding:8, fontFamily:"ui-monospace"}}>{r.trace_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      )}

      {tab === "Arquivos" && (
        <div className="stack" style={{display:"grid", gap:12}}>
          <Section title="Filtros"><FilterBar onApply={()=>{}} /></Section>
          <Section title="Arquivos Processados" right={<span style={{fontSize:12, color:"#6b7280"}}>{arquivos.length} itens</span>}>
            <div style={{overflow:"auto"}}>
              <table style={{width:"100%", fontSize:14, borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"#f9fafb"}}>
                    {"Quando,Arquivo,Origem,Bytes,Trace".split(",").map(h => (
                      <th key={h} style={{textAlign:"left", padding:8, borderBottom:"1px solid #e5e7eb"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {arquivos.length === 0 && (<tr><td style={{padding:8}} colSpan={5}>Nenhum registro</td></tr>)}
                  {arquivos.map(r => (
                    <tr key={r.id} style={{borderTop:"1px solid #e5e7eb"}}>
                      <td style={{padding:8}}>{r.created_at}</td>
                      <td style={{padding:8}}>{r.nome || r.path}</td>
                      <td style={{padding:8}}>{r.origem || r.transportadora_id}</td>
                      <td style={{padding:8}}>{r.tamanho || r.bytes}</td>
                      <td style={{padding:8, fontFamily:"ui-monospace"}}>{r.trace_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      )}

      {tab === "Logs" && (
        <div className="stack" style={{display:"grid", gap:12}}>
          <Section title="Filtros"><FilterBar onApply={()=>{}} /></Section>
          <Section title="Logs" right={<span style={{fontSize:12, color:"#6b7280"}}>{logs.length} itens</span>}>
            <div style={{overflow:"auto"}}>
              <table style={{width:"100%", fontSize:14, borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"#f9fafb"}}>
                    {"Quando,Nível,Mensagem,Trace".split(",").map(h => (
                      <th key={h} style={{textAlign:"left", padding:8, borderBottom:"1px solid #e5e7eb"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 && (<tr><td style={{padding:8}} colSpan={4}>Nenhum registro</td></tr>)}
                  {logs.map(r => (
                    <tr key={r.id || r.timestamp} style={{borderTop:"1px solid #e5e7eb"}}>
                      <td style={{padding:8}}>{r.timestamp || r.created_at}</td>
                      <td style={{padding:8}}>{r.level || r.nivel}</td>
                      <td style={{padding:8}}><pre style={{margin:0, whiteSpace:"pre-wrap", fontSize:12}}>{r.message || r.mensagem}</pre></td>
                      <td style={{padding:8, fontFamily:"ui-monospace"}}>{r.trace_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      )}

      {/* Modal de criar/editar */}
      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={editing? 'Editar agendamento' : 'Novo agendamento'}
        footer={
          <div style={{display:"flex", justifyContent:"flex-end", gap:8}}>
            <button onClick={()=>setModalOpen(false)} style={{border:"1px solid #d1d5db", padding:"6px 12px", borderRadius:6, background:"white"}}>Cancelar</button>
            <button onClick={saveForm} style={{background:"#111827", color:"#fff", padding:"6px 12px", borderRadius:6}}>Salvar</button>
          </div>
        }
      >
        <div style={{display:"grid", gap:12, gridTemplateColumns:"1fr 1fr"}}>
          <Field label="Nome"><input value={form.nome} onChange={e=>setForm(s=>({...s, nome:e.target.value}))} /></Field>
          <Field label="Transportadora ID"><input value={form.transportadora_id} onChange={e=>setForm(s=>({...s, transportadora_id:e.target.value}))} /></Field>
          <Field label="Cron"><input value={form.cron} onChange={e=>setForm(s=>({...s, cron:e.target.value}))} placeholder="*/5 * * * *" /></Field>
          <Field label="Ativo"><select value={form.ativo?"1":"0"} onChange={e=>setForm(s=>({...s, ativo:e.target.value==="1"}))}><option value="1">Sim</option><option value="0">Não</option></select></Field>
          <Field label="URL"><input value={form.url} onChange={e=>setForm(s=>({...s, url:e.target.value}))} /></Field>
          <Field label="Método"><select value={form.metodo} onChange={e=>setForm(s=>({...s, metodo:e.target.value}))}><option>POST</option><option>GET</option><option>PUT</option><option>DELETE</option></select></Field>
          <Field label="Janela (min)"><input type="number" min={1} max={1440} value={form.janela_minutos} onChange={e=>setForm(s=>({...s, janela_minutos:e.target.value}))} /></Field>
          <div></div>
          <Field label="Headers (JSON)"><textarea rows={6} value={form.headers} onChange={e=>setForm(s=>({...s, headers:e.target.value}))} /></Field>
          <Field label="Payload (JSON)"><textarea rows={6} value={form.payload} onChange={e=>setForm(s=>({...s, payload:e.target.value}))} /></Field>
          <Field label="Metas (JSON)"><textarea rows={6} value={form.metas} onChange={e=>setForm(s=>({...s, metas:e.target.value}))} /></Field>
        </div>
      </Modal>

      {/* Footer */}
      <p style={{fontSize:12, color:"#6b7280", marginTop:16}}>
        Ajuste os endpoints em <code>API</code> se necessário. Necessita proxy do Vite para <code>/api</code> → <code>http://localhost:4000</code>.
      </p>
    </div>
  );
}
