import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Bem-vindo!
          </h1>
          <p className="text-lg text-gray-600">
            Seu projeto React em JavaScript está pronto para começar.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => alert('Projeto funcionando perfeitamente!')}
          >
            Testar Funcionalidade
          </Button>
          
          <div className="text-sm text-gray-500">
            <p>✅ React configurado</p>
            <p>✅ JavaScript puro</p>
            <p>✅ Tailwind CSS</p>
            <p>✅ Componentes UI</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Index;
