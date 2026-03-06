'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  ClipboardCheck, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Truck, 
  AlertCircle,
  CheckCircle2,
  X,
  Search,
  Filter,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  Play
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// --- Types ---

type Solicitante = 'André' | 'Juan' | 'Paulo' | 'Wender' | 'Andreza' | 'Rômulo' | 'Júlio' | 'Jairo';

const SOLICITANTES: Solicitante[] = ['André', 'Juan', 'Paulo', 'Wender', 'Andreza', 'Rômulo', 'Júlio', 'Jairo'];

const PERCURSOS = [
  { id: 1, name: 'BAIRRO FLAMENGO', distance: '2 Km' },
  { id: 2, name: 'PRAÇA DA CEMIG', distance: '8,5 Km' },
  { id: 3, name: 'VIADUTO DA FIAT', distance: '22 Km' },
  { id: 4, name: 'TREVO OLHOS D\'AGUA', distance: '30 Km' },
  { id: 5, name: 'TREVO MG050 (Juatuba)', distance: '40 Km' },
  { id: 6, name: 'SÃO JOAQUIM DE BICAS', distance: '66 Km' },
  { id: 7, name: 'TREVO ALPHAVILLE', distance: '70 Km' },
  { id: 8, name: 'SERRA DE IGARAPÉ', distance: '84 Km' },
  { id: 9, name: 'OUTRO (Conforme acordo)', distance: '' },
];

interface TestRecord {
  id: string;
  solicitante: Solicitante;
  percurso: number;
  placa: string;
  modelo: string;
  cliente: string;
  falha: string;
  localizacao: string;
  dataInicio: string;
  dataFim: string;
  horaInicio: string;
  horaFim: string;
  kmInicio: number;
  kmFim: number;
  feedback: string;
  motorista: string;
  os: string;
  dataSolicitacao: string;
  horaSolicitacao: string;
}

// --- Mock Data ---

const INITIAL_DATA: TestRecord[] = [
  {
    id: '1',
    solicitante: 'André',
    percurso: 3,
    placa: 'ABC-1234',
    modelo: 'Mercedes-Benz Actros',
    cliente: 'Transportadora Silva',
    falha: 'Ruído na suspensão dianteira',
    localizacao: 'Pátio Principal',
    dataInicio: '2024-03-10',
    dataFim: '2024-03-10',
    horaInicio: '08:00',
    horaFim: '12:00',
    kmInicio: 150200,
    kmFim: 150350,
    feedback: 'Teste concluído, ruído identificado no batente.',
    motorista: 'João Santos',
    os: '12345',
    dataSolicitacao: '2024-03-09',
    horaSolicitacao: '15:30',
  },
  {
    id: '2',
    solicitante: 'Andreza',
    percurso: 1,
    placa: 'XYZ-9876',
    modelo: 'Volvo FH 540',
    cliente: 'Logística Express',
    falha: 'Perda de potência em subida',
    localizacao: 'Oficina Sul',
    dataInicio: '2024-03-11',
    dataFim: '2024-03-11',
    horaInicio: '14:00',
    horaFim: '17:00',
    kmInicio: 85400,
    kmFim: 85480,
    feedback: 'Aguardando análise de dados do scanner.',
    motorista: 'Ricardo Lima',
    os: '12346',
    dataSolicitacao: '2024-03-10',
    horaSolicitacao: '09:15',
  }
];

// --- Components ---

const LoginScreen = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [registration, setRegistration] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const getUsers = () => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('workshop_users');
    return saved ? JSON.parse(saved) : [];
  };

  const saveUser = (user: any) => {
    const users = getUsers();
    users.push(user);
    localStorage.setItem('workshop_users', JSON.stringify(users));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const users = getUsers();

      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('As senhas não coincidem');
          setIsLoading(false);
          return;
        }

        if (users.find((u: any) => u.username === username)) {
          setError('Este usuário já existe');
          setIsLoading(false);
          return;
        }

        saveUser({ firstName, lastName, username, role, registration: password, password });
        setMode('login');
        setError('');
        alert('Cadastro realizado com sucesso! Faça login para continuar.');
      } else {
        const user = users.find((u: any) => u.username === username && u.password === password);
        if (user) {
          onLogin(user);
        } else {
          setError('Usuário ou senha incorretos');
        }
      }
      setIsLoading(false);
    }, 800);
  };

  const handleForgotPassword = () => {
    alert('Funcionalidade de recuperação de senha: Entre em contato com o administrador do sistema.');
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl my-8"
      >
        <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(255,255,255,0.05)] border border-zinc-800 p-3 relative group">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/20 to-transparent rounded-full opacity-50" />
          <Image 
            src="https://www.carlogos.org/car-logos/mercedes-benz-logo.png"
            alt="Mercedes-Benz Star"
            width={80}
            height={80}
            className="object-contain relative z-10 drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]"
            unoptimized
            priority
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            {mode === 'login' ? 'Acesso ao Sistema' : 'Criar Conta'}
          </h2>
          <p className="text-zinc-500 text-sm">
            {mode === 'login' 
              ? 'Entre com suas credenciais para continuar' 
              : 'Preencha os dados abaixo para se cadastrar'}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-1">Nome</label>
                <input 
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Nome"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all placeholder:text-zinc-700 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-1">Sobrenome</label>
                <input 
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Sobrenome"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all placeholder:text-zinc-700 text-sm"
                />
              </div>
            </div>
          )}

          {mode === 'signup' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-1">Usuário</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-sky-500 transition-colors" size={18} />
                  <input 
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Digite seu usuário"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all placeholder:text-zinc-700 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-1">Função</label>
                <input 
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Ex: Motorista de teste"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all placeholder:text-zinc-700 text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-1">Usuário</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-sky-500 transition-colors" size={18} />
                <input 
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu usuário"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all placeholder:text-zinc-700 text-sm"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-1">
              {mode === 'signup' ? 'Senha (Matrícula)' : 'Senha'}
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-sky-500 transition-colors" size={18} />
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-12 py-3 text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all placeholder:text-zinc-700 text-sm"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-1">Confirmar Senha (Matrícula)</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-sky-500 transition-colors" size={18} />
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-12 py-3 text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all placeholder:text-zinc-700 text-sm"
                />
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-sky-600 focus:ring-sky-500 focus:ring-offset-zinc-900" />
                <span className="text-xs text-sky-500 group-hover:text-sky-400 font-medium transition-colors">Salvar dados de acesso</span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-sky-600 hover:bg-sky-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-sky-900/20 flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="uppercase tracking-widest text-sm">
                  {mode === 'login' ? 'Entrar no Sistema' : 'Finalizar Cadastro'}
                </span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-400">
          {mode === 'login' ? (
            <>
              Não tem uma conta?{' '}
              <button 
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
                className="text-sky-500 font-bold hover:text-sky-400 transition-colors cursor-pointer"
              >
                Cadastre-se
              </button>
            </>
          ) : (
            <>
              Já tem uma conta?{' '}
              <button 
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="text-sky-500 font-bold hover:text-sky-400 transition-colors cursor-pointer"
              >
                Faça Login
              </button>
            </>
          )}
        </div>

        <p className="mt-8 text-center text-[10px] text-zinc-600 uppercase tracking-[0.2em]">
          MinasMáquinas S/A • Acesso Restrito
        </p>
      </motion.div>
    </div>
  );
};

const WorkshopCheck = ({ onVerified }: { onVerified: () => void }) => {
  const [status, setStatus] = useState<'pending' | 'denied' | 'verified'>('pending');

  const handleVerify = () => {
    setStatus('verified');
    // Pequeno delay para o usuário ver a cor verde antes de entrar no sistema
    setTimeout(onVerified, 300);
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center p-4 z-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl text-center"
      >
        <div className="w-32 h-32 bg-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(255,255,255,0.05)] border border-zinc-800 p-4 relative group">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/20 to-transparent rounded-full opacity-50" />
          <Image 
            src="https://www.carlogos.org/car-logos/mercedes-benz-logo.png"
            alt="Mercedes-Benz Star"
            width={100}
            height={100}
            className="object-contain relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            unoptimized
            priority
            referrerPolicy="no-referrer"
          />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Organização da oficina</h2>
        <p className="text-zinc-400 mb-8">Antes de iniciar os testes de percurso, realize a organização da oficina e confirme.</p>
        
        <div className="space-y-4">
          <p className="text-lg font-medium text-zinc-200">A oficina foi organizada?</p>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleVerify}
              className={cn(
                "py-3 px-6 font-bold rounded-xl transition-all active:scale-95 cursor-pointer",
                status === 'verified'
                  ? "bg-sky-600 text-white shadow-lg shadow-sky-900/20"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              )}
            >
              Sim, está organizada
            </button>
            <button
              onClick={() => setStatus('denied')}
              className={cn(
                "py-3 px-6 font-bold rounded-xl transition-all active:scale-95 cursor-pointer",
                status === 'denied' 
                  ? "bg-red-600 text-white shadow-lg shadow-red-900/20" 
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              )}
            >
              Não, ainda não
            </button>
          </div>
        </div>

        <AnimatePresence>
          {status === 'denied' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm flex items-start gap-3 text-left"
            >
              <AlertCircle className="shrink-0 mt-0.5 text-red-500" size={18} />
              <p>Por favor realize a organização da oficina antes de prosseguir com os testes de percurso agendados. A organização é fundamental.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const TestForm = ({ onClose, onSubmit }: { onClose: () => void, onSubmit: (data: Omit<TestRecord, 'id'>) => void }) => {
    const [formData, setFormData] = useState<Partial<TestRecord>>({
    solicitante: 'André',
    percurso: 1,
    dataSolicitacao: format(new Date(), 'yyyy-MM-dd'),
    horaSolicitacao: format(new Date(), 'HH:mm'),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      // Sincroniza data de início com a data de solicitação automaticamente
      if (name === 'dataSolicitacao') {
        next.dataInicio = value;
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as Omit<TestRecord, 'id'>);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8"
      >
        <div className="p-6 border-bottom border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 text-sky-500 rounded-lg">
              <Plus size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Novo Agendamento de Teste</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Seção 1: Origem */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <User size={14} /> Solicitante & Origem
              </h3>
              
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Solicitante</label>
                <select 
                  name="solicitante"
                  required
                  value={formData.solicitante}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  {SOLICITANTES.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Percurso</label>
                <select 
                  name="percurso"
                  required
                  value={formData.percurso}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  {PERCURSOS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.id} - {p.name} {p.distance ? `(${p.distance})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Data Solicit.</label>
                  <input 
                    type="date" 
                    name="dataSolicitacao"
                    value={formData.dataSolicitacao}
                    onChange={handleChange}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Hora Solicit.</label>
                  <input 
                    type="time" 
                    name="horaSolicitacao"
                    value={formData.horaSolicitacao}
                    onChange={handleChange}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Seção 2: Veículo */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Truck size={14} /> Veículo & Cliente
              </h3>
              
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Placa do Veículo</label>
                <input 
                  type="text" 
                  name="placa"
                  required
                  placeholder="Ex: ABC-1234"
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Ordem de Serviço (OS)</label>
                <input 
                  type="text" 
                  name="os"
                  required
                  placeholder="Ex: 123456"
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Modelo</label>
                <input 
                  type="text" 
                  name="modelo"
                  required
                  placeholder="Ex: Actros 2651"
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Nome do Cliente</label>
                <input 
                  type="text" 
                  name="cliente"
                  required
                  placeholder="Nome da empresa ou cliente"
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Localização do Veículo</label>
                <input 
                  type="text" 
                  name="localizacao"
                  required
                  placeholder="Ex: Box 04, Pátio B"
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            {/* Seção 3: Detalhes do Teste */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} /> Planejamento do Teste
              </h3>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Motorista</label>
                <input 
                  type="text" 
                  name="motorista"
                  required
                  placeholder="Nome do motorista"
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Falha a verificar</label>
                <textarea 
                  name="falha"
                  required
                  rows={3}
                  placeholder="Descreva o problema relatado..."
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-end gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-zinc-400 hover:text-white font-medium transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-8 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-sky-900/20"
            >
              Agendar Teste
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const DriverStartForm = ({ test, onClose, onSubmit }: { test: TestRecord, onClose: () => void, onSubmit: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    dataInicio: format(new Date(), 'yyyy-MM-dd'),
    horaInicio: format(new Date(), 'HH:mm'),
    kmInicio: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 text-sky-500 rounded-lg">
              <Play size={20} fill="currentColor" />
            </div>
            <h2 className="text-xl font-bold text-white">Iniciar Execução do Teste</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-800 space-y-2">
            <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Veículo</p>
            <p className="text-white font-bold">{test.placa} - {test.modelo}</p>
            <p className="text-xs text-zinc-400">OS: {test.os}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Data de Início</label>
              <input 
                type="date" 
                required
                value={formData.dataInicio}
                onChange={(e) => setFormData(prev => ({ ...prev, dataInicio: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Hora de Início</label>
              <input 
                type="time" 
                required
                value={formData.horaInicio}
                onChange={(e) => setFormData(prev => ({ ...prev, horaInicio: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Km de Início</label>
            <input 
              type="number" 
              required
              placeholder="Digite a quilometragem atual"
              value={formData.kmInicio}
              onChange={(e) => setFormData(prev => ({ ...prev, kmInicio: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button 
              type="submit"
              className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-sky-900/20"
            >
              CONFIRMAR INÍCIO DO TESTE
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="w-full py-3 text-zinc-500 hover:text-white font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default function FieldTestDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [records, setRecords] = useState<TestRecord[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [executingTest, setExecutingTest] = useState<TestRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // Persistência simples
  useEffect(() => {
    const saved = localStorage.getItem('field_tests_v1');
    setTimeout(() => {
      setIsMounted(true);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setRecords(parsed);
        } catch (e) {
          setRecords(INITIAL_DATA);
        }
      } else {
        setRecords(INITIAL_DATA);
      }
    }, 0);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('field_tests_v1', JSON.stringify(records));
    }
  }, [records, isMounted]);

  const handleAddRecord = (newRecord: Omit<TestRecord, 'id'>) => {
    const recordWithId = {
      ...newRecord,
      id: Math.random().toString(36).substr(2, 9),
      // Campos que serão preenchidos pelo motorista
      dataInicio: '-',
      horaInicio: '-',
      kmInicio: 0,
      // Campos que podem ser preenchidos depois
      dataFim: newRecord.dataFim || '-',
      horaFim: newRecord.horaFim || '-',
      kmFim: newRecord.kmFim || 0,
      feedback: newRecord.feedback || 'Aguardando início do teste...',
    };
    setRecords(prev => [recordWithId, ...prev]);
    setIsFormOpen(false);
  };

  const isDriver = currentUser?.role?.toLowerCase().trim() === 'motorista de teste';
  const driverName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '';

  const filteredRecords = records.filter(r => {
    const matchesSearch = 
      r.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.motorista.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.os.toLowerCase().includes(searchTerm.toLowerCase()) ||
      PERCURSOS.find(p => p.id === Number(r.percurso))?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (isDriver) {
      const driverFirstName = currentUser.firstName.toLowerCase();
      const driverLastName = currentUser.lastName.toLowerCase();
      const recordMotorista = r.motorista.toLowerCase();
      
      const isAssigned = recordMotorista.includes(driverFirstName) || 
                         recordMotorista.includes(driverLastName) ||
                         driverName.toLowerCase().includes(recordMotorista);

      return matchesSearch && isAssigned;
    }
    return matchesSearch;
  });

  if (!isAuthenticated) {
    return (
      <LoginScreen 
        onLogin={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
          // Only "motorista de teste" needs to verify workshop organization
          const userRole = user.role?.toLowerCase().trim();
          if (userRole !== 'motorista de teste') {
            setIsVerified(true);
          } else {
            setIsVerified(false);
          }
        }} 
      />
    );
  }

  if (!isVerified) {
    return <WorkshopCheck onVerified={() => setIsVerified(true)} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-sky-500/30">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col items-start gap-4">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-2xl border border-zinc-800 overflow-hidden p-2 group transition-transform hover:scale-105">
              <Image 
                src="https://www.carlogos.org/car-logos/mercedes-benz-logo.png"
                alt="Mercedes-Benz Star"
                width={48}
                height={48}
                className="object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                unoptimized
                priority
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-white tracking-tight leading-none mb-1">Controle de Testes de Percurso</h1>
              <div className="flex items-center gap-2">
                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-[0.2em]">MinasMáquinas S/A</p>
                {currentUser && (
                  <>
                    <span className="text-zinc-700">•</span>
                    <p className="text-xs text-sky-500 font-medium">Olá, {currentUser.firstName} ({currentUser.role})</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser?.role?.toLowerCase().trim() === 'motorista de teste' ? (
              <button 
                onClick={() => {
                  setIsVerified(false);
                  setIsAuthenticated(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl transition-all text-sm font-medium"
                title="Voltar para Organização da Oficina"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Sair/ Organizar oficina</span>
              </button>
            ) : (
              <button 
                onClick={() => {
                  setIsAuthenticated(false);
                  setCurrentUser(null);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl transition-all text-sm font-medium"
                title="Sair do Sistema"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            )}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-sky-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por placa, OS, motorista, percurso..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm w-full md:w-64 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
              />
            </div>
            <button className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors">
              <Filter size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Stats Summary */}
        {currentUser?.role?.toLowerCase().trim() !== 'motorista de teste' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total de Testes', value: records.length, icon: ClipboardCheck, color: 'text-blue-400' },
              { label: 'Hoje', value: records.filter(r => r.dataInicio === format(new Date(), 'yyyy-MM-dd')).length, icon: Calendar, color: 'text-sky-400' },
              { label: 'Pendentes', value: records.filter(r => r.feedback.includes('Aguardando')).length, icon: Clock, color: 'text-amber-400' },
              { label: 'Concluídos', value: records.filter(r => !r.feedback.includes('Aguardando')).length, icon: CheckCircle2, color: 'text-purple-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4">
                <div className={cn("p-3 rounded-xl bg-zinc-800", stat.color)}>
                  <stat.icon size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Spreadsheet Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-800/50 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800">
                  <th className="px-4 py-4 whitespace-nowrap min-w-[120px]">Solicitante</th>
                  <th className="px-4 py-4 whitespace-nowrap min-w-[100px]">Percurso</th>
                  <th className="px-4 py-4 whitespace-nowrap min-w-[100px]">OS</th>
                  <th className="px-4 py-4 whitespace-nowrap min-w-[160px]">Veículo</th>
                  <th className="px-4 py-4 whitespace-nowrap min-w-[180px]">Cliente</th>
                  <th className="px-4 py-4 whitespace-nowrap min-w-[280px]">Falha</th>
                  <th className="px-4 py-4 whitespace-nowrap min-w-[180px]">Localização</th>
                  <th className="px-4 py-4 whitespace-nowrap min-w-[120px]">Início</th>
                  <th className="px-4 py-4 whitespace-nowrap min-w-[120px]">Fim</th>
                  <th className="px-4 py-4 whitespace-nowrap min-w-[120px]">KM</th>
                  <th className="px-4 py-4 whitespace-nowrap min-w-[160px]">Motorista</th>
                  <th className="px-4 py-4 whitespace-nowrap min-w-[120px]">Solicitação</th>
                  <th className="px-4 py-4 whitespace-nowrap min-w-[280px]">Feedback</th>
                  <th className="px-4 py-4 whitespace-nowrap min-w-[120px]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-4 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase",
                        "bg-zinc-800 text-zinc-300 border border-zinc-700"
                      )}>
                        {record.solicitante}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 group/percurso relative">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white border border-zinc-700">
                          {record.percurso}
                        </div>
                        <span className="text-[10px] text-zinc-500 truncate max-w-[100px]">
                          {PERCURSOS.find(p => p.id === Number(record.percurso))?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-mono text-sky-500 font-bold">{record.os}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{record.placa}</span>
                        <span className="text-[10px] text-zinc-500">{record.modelo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-zinc-300">{record.cliente}</span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs text-zinc-400 leading-relaxed">{record.falha}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <MapPin size={12} className="text-zinc-600" />
                        {record.localizacao}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col text-[10px]">
                        <span className="text-zinc-300">{record.dataInicio}</span>
                        <span className="text-zinc-500">{record.horaInicio}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col text-[10px]">
                        <span className="text-zinc-300">{record.dataFim}</span>
                        <span className="text-zinc-500">{record.horaFim}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col text-[10px]">
                        <span className="text-zinc-300">Ini: {record.kmInicio}</span>
                        <span className="text-zinc-500">Fim: {record.kmFim || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-xs text-zinc-300">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                          {record.motorista.charAt(0)}
                        </div>
                        {record.motorista}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col text-[10px]">
                        <span className="text-zinc-300">{record.dataSolicitacao}</span>
                        <span className="text-zinc-500">{record.horaSolicitacao}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          record.feedback.includes('Aguardando') ? "bg-amber-500 animate-pulse" : "bg-sky-500"
                        )} />
                        <span className="text-xs text-zinc-400 italic leading-relaxed">{record.feedback}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {isDriver && record.dataInicio === '-' && (
                        <button 
                          onClick={() => setExecutingTest(record)}
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold rounded-lg transition-all active:scale-95 flex items-center gap-2"
                        >
                          <Play size={12} fill="currentColor" />
                          INICIAR
                        </button>
                      )}
                      {!isDriver && (
                        <span className="text-[10px] text-zinc-600 italic">Sem ações</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Footer of the spreadsheet with the button */}
          {!isDriver && (
            <div className="p-6 bg-zinc-900/50 border-t border-zinc-800 flex justify-center">
              <button 
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-3 px-10 py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-xl shadow-sky-900/20 group"
              >
                <Plus size={24} className="group-hover:rotate-90 transition-transform" />
                <span>CADASTRAR NOVO TESTE</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isFormOpen && (
          <TestForm 
            onClose={() => setIsFormOpen(false)} 
            onSubmit={handleAddRecord}
          />
        )}
        {executingTest && (
          <DriverStartForm 
            test={executingTest}
            onClose={() => setExecutingTest(null)}
            onSubmit={(data) => {
              setRecords(prev => prev.map(r => 
                r.id === executingTest.id 
                  ? { ...r, ...data, feedback: 'Teste em andamento...' } 
                  : r
              ));
              setExecutingTest(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Floating Action for Mobile (Optional) */}
      {!isDriver && (
        <button 
          onClick={() => setIsFormOpen(true)}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-sky-600 text-white rounded-full flex items-center justify-center shadow-2xl z-40"
        >
          <Plus size={28} />
        </button>
      )}
    </div>
  );
}
