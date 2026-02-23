/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  CheckCircle2, 
  ChevronDown, 
  Bot, 
  Zap, 
  Microscope, 
  Activity, 
  ShieldCheck, 
  ArrowRight,
  HelpCircle,
  Menu,
  X,
  Send,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const getGenAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: 'Olá! Sou o Assistente ÂMAGO. Qual a sua dúvida sobre o App ou sobre o Protocolo?' }
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Check for API key selection if needed
    if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
      await window.aistudio.openSelectKey();
      // After opening, we proceed assuming success as per guidelines
    }

    const userText = input;
    setInput('');
    setError(null);
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        throw new Error("Chave de API não configurada. Por favor, configure a GEMINI_API_KEY nos segredos do AI Studio.");
      }

      const ai = getGenAI();
      const model = "gemini-flash-latest";
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: userText }] }],
        config: {
          systemInstruction: "Você é o Assistente Inteligente do app ÂMAGO. Seu objetivo é ajudar usuários a entenderem o método ÂMAGO de emagrecimento inteligente, focado em ajuste metabólico e microbiota intestinal. Seja profissional, encorajador e baseie-se na biologia. Não dê conselhos médicos prescritivos, mas explique os conceitos de inflamação, insulina e ecossistema intestinal conforme a copy do produto. Mantenha as respostas concisas.",
        }
      });

      const botText = response.text || "Desculpe, tive um problema ao processar sua resposta. Pode tentar novamente?";
      setMessages(prev => [...prev, { role: 'bot', text: botText }]);
    } catch (err: any) {
      console.error("Gemini Error:", err);
      let errorMessage = "Ocorreu um erro na conexão.";
      
      if (err.message?.includes("403") || err.message?.includes("Forbidden")) {
        errorMessage = "Erro 403: Acesso negado. Verifique se sua chave de API é válida e tem permissão para este modelo.";
      } else if (err.message?.includes("Requested entity was not found")) {
        errorMessage = "Modelo não encontrado. Tentando reconfigurar chave...";
        if (window.aistudio) await window.aistudio.openSelectKey();
      }

      setError(errorMessage);
      setMessages(prev => [...prev, { role: 'bot', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[calc(100vw-2rem)] sm:w-[350px] md:w-[400px] h-[500px] max-h-[70vh] bg-white rounded-[32px] shadow-2xl border border-zinc-100 flex flex-col overflow-hidden"
          >
            <div className="p-6 bg-zinc-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-xl">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold">Assistente ÂMAGO</p>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Online Agora</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-emerald-600 text-white rounded-tr-none' 
                      : 'bg-white text-zinc-800 shadow-sm border border-zinc-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-zinc-100">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-zinc-100 flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Pergunte sobre o método..."
                className="flex-1 bg-zinc-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="p-3 bg-zinc-950 text-white rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-emerald-500 text-white rounded-full shadow-2xl shadow-emerald-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
      >
        {isOpen ? <X className="w-8 h-8" /> : <Bot className="w-8 h-8" />}
      </button>
    </div>
  );
};

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-[160px] md:h-[200px] flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src="https://lh3.googleusercontent.com/d/1mwaDmMGhKk6FuvH9jYD11VOaX1AWy7YH" 
            alt="ÂMAGO Logo" 
            className="h-[120px] md:h-[160px] w-auto"
            referrerPolicy="no-referrer"
          />
        </div>
        <a 
          href="#checkout" 
          className="text-xs font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Começar Agora
        </a>
      </div>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center bg-zinc-950 text-white pt-[160px] md:pt-[200px] overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
            O App de Emagrecimento Inteligente
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            Já tentou de tudo e seu <span className="text-emerald-400">corpo não responde?</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Descubra como regular o ambiente metabólico que influencia seu peso — sem dieta radical, sem cortar tudo, sem guerra com o próprio corpo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#checkout" className="cta-button w-full sm:w-auto">
              QUERO COMEÇAR NO ÂMAGO AGORA
            </a>
          </div>
          <p className="mt-8 text-sm font-medium text-zinc-500 italic">
            Antes de emagrecer por fora, emagreça por dentro.
          </p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="w-6 h-6 text-zinc-600 animate-bounce" />
      </motion.div>
    </section>
  );
};

const Features = () => {
  const features = [
    {
      title: "Mapa do Ambiente Metabólico",
      desc: "Entenda por que seu corpo pode estar em modo de armazenamento — mesmo quando você come menos.",
      icon: <Activity className="w-6 h-6 text-emerald-400" />
    },
    {
      title: "Ecossistema Intestinal Estratégico",
      desc: "Descubra como a microbiota influencia saciedade, inflamação e resposta metabólica.",
      icon: <Microscope className="w-6 h-6 text-emerald-400" />
    },
    {
      title: "Controle Inteligente da Insulina",
      desc: "Aprenda a reduzir picos glicêmicos que mantêm o corpo travado.",
      icon: <Zap className="w-6 h-6 text-emerald-400" />
    },
    {
      title: "Estratégia Anti-Inflamação Silenciosa",
      desc: "Ajustes simples que reduzem o “freio invisível” do metabolismo.",
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />
    },
    {
      title: "Plano de Aplicação Estruturado",
      desc: "Checklist simples, organizado dentro do app, mesmo para rotina corrida.",
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />
    },
    {
      title: "Assistente Inteligente ÂMAGO",
      desc: "Um guia interativo treinado no método para orientar você durante o processo.",
      icon: <Bot className="w-6 h-6 text-emerald-400" />,
      highlight: true
    }
  ];

  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
            O que você vai desbloquear dentro do ÂMAGO:
          </h2>
          <div className="w-20 h-1.5 bg-emerald-500 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className={`p-8 rounded-3xl border ${f.highlight ? 'bg-zinc-950 text-white border-zinc-800 shadow-2xl shadow-emerald-500/10' : 'bg-zinc-50 border-zinc-100'} transition-all`}
            >
              <div className={`mb-6 p-3 rounded-2xl inline-block ${f.highlight ? 'bg-emerald-500/10' : 'bg-white shadow-sm'}`}>
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">{f.title}</h3>
              <p className={`text-sm leading-relaxed ${f.highlight ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const BiologySection = () => {
  return (
    <section className="section-padding bg-zinc-50">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-12">
          <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-xl shadow-zinc-200/50 border border-zinc-100">
            <h3 className="text-2xl md:text-3xl font-extrabold mb-6 leading-tight">
              Você não está acima do peso por falta de força.
            </h3>
            <p className="text-lg text-zinc-600 mb-8 font-medium">
              Você pode estar acima do peso porque o seu ambiente metabólico está desregulado.
            </p>
            <div className="space-y-6 text-zinc-600">
              <p>Durante anos disseram que emagrecer é apenas “comer menos”.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <p className="font-bold text-zinc-900 mb-2">A Pergunta:</p>
                  <p>Então por que duas pessoas comem parecido e têm resultados opostos?</p>
                </div>
                <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <p className="font-bold text-zinc-900 mb-2">O Sintoma:</p>
                  <p>Por que você corta calorias… e continua inchado?</p>
                </div>
              </div>
              <p className="text-xl font-bold text-zinc-900">A resposta não é matemática. É biologia.</p>
            </div>
          </div>

          <div className="text-center space-y-6">
            <p className="text-lg md:text-xl text-zinc-700 italic">
              "Estudos indicam diferenças na composição da microbiota entre pessoas magras e pessoas com obesidade."
            </p>
            <div className="flex flex-col items-center gap-4">
              <div className="text-3xl font-black tracking-tighter uppercase">
                Não é apenas comida. <br />
                <span className="text-emerald-600">É ambiente interno.</span>
              </div>
              <p className="text-zinc-500 font-medium">Se o terreno está errado, o resultado nunca vem.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const SystemSection = () => {
  return (
    <section className="section-padding bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-8 tracking-tight leading-tight">
            O ÂMAGO não é uma dieta.
          </h2>
          <p className="text-xl text-zinc-400 mb-10">
            É um sistema organizado para:
          </p>
          <ul className="space-y-6">
            {[
              "Ajustar sinais metabólicos",
              "Reorganizar o ambiente intestinal",
              "Facilitar o processo de emagrecimento"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="mt-1 p-1 bg-emerald-500 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-semibold">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-12 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
            <p className="text-emerald-400 font-bold text-lg">
              Você não vai brigar com o corpo. Vai trabalhar com ele.
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-square bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-[60px] flex items-center justify-center border border-white/10">
            <Bot className="w-32 h-32 text-emerald-400 opacity-50" />
            <div className="absolute -bottom-6 -right-6 bg-white text-zinc-950 p-6 rounded-3xl shadow-2xl max-w-[240px]">
              <p className="text-sm font-bold leading-tight">
                "Você não fica perdido tentando interpretar informação."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TargetAudience = () => {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <h2 className="text-3xl font-extrabold tracking-tight">Para quem é:</h2>
          <ul className="space-y-4">
            {[
              "Pessoas que já tentaram várias dietas",
              "Quem sente inchaço frequente",
              "Quem vive com fome ou compulsão",
              "Quem suspeita que algo interno está desregulado",
              "Quem quer estrutura, não promessa milagrosa"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-8">
          <h2 className="text-3xl font-extrabold tracking-tight">O que você pode esperar:</h2>
          <div className="space-y-4">
            {[
              "Redução gradual de inchaço",
              "Melhor organização alimentar",
              "Ambiente metabólico mais favorável ao emagrecimento",
              "Clareza sobre como seu corpo responde"
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-950 text-white text-sm font-bold shrink-0">
                  {i + 1}
                </span>
                <span className="text-lg font-semibold text-zinc-800">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
            (Sem promessas irreais. Sem mágica.)
          </p>
        </div>
      </div>
    </section>
  );
};

const Pricing = () => {
  return (
    <section id="checkout" className="section-padding bg-zinc-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl border border-zinc-100">
          <div className="bg-zinc-950 p-10 text-white text-center">
            <h2 className="text-3xl font-extrabold mb-4">🎁 Recursos Inclusos no ÂMAGO</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "Sistema Estruturado", "Jornada Guiada", "Mapa do Ecossistema", 
                "Estratégia Anti-Inflamação", "Organização Anti-Pico", "Assistente Inteligente"
              ].map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="p-10 md:p-16 text-center">
            <p className="text-zinc-500 mb-8 max-w-md mx-auto leading-relaxed">
              Se você buscasse acompanhamento especializado individual, facilmente investiria milhares de reais.
            </p>
            
            <div className="mb-10">
              <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">Acesso Vitalício por apenas:</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold text-zinc-400">R$</span>
                <span className="text-7xl font-black tracking-tighter text-zinc-950">47</span>
              </div>
            </div>

            <div className="space-y-6 mb-12 text-left max-w-md mx-auto">
              <p className="font-bold text-zinc-900">Recapitulando:</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-zinc-500 line-through">
                  <X className="w-4 h-4" /> Você não está comprando suplemento.
                </li>
                <li className="flex items-center gap-2 text-zinc-500 line-through">
                  <X className="w-4 h-4" /> Você não está comprando dieta.
                </li>
                <li className="flex items-start gap-2 font-semibold text-zinc-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Um sistema estruturado para regular o ambiente metabólico que influencia seu peso.</span>
                </li>
              </ul>
            </div>

            <a href="#" className="cta-button w-full shadow-2xl shadow-emerald-500/40 py-6 text-xl">
              👉 QUERO COMEÇAR NO ÂMAGO AGORA
            </a>
            
            <div className="mt-8 flex items-center justify-center gap-4 text-zinc-400">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Pagamento 100% Seguro</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FAQ = () => {
  const faqs = [
    {
      q: "Preciso usar probióticos?",
      a: "Não obrigatoriamente. O método prioriza organização alimentar. A modulação é estratégica, não obrigatória."
    },
    {
      q: "Substitui acompanhamento médico?",
      a: "Não. O conteúdo é educativo e não substitui orientação profissional."
    },
    {
      q: "Preciso cortar carboidratos?",
      a: "Não. Você aprenderá a organizar, não eliminar."
    },
    {
      q: "Quanto tempo por dia?",
      a: "Menos de 30 minutos para aplicação prática."
    },
    {
      q: "E se não fizer sentido para mim?",
      a: "Você tem 7 dias de garantia."
    }
  ];

  return (
    <section className="section-padding bg-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-extrabold mb-12 text-center tracking-tight">FAQ (Perguntas Frequentes)</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="group bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-bold text-zinc-900">
                {faq.q}
                <ChevronDown className="w-5 h-5 text-zinc-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-zinc-600 leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="py-12 px-6 bg-zinc-950 text-zinc-500 text-center border-t border-white/5">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-center">
          <img 
            src="https://lh3.googleusercontent.com/d/1mwaDmMGhKk6FuvH9jYD11VOaX1AWy7YH" 
            alt="ÂMAGO Logo" 
            className="h-[160px] md:h-[200px] w-auto"
            referrerPolicy="no-referrer"
          />
        </div>
        <p className="text-xs max-w-2xl mx-auto leading-relaxed">
          Este produto não substitui o parecer médico profissional. Sempre consulte seu médico para tratar de assuntos relativos à saúde. Os resultados podem variar de pessoa para pessoa.
        </p>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em]">
          © {new Date().getFullYear()} ÂMAGO - Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <div className="min-h-screen selection:bg-emerald-500 selection:text-white">
      <Navbar />
      <Hero />
      <Features />
      <BiologySection />
      <SystemSection />
      <TargetAudience />
      <Pricing />
      <FAQ />
      <Footer />
      <ChatAssistant />
    </div>
  );
}
