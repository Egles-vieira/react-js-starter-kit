import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiMessageCircle, FiBot, FiUser, FiLoader } from 'react-icons/fi';

export default function AgenteIA() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Olá! Sou seu assistente de entregas. Como posso te ajudar hoje? Posso consultar informações sobre entregas, status de romaneios, localização de motoristas e muito mais.',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    // Simular resposta do bot (aqui você integraria com sua API de IA)
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: generateBotResponse(userMessage.content),
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const generateBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('entrega') || input.includes('delivery')) {
      return 'Para consultar entregas, posso ajudar com:\n\n• Status atual das entregas\n• Localização em tempo real\n• Previsão de chegada\n• Histórico de entregas\n\nQual informação específica você gostaria de consultar?';
    }
    
    if (input.includes('motorista') || input.includes('driver')) {
      return 'Sobre motoristas, posso fornecer:\n\n• Localização atual dos motoristas\n• Status das rotas\n• Histórico de entregas por motorista\n• Avaliações e performance\n\nQue informação sobre motoristas você precisa?';
    }
    
    if (input.includes('romaneio') || input.includes('nota fiscal')) {
      return 'Para consultas de documentos:\n\n• Status de romaneios\n• Notas fiscais vinculadas\n• Documentos pendentes\n• Histórico de documentação\n\nQual documento você gostaria de consultar?';
    }
    
    if (input.includes('localização') || input.includes('rastreamento') || input.includes('onde')) {
      return 'Para rastreamento e localização:\n\n• Posição atual dos veículos\n• Rota planejada vs executada\n• Tempo estimado de chegada\n• Histórico de trajetos\n\nQual veículo ou entrega você gostaria de rastrear?';
    }
    
    return 'Entendi sua pergunta. Posso te ajudar com informações sobre:\n\n• 📦 Entregas e status\n• 🚛 Motoristas e veículos\n• 📋 Romaneios e notas fiscais\n• 📍 Rastreamento e localização\n• 💰 Informações financeiras\n\nPoderia ser mais específico sobre o que você precisa?';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { label: 'Status das entregas', icon: <FiMessageCircle /> },
    { label: 'Localização dos motoristas', icon: <FiMessageCircle /> },
    { label: 'Romaneios pendentes', icon: <FiMessageCircle /> },
    { label: 'Entregas atrasadas', icon: <FiMessageCircle /> }
  ];

  return (
    <div className="agente-ia">
      {/* Header */}
      <div className="chat-header">
        <div className="header-content">
          <div className="bot-avatar">
            <FiBot />
          </div>
          <div className="header-info">
            <h1>Agente IA - Assistente de Entregas</h1>
            <p>Consulte informações sobre entregas, motoristas e muito mais</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Ações rápidas:</h3>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="quick-action-btn"
              onClick={() => setNewMessage(action.label)}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-avatar">
              {message.type === 'bot' ? <FiBot /> : <FiUser />}
            </div>
            <div className="message-content">
              <div className="message-text">
                {message.content.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < message.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
              <div className="message-time">{message.timestamp}</div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message bot">
            <div className="message-avatar">
              <FiBot />
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <FiLoader className="spin" />
                <span>Digitando...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input">
        <div className="input-container">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua pergunta sobre entregas..."
            rows="1"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isLoading}
            className="send-btn"
          >
            <FiSend />
          </button>
        </div>
      </div>

      <style>{`
        .agente-ia {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: hsl(var(--background));
          color: hsl(var(--foreground));
        }

        .chat-header {
          background: hsl(var(--card));
          border-bottom: 1px solid hsl(var(--border));
          padding: 20px 24px;
          flex-shrink: 0;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .bot-avatar {
          width: 48px;
          height: 48px;
          background: hsl(var(--primary));
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: hsl(var(--primary-foreground));
          font-size: 24px;
        }

        .header-info h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: hsl(var(--foreground));
        }

        .header-info p {
          margin: 4px 0 0 0;
          font-size: 14px;
          color: hsl(var(--muted-foreground));
        }

        .quick-actions {
          background: hsl(var(--card));
          border-bottom: 1px solid hsl(var(--border));
          padding: 16px 24px;
          flex-shrink: 0;
        }

        .quick-actions h3 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 500;
          color: hsl(var(--muted-foreground));
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 8px;
        }

        .quick-action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: hsl(var(--muted));
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          color: hsl(var(--foreground));
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .quick-action-btn:hover {
          background: hsl(var(--accent));
          border-color: hsl(var(--primary));
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .message {
          display: flex;
          gap: 12px;
          max-width: 80%;
        }

        .message.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 18px;
        }

        .message.bot .message-avatar {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }

        .message.user .message-avatar {
          background: hsl(var(--muted));
          color: hsl(var(--foreground));
        }

        .message-content {
          flex: 1;
        }

        .message-text {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          border-radius: 16px;
          padding: 12px 16px;
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .message.user .message-text {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border-color: hsl(var(--primary));
        }

        .message-time {
          font-size: 11px;
          color: hsl(var(--muted-foreground));
          margin-top: 4px;
          padding: 0 4px;
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          border-radius: 16px;
          padding: 12px 16px;
          font-size: 14px;
          color: hsl(var(--muted-foreground));
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .chat-input {
          background: hsl(var(--card));
          border-top: 1px solid hsl(var(--border));
          padding: 16px 24px;
          flex-shrink: 0;
        }

        .input-container {
          display: flex;
          gap: 12px;
          align-items: end;
        }

        .input-container textarea {
          flex: 1;
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px;
          color: hsl(var(--foreground));
          resize: none;
          min-height: 44px;
          max-height: 120px;
          transition: border-color 0.2s ease;
        }

        .input-container textarea:focus {
          outline: none;
          border-color: hsl(var(--primary));
        }

        .input-container textarea::placeholder {
          color: hsl(var(--muted-foreground));
        }

        .send-btn {
          width: 44px;
          height: 44px;
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border: none;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 16px;
          flex-shrink: 0;
        }

        .send-btn:hover:not(:disabled) {
          background: hsl(var(--primary) / 0.9);
          transform: translateY(-1px);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 768px) {
          .actions-grid {
            grid-template-columns: 1fr;
          }
          
          .message {
            max-width: 95%;
          }
          
          .chat-header {
            padding: 16px;
          }
          
          .messages-container {
            padding: 16px;
          }
          
          .chat-input {
            padding: 12px 16px;
          }
        }
      `}</style>
    </div>
  );
}