# Auditoria e Reconciliação de Ocorrências

## Visão Geral

Este documento detalha a abordagem para auditoria e reconciliação das tentativas de entrega e ocorrências relacionadas às notas fiscais no sistema Road-RW. O objetivo é garantir a rastreabilidade completa dos eventos, a integridade dos dados e a capacidade de identificar e corrigir discrepâncias.

## Componentes Envolvidos

A auditoria e reconciliação são suportadas pelos seguintes componentes e tabelas:

1.  **Tabela `ocorrencias`:**
    - Armazena um histórico granular de todos os eventos de tracking recebidos das transportadoras para cada nota fiscal.
    - Campos chave: `id`, `nota_fiscal_id`, `tipo_ocorrencia`, `descricao`, `data_ocorrencia`, `codigo_transportadora`, `detalhes_adicionais`, `trace_id`.
    - O `trace_id` é crucial para correlacionar a ocorrência com a execução do job ou webhook que a gerou.

2.  **Tabela `jobs_execucoes`:**
    - Registra cada execução de um job agendado pelo Bull v3.
    - Campos chave: `id`, `agendamento_id`, `status` (SUCESSO/FALHA), `executado_em`, `log`, `trace_id`.
    - Permite auditar quando e como os jobs de integração (ex: busca de ocorrências) foram executados.

3.  **Tabela `erros_integracao`:**
    - Armazena detalhes de erros ocorridos durante as integrações.
    - Campos chave: `id`, `integracao_id`, `codigo`, `mensagem`, `detalhe`, `criado_em`.
    - Essencial para identificar problemas nas comunicações com as transportadoras.

4.  **Tabela `webhooks_eventos`:**
    - Registra todos os webhooks recebidos de transportadoras.
    - Campos chave: `id`, `integracao_id`, `evento`, `payload`, `recebido_em`, `processado`.
    - Garante que todos os eventos de entrada via webhook são registrados para auditoria.

5.  **Campo `finalizada` em `notas_fiscais`:**
    - Indica se o ciclo de vida de uma nota fiscal foi concluído (ex: entrega realizada).
    - Utilizado para otimizar a busca de ocorrências, evitando processamento desnecessário para notas já finalizadas.

## Fluxo de Auditoria

O fluxo de auditoria envolve o registro consistente de informações em cada etapa do processo:

-   **Agendamento de Jobs:** Cada agendamento de job (ex: `buscar-ocorrencias-transportadora`) gera um `trace_id` único, que é propagado para as execuções do job.
-   **Execução de Jobs:** A tabela `jobs_execucoes` registra o status (sucesso/falha) e logs de cada execução. O `trace_id` da execução é associado a quaisquer ocorrências ou erros gerados.
-   **Recebimento de Webhooks:** A tabela `webhooks_eventos` registra o payload completo do webhook. O processamento do webhook deve gerar ocorrências na tabela `ocorrencias`, também com um `trace_id`.
-   **Criação de Ocorrências:** Cada ocorrência é registrada na tabela `ocorrencias` com detalhes do evento e o `trace_id` da operação que a originou.
-   **Registro de Erros:** Quaisquer falhas durante a integração ou processamento são registradas em `erros_integracao`, com referência ao `integracao_id` e, se possível, ao `trace_id`.

## Reconciliação de Ocorrências

A reconciliação visa garantir que o status das notas fiscais reflita corretamente as ocorrências registradas e que não haja lacunas ou inconsistências.

### Regra de Busca de Ocorrências

Para otimizar o processo e evitar buscas desnecessárias, a seguinte regra é aplicada:

-   **Se a `nota_fiscal.finalizada` for `true`:** O sistema **não** buscará mais ocorrências para esta nota fiscal. Considera-se que o ciclo de vida da entrega foi concluído.
-   **Se a `nota_fiscal.finalizada` for `false`:** O sistema **continuará** buscando ocorrências para esta nota fiscal em intervalos definidos (via jobs agendados ou webhooks).

### Processo de Reconciliação

1.  **Atualização do Status da Nota Fiscal:**
    - Quando uma ocorrência de `tipo_ocorrencia` como 'ENTREGA_REALIZADA' é registrada na tabela `ocorrencias`, o campo `notas_fiscais.finalizada` é automaticamente atualizado para `true`.
    - Isso é feito no `transportadoraIntegrationJob.js` após a criação da ocorrência de finalização.

2.  **Jobs de Reconciliação Periódica:**
    - Jobs agendados (via Bull v3) podem ser configurados para rodar periodicamente e verificar a consistência entre `notas_fiscais` e `ocorrencias`.
    - Exemplo: Um job pode identificar notas fiscais que deveriam estar finalizadas (ex: com data de entrega passada e sem novas ocorrências por um tempo), mas cujo campo `finalizada` ainda é `false`. Nesses casos, pode-se disparar alertas ou tentar uma nova busca de ocorrências.

3.  **Dashboard de Auditoria:**
    - Um dashboard (no Portal do Gestor) pode ser desenvolvido para visualizar:
        - Jobs executados e seus status (`jobs_execucoes`).
        - Erros de integração (`erros_integracao`).
        - Ocorrências por nota fiscal (`ocorrencias`).
        - Notas fiscais com status `finalizada=false` por um longo período sem novas ocorrências.

## Idempotência

A idempotência é garantida em múltiplos níveis para evitar duplicação de dados e processamento:

-   **Webhooks:** Cada webhook recebido deve ter um identificador único (ex: `webhook_id` ou `trace_id` do remetente). Antes de processar o payload, o sistema verifica se este `webhook_id` já foi processado na tabela `webhooks_eventos`. Se sim, o evento é ignorado ou o processamento é refeito de forma segura.
-   **Jobs:** O Bull v3 oferece mecanismos de idempotência via `jobId`. Além disso, a lógica de negócio dentro dos jobs (ex: `transportadoraIntegrationJob.js`) deve ser idempotente, ou seja, a execução repetida com os mesmos parâmetros deve produzir o mesmo resultado sem efeitos colaterais indesejados (ex: não criar ocorrências duplicadas se já existirem).
-   **Ocorrências:** A criação de ocorrências na tabela `ocorrencias` deve verificar a existência de ocorrências idênticas (pelo `nota_fiscal_id`, `tipo_ocorrencia`, `data_ocorrencia` e `codigo_transportadora`) para evitar duplicatas. O `trace_id` também ajuda a identificar se uma ocorrência já foi registrada por uma execução específica.

## Logs com `trace_id`

Todos os logs relevantes devem incluir o `trace_id` para facilitar a depuração e a auditoria. Este `trace_id` deve ser propagado através das chamadas de função e serviços, permitindo rastrear uma operação completa desde o seu início (ex: recebimento de webhook, agendamento de job) até a sua conclusão (ex: criação de ocorrência, atualização de status de NF).

