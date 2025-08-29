const axios = require('axios');
const { OpenAI } = require('openai');

// Ferramentas disponíveis para o agente IA
const tools = [
  {
    type: 'function',
    function: {
      name: 'getNotaFiscal',
      description: 'Busca nota fiscal utilizando a chave de acesso.',
      parameters: {
        type: 'object',
        properties: {
          chave: {
            type: 'string',
            description: 'Chave de acesso da nota fiscal'
          }
        },
        required: ['chave']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getNotaFiscalById',
      description: 'Obtém os dados de uma nota fiscal pelo seu identificador.',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Identificador da nota fiscal'
          }
        },
        required: ['id']
      }
    }
  }
];

exports.chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const baseMessages = [
      {
        role: 'system',
        content: 'Você é um agente IA de suporte a entregas. Utilize as ferramentas disponíveis quando necessário e cite explicitamente as ferramentas usadas, explicando suas decisões.'
      },
      ...history.map(m => ({
        role: m.type === 'bot' ? 'assistant' : 'user',
        content: m.content
      })),
      { role: 'user', content: message }
    ];

    const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
    let response = await client.responses.create({ model, messages: baseMessages, tools });

    if (response.finish_reason === 'tool_calls' && Array.isArray(response.tool_calls)) {
      const toolMessages = [];

      for (const call of response.tool_calls) {
        const { name, arguments: args } = call.function;
        let result;

        try {
          const params = JSON.parse(args || '{}');
          if (name === 'getNotaFiscal') {
            const r = await axios.get(`${process.env.API_BASE_URL || 'http://localhost:3000'}/api/notas`, { params: { chave_nf: params.chave } });
            result = r.data;
          } else if (name === 'getNotaFiscalById') {
            const r = await axios.get(`${process.env.API_BASE_URL || 'http://localhost:3000'}/api/notaFiscal/${params.id}`);
            result = r.data;
          } else {
            result = { error: 'Função desconhecida' };
          }
        } catch (err) {
          result = { error: err.message };
        }

        toolMessages.push({
          role: 'tool',
          tool_call_id: call.id,
          name,
          content: JSON.stringify(result)
        });
      }

      response = await client.responses.create({
        model,
        messages: [...baseMessages, ...toolMessages]
      });
    }

    res.json({ reply: response.output_text, sources: response.output });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no agente IA' });
  }
};

// Exporta ferramentas para uso futuro
exports.tools = tools;
