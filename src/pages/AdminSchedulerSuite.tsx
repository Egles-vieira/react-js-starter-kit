import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Busca</Label>
        <Input 
          value={q} 
          onChange={(e)=>setQ(e.target.value)} 
          placeholder={placeholder}
          className="h-9"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">De (data)</Label>
        <Input 
          type="date" 
          value={from} 
          onChange={(e)=>setFrom(e.target.value)}
          className="h-9"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Até (data)</Label>
        <Input 
          type="date" 
          value={to} 
          onChange={(e)=>setTo(e.target.value)}
          className="h-9"
        />
      </div>
      <div className="flex gap-2">
        {extra}
        <Button size="sm" onClick={()=>onApply?.({ q, from, to })}>
          Filtrar
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }){
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {right}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function StatusBadge({ ok, children }: { ok?: boolean; children: React.ReactNode }){
  return (
    <Badge variant={ok ? "default" : "destructive"} className="text-xs">
      {children}
    </Badge>
  );
}

// -----------------------------
// Modal simples para criar/editar agendamento
// -----------------------------
function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode }){
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl bg-background rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-muted/50">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose} 
            className="h-8 w-8 p-0"
            aria-label="Fechar"
          >
            ✕
          </Button>
        </div>
        <div className="p-6">{children}</div>
        {footer && (
          <div className="p-4 border-t bg-muted/30">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }){
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
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
    <div className="min-h-screen bg-background p-6">
      <div className="container max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Admin — Scheduler / Jobs / Erros</h1>
          <p className="text-muted-foreground">
            {"Modo: "}
            <span className="font-semibold">
              {Object.values(mocked).some(Boolean) ? "preview com mocks (sem backend em consultas)" : "dados reais da API"}
            </span>
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {TABS.map(t => (
            <Button 
              key={t} 
              onClick={()=>setTab(t)}
              variant={tab===t ? "default" : "outline"}
              size="sm"
              className="rounded-full"
            >
              {t}
            </Button>
          ))}
        </div>

        {tab === "Cron Health" && (
          <div className="space-y-6">
            <Section title="Saúde do Scheduler">
              {health ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold">Scheduler</h4>
                        <StatusBadge ok={!!health.scheduler_ok}>
                          {health.scheduler_ok? "OK":"FALHA"}
                        </StatusBadge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        last_reconcile_at: {health.last_reconcile_at}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <h4 className="font-semibold">Agendamentos (DB)</h4>
                      <p className="text-xs text-muted-foreground mt-2">
                        total: {health.db_agendamentos?.length ?? 0}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <h4 className="font-semibold">Repeatables (Bull)</h4>
                      <p className="text-xs text-muted-foreground mt-2">
                        total: {health.bull_repeatables?.length ?? 0}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">Carregando…</div>
              )}
            </Section>

            <Section title="Payload bruto (debug)">
              <pre className="text-xs bg-slate-900 text-slate-100 p-4 rounded-md overflow-auto">
                {JSON.stringify(health, null, 2)}
              </pre>
            </Section>
          </div>
        )}

        {tab === "Agendamentos" && (
          <div className="space-y-6">
            <Section title="Ações" right={
              <Button onClick={openCreate} size="sm">
                Novo
              </Button>
            }>
              <FilterBar onApply={(f)=>{
                const q = f.q?.toLowerCase?.() || "";
                setAgendamentos(prev => prev.filter(x => String(x.nome).toLowerCase().includes(q)));
              }} />
            </Section>

            <Section title="Lista de Agendamentos" right={
              <span className="text-xs text-muted-foreground">{agendamentos.length} itens</span>
            }>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      {["Nome", "Transportadora", "Cron", "Janela", "Status", "Ações"].map(h => (
                        <th key={h} className="text-left p-3 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {agendamentos.length === 0 && (
                      <tr>
                        <td className="p-8 text-center text-muted-foreground" colSpan={6}>
                          Nenhum registro
                        </td>
                      </tr>
                    )}
                    {agendamentos.map(r => (
                      <tr key={r.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-3 font-semibold">{r.nome}</td>
                        <td className="p-3">{r.transportadora_id}</td>
                        <td className="p-3 font-mono text-xs">{r.cron}</td>
                        <td className="p-3">{r.janela_minutos ?? 5} min</td>
                        <td className="p-3">
                          <StatusBadge ok={!!r.ativo}>
                            {r.ativo? "Ativo":"Inativo"}
                          </StatusBadge>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={()=>openEdit(r)}>
                              Editar
                            </Button>
                            <Button 
                              size="sm" 
                              variant={r.ativo ? "secondary" : "default"} 
                              onClick={()=>toggleActive(r)}
                            >
                              {r.ativo?"Pausar":"Ativar"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={()=>runNow(r.id)}>
                              Rodar agora
                            </Button>
                          </div>
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
          <div className="space-y-6">
            <Section title="Filtros">
              <FilterBar onApply={()=>{}} />
            </Section>
            <Section title="Execuções" right={
              <span className="text-xs text-muted-foreground">{execucoes.length} itens</span>
            }>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      {["ID", "Agendamento", "Status", "Início", "Fim", "Trace"].map(h => (
                        <th key={h} className="text-left p-3 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {execucoes.length === 0 && (
                      <tr>
                        <td className="p-8 text-center text-muted-foreground" colSpan={6}>
                          Nenhum registro
                        </td>
                      </tr>
                    )}
                    {execucoes.map(r => (
                      <tr key={r.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-3 font-mono text-xs">{r.id}</td>
                        <td className="p-3">{r.agendamento_id}</td>
                        <td className="p-3">
                          <StatusBadge ok={!!r.sucesso}>
                            {r.sucesso?"OK":"FALHA"}
                          </StatusBadge>
                        </td>
                        <td className="p-3 text-xs">{r.inicio || r.created_at}</td>
                        <td className="p-3 text-xs">{r.fim || r.updated_at}</td>
                        <td className="p-3 font-mono text-xs">{r.trace_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>
        )}

        {tab === "Erros" && (
          <div className="space-y-6">
            <Section title="Filtros">
              <FilterBar onApply={()=>{}} />
            </Section>
            <Section title="Erros de Integração" right={
              <span className="text-xs text-muted-foreground">{erros.length} itens</span>
            }>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      {["Quando", "Agendamento", "Código", "Mensagem", "Trace"].map(h => (
                        <th key={h} className="text-left p-3 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {erros.length === 0 && (
                      <tr>
                        <td className="p-8 text-center text-muted-foreground" colSpan={5}>
                          Nenhum registro
                        </td>
                      </tr>
                    )}
                    {erros.map(r => (
                      <tr key={r.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-3 text-xs">{r.created_at || r.data}</td>
                        <td className="p-3">{r.agendamento_id}</td>
                        <td className="p-3">{r.codigo || r.http_status}</td>
                        <td className="p-3">
                          <pre className="m-0 whitespace-pre-wrap text-xs max-w-xs">
                            {r.mensagem || r.detalhes}
                          </pre>
                        </td>
                        <td className="p-3 font-mono text-xs">{r.trace_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>
        )}

        {tab === "Arquivos" && (
          <div className="space-y-6">
            <Section title="Filtros">
              <FilterBar onApply={()=>{}} />
            </Section>
            <Section title="Arquivos Processados" right={
              <span className="text-xs text-muted-foreground">{arquivos.length} itens</span>
            }>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      {["Quando", "Arquivo", "Origem", "Bytes", "Trace"].map(h => (
                        <th key={h} className="text-left p-3 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {arquivos.length === 0 && (
                      <tr>
                        <td className="p-8 text-center text-muted-foreground" colSpan={5}>
                          Nenhum registro
                        </td>
                      </tr>
                    )}
                    {arquivos.map(r => (
                      <tr key={r.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-3 text-xs">{r.created_at}</td>
                        <td className="p-3">{r.nome || r.path}</td>
                        <td className="p-3">{r.origem || r.transportadora_id}</td>
                        <td className="p-3 text-xs">{r.tamanho || r.bytes}</td>
                        <td className="p-3 font-mono text-xs">{r.trace_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>
        )}

        {tab === "Logs" && (
          <div className="space-y-6">
            <Section title="Filtros">
              <FilterBar onApply={()=>{}} />
            </Section>
            <Section title="Logs" right={
              <span className="text-xs text-muted-foreground">{logs.length} itens</span>
            }>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      {["Quando", "Nível", "Mensagem", "Trace"].map(h => (
                        <th key={h} className="text-left p-3 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 && (
                      <tr>
                        <td className="p-8 text-center text-muted-foreground" colSpan={4}>
                          Nenhum registro
                        </td>
                      </tr>
                    )}
                    {logs.map(r => (
                      <tr key={r.id || r.timestamp} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-3 text-xs">{r.timestamp || r.created_at}</td>
                        <td className="p-3">
                          <Badge variant={r.level === 'error' ? 'destructive' : 'secondary'}>
                            {r.level || r.nivel}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <pre className="m-0 whitespace-pre-wrap text-xs max-w-md">
                            {r.message || r.mensagem}
                          </pre>
                        </td>
                        <td className="p-3 font-mono text-xs">{r.trace_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>
        )}

        {/* Modal de criar/editar */}
        <Modal 
          open={modalOpen} 
          onClose={()=>setModalOpen(false)} 
          title={editing? 'Editar agendamento' : 'Novo agendamento'}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={()=>setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={saveForm}>
                Salvar
              </Button>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nome">
              <Input 
                value={form.nome} 
                onChange={e=>setForm(s=>({...s, nome:e.target.value}))} 
              />
            </Field>
            <Field label="Transportadora ID">
              <Input 
                value={form.transportadora_id} 
                onChange={e=>setForm(s=>({...s, transportadora_id:e.target.value}))} 
              />
            </Field>
            <Field label="Cron">
              <Input 
                value={form.cron} 
                onChange={e=>setForm(s=>({...s, cron:e.target.value}))} 
                placeholder="*/5 * * * *" 
              />
            </Field>
            <Field label="Ativo">
              <Select value={form.ativo?"1":"0"} onValueChange={v=>setForm(s=>({...s, ativo:v==="1"}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Sim</SelectItem>
                  <SelectItem value="0">Não</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="URL">
              <Input 
                value={form.url} 
                onChange={e=>setForm(s=>({...s, url:e.target.value}))} 
              />
            </Field>
            <Field label="Método">
              <Select value={form.metodo} onValueChange={v=>setForm(s=>({...s, metodo:v}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Janela (min)">
              <Input 
                type="number" 
                min={1} 
                max={1440} 
                value={form.janela_minutos} 
                onChange={e=>setForm(s=>({...s, janela_minutos:e.target.value}))} 
              />
            </Field>
            <div></div>
            <Field label="Headers (JSON)">
              <Textarea 
                rows={6} 
                value={form.headers} 
                onChange={e=>setForm(s=>({...s, headers:e.target.value}))} 
              />
            </Field>
            <Field label="Payload (JSON)">
              <Textarea 
                rows={6} 
                value={form.payload} 
                onChange={e=>setForm(s=>({...s, payload:e.target.value}))} 
              />
            </Field>
            <Field label="Metas (JSON)">
              <Textarea 
                rows={6} 
                value={form.metas} 
                onChange={e=>setForm(s=>({...s, metas:e.target.value}))} 
              />
            </Field>
          </div>
        </Modal>

        {/* Footer */}
        <div className="text-xs text-muted-foreground mt-8 text-center">
          Ajuste os endpoints em <code className="bg-muted px-1 rounded">API</code> se necessário. 
          Necessita proxy do Vite para <code className="bg-muted px-1 rounded">/api</code> → <code className="bg-muted px-1 rounded">http://localhost:4000</code>.
        </div>
      </div>
    </div>
  );
}
