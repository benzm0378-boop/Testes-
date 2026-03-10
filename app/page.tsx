'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { io } from 'socket.io-client';
import { 
  Plus, 
  ClipboardCheck, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Truck, 
  AlertCircle,
  AlertTriangle,
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
  Play,
  Edit,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// --- Types ---

type Solicitante = string;



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
  tipoVeiculo: 'Caminhão' | 'Ônibus' | 'Sprinter';
  testeEngatado: 'Sim' | 'Não';
  isDeleted?: boolean;
  updatedAt?: string;
}

// --- Mock Data ---

const INITIAL_DATA: TestRecord[] = [];

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

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error: any) {
      console.error('Error fetching users:', error);
      throw error;
    }
  };

  const saveUser = async (user: any) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return { error: data.error || `HTTP error! status: ${response.status}` };
      }
      return data;
    } catch (error: any) {
      console.error('Error saving user:', error);
      return { error: 'Falha ao conectar com o servidor' };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const users = await fetchUsers();

      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('As senhas não coincidem');
          setIsLoading(false);
          return;
        }

        if (users.find((u: any) => u.username.toLowerCase().trim() === username.toLowerCase().trim())) {
          setError('Este usuário já existe');
          setIsLoading(false);
          return;
        }

        const result = await saveUser({ 
          firstName, 
          lastName, 
          username, 
          role, 
          registration: password, 
          password,
          isActive: true,
          presenceStatus: 'presente',
          lastPresenceUpdate: null
        });
        
        if (result.error) {
          setError(result.error);
        } else {
          setMode('login');
          setError('');
          alert('Cadastro realizado com sucesso! Faça login para continuar.');
        }
      } else {
        const user = users.find((u: any) => 
          u.username.toLowerCase().trim() === username.toLowerCase().trim() && 
          u.password === password
        );
        if (user) {
          if (user.isActive === false) {
            setError('Este usuário foi desativado. Entre em contato com o administrador.');
            setIsLoading(false);
            return;
          }
          onLogin(user);
        } else {
          setError('Usuário ou senha incorretos');
        }
      }
    } catch (err: any) {
      setError('Erro ao conectar com o servidor. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
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
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all placeholder:text-zinc-700 text-sm [&:-webkit-autofill]:shadow-[0_0_0_1000px_#09090b_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
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
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all placeholder:text-zinc-700 text-sm [&:-webkit-autofill]:shadow-[0_0_0_1000px_#09090b_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
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
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all placeholder:text-zinc-700 text-sm [&:-webkit-autofill]:shadow-[0_0_0_1000px_#09090b_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
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
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-12 py-3 text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all placeholder:text-zinc-700 text-sm [&:-webkit-autofill]:shadow-[0_0_0_1000px_#09090b_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
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
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-12 py-3 text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all placeholder:text-zinc-700 text-sm [&:-webkit-autofill]:shadow-[0_0_0_1000px_#09090b_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
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

const TestForm = ({ onClose, onSubmit, initialData, currentUser, drivers }: { 
  onClose: () => void, 
  onSubmit: (data: Omit<TestRecord, 'id'>) => void,
  initialData?: TestRecord,
  currentUser: any,
  drivers: string[]
}) => {
    const userFullName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '';
    
    const [formData, setFormData] = useState<Partial<TestRecord>>(initialData || {
    solicitante: userFullName,
    motorista: drivers.length > 0 ? drivers[0] : '',
    percurso: 1,
    dataSolicitacao: format(new Date(), 'yyyy-MM-dd'),
    horaSolicitacao: format(new Date(), 'HH:mm'),
    tipoVeiculo: 'Caminhão',
    testeEngatado: 'Não',
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
    const submissionData = {
      ...formData,
      kmInicio: formData.kmInicio ? Number(formData.kmInicio) : 0,
      kmFim: formData.kmFim ? Number(formData.kmFim) : 0,
      percurso: formData.percurso ? Number(formData.percurso) : 1,
    };
    onSubmit(submissionData as Omit<TestRecord, 'id'>);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden my-8 mx-auto"
      >
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 text-sky-500 rounded-lg">
              {initialData ? <Edit size={20} /> : <Plus size={20} />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {initialData ? 'EDITAR AGENDAMENTO' : 'NOVO TESTE'}
              </h2>
              {!initialData && (
                <p className="text-[10px] text-sky-500 font-bold mt-1 uppercase tracking-[0.2em]">
                  Preenchimento das informações do teste
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8">
          <div className="mb-8 pb-6 border-b border-zinc-800/50 hidden sm:block">
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Informações do Teste</h1>
            <p className="text-zinc-500 text-xs font-medium">Preencha os dados abaixo para registrar o novo percurso no sistema.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Seção 1: Origem */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <User size={14} /> Solicitante & Origem
              </h3>
              
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Solicitante</label>
                <div className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-400 font-medium flex items-center gap-2">
                  <User size={16} className="text-zinc-600" />
                  {formData.solicitante}
                </div>
                <input type="hidden" name="solicitante" value={formData.solicitante} />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Percurso</label>
                <select 
                  name="percurso"
                  required
                  value={formData.percurso}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all"
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
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all [&:-webkit-autofill]:shadow-[0_0_0_1000px_#09090b_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Hora Solicit.</label>
                  <input 
                    type="time" 
                    name="horaSolicitacao"
                    value={formData.horaSolicitacao}
                    onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all [&:-webkit-autofill]:shadow-[0_0_0_1000px_#09090b_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
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
                  value={formData.placa || ''}
                  placeholder="Ex: ABC-1234"
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all [&:-webkit-autofill]:shadow-[0_0_0_1000px_#09090b_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Ordem de Serviço (OS)</label>
                <input 
                  type="text" 
                  name="os"
                  required
                  value={formData.os || ''}
                  placeholder="Ex: 123456"
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all [&:-webkit-autofill]:shadow-[0_0_0_1000px_#09090b_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Tipo de Veículo</label>
                  <select 
                    name="tipoVeiculo"
                    required
                    value={formData.tipoVeiculo || ''}
                    onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                  >
                    <option value="Caminhão">Caminhão</option>
                    <option value="Ônibus">Ônibus</option>
                    <option value="Sprinter">Sprinter</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Teste Engatado?</label>
                  <select 
                    name="testeEngatado"
                    required
                    value={formData.testeEngatado || ''}
                    onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                  >
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Modelo</label>
                <input 
                  type="text" 
                  name="modelo"
                  required
                  value={formData.modelo || ''}
                  placeholder="Ex: Actros 2651"
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all [&:-webkit-autofill]:shadow-[0_0_0_1000px_#09090b_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Nome do Cliente</label>
                <input 
                  type="text" 
                  name="cliente"
                  required
                  value={formData.cliente || ''}
                  placeholder="Nome da empresa ou cliente"
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all [&:-webkit-autofill]:shadow-[0_0_0_1000px_#09090b_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Localização do Veículo</label>
                <input 
                  type="text" 
                  name="localizacao"
                  required
                  value={formData.localizacao || ''}
                  placeholder="Ex: Box 04, Pátio B"
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all [&:-webkit-autofill]:shadow-[0_0_0_1000px_#09090b_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
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
                <select 
                  name="motorista"
                  required
                  value={formData.motorista}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                >
                  <option value="" disabled>Selecione um motorista</option>
                  {drivers.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Falha a verificar</label>
                <textarea 
                  name="falha"
                  required
                  value={formData.falha || ''}
                  rows={3}
                  placeholder="Descreva o problema relatado..."
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none transition-all [&:-webkit-autofill]:shadow-[0_0_0_1000px_#09090b_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
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
              {initialData ? 'Salvar Alterações' : 'Agendar Teste'}
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
            <div className="flex gap-2">
              <span className="text-[10px] px-1.5 py-0.5 bg-zinc-700 text-zinc-300 rounded uppercase font-bold">{test.tipoVeiculo}</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-zinc-700 text-zinc-300 rounded uppercase font-bold">Engatado: {test.testeEngatado}</span>
            </div>
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
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none [&:-webkit-autofill]:shadow-[0_0_0_1000px_#27272a_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Hora de Início</label>
              <input 
                type="time" 
                required
                value={formData.horaInicio}
                onChange={(e) => setFormData(prev => ({ ...prev, horaInicio: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none [&:-webkit-autofill]:shadow-[0_0_0_1000px_#27272a_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
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
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 outline-none [&:-webkit-autofill]:shadow-[0_0_0_1000px_#27272a_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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

const DriverFinishForm = ({ test, onClose, onSubmit }: { test: TestRecord, onClose: () => void, onSubmit: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    dataFim: format(new Date(), 'yyyy-MM-dd'),
    horaFim: format(new Date(), 'HH:mm'),
    kmFim: '',
    feedback: '',
    retornarOficina: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação extra para garantir que todos os campos estão preenchidos
    if (!formData.dataFim || !formData.horaFim || !formData.kmFim || !formData.feedback || !formData.retornarOficina) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Adiciona a resposta da pergunta ao feedback para registro
    const finalFeedback = `${formData.feedback}\n\n[Retorno à oficina: ${formData.retornarOficina.toUpperCase()}]`;
    
    onSubmit({
      ...formData,
      feedback: finalFeedback
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <CheckCircle2 size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Finalizar Execução do Teste</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-800 space-y-2">
            <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Veículo</p>
            <p className="text-white font-bold">{test.placa} - {test.modelo}</p>
            <div className="flex gap-2">
              <span className="text-[10px] px-1.5 py-0.5 bg-zinc-700 text-zinc-300 rounded uppercase font-bold">{test.tipoVeiculo}</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-zinc-700 text-zinc-300 rounded uppercase font-bold">Engatado: {test.testeEngatado}</span>
            </div>
            <p className="text-xs text-zinc-400">OS: {test.os}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Data de Fim</label>
              <input 
                type="date" 
                required
                value={formData.dataFim}
                onChange={(e) => setFormData(prev => ({ ...prev, dataFim: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Hora de Fim</label>
              <input 
                type="time" 
                required
                value={formData.horaFim}
                onChange={(e) => setFormData(prev => ({ ...prev, horaFim: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Km de Fim</label>
            <input 
              type="number" 
              required
              placeholder="Digite a quilometragem final"
              value={formData.kmFim}
              onChange={(e) => setFormData(prev => ({ ...prev, kmFim: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Feedback / Resultado Final</label>
            <textarea 
              required
              rows={3}
              placeholder="Descreva o resultado do teste. Use a palavra 'falha' se o veículo apresentar problemas."
              value={formData.feedback}
              onChange={(e) => setFormData(prev => ({ ...prev, feedback: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none"
            />
          </div>

          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-4">
            <div className="space-y-3">
              <label className="text-sm text-zinc-400 block leading-tight">
                (Consultar o solicitante do teste) <br />
                Será necessário retornar com o veículo para dentro da oficina?
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="retornarOficina" 
                    value="sim"
                    required
                    checked={formData.retornarOficina === 'sim'}
                    onChange={(e) => setFormData(prev => ({ ...prev, retornarOficina: e.target.value }))}
                    className="w-4 h-4 text-emerald-500 bg-zinc-800 border-zinc-700 focus:ring-emerald-500 focus:ring-offset-zinc-900"
                  />
                  <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">SIM</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="retornarOficina" 
                    value="não"
                    required
                    checked={formData.retornarOficina === 'não'}
                    onChange={(e) => setFormData(prev => ({ ...prev, retornarOficina: e.target.value }))}
                    className="w-4 h-4 text-emerald-500 bg-zinc-800 border-zinc-700 focus:ring-emerald-500 focus:ring-offset-zinc-900"
                  />
                  <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">NÃO</span>
                </label>
              </div>
              
              <AnimatePresence mode="wait">
                {formData.retornarOficina === 'sim' && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-[11px] font-black text-emerald-500 flex items-center gap-2 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20"
                  >
                    <CheckCircle2 size={14} />
                    ESTACIONAR O VEÍCULO NA OFICINA
                  </motion.p>
                )}
                {formData.retornarOficina === 'não' && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-[11px] font-black text-emerald-500 flex items-center gap-2 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20"
                  >
                    <CheckCircle2 size={14} />
                    ESTACIONAR O VEÍCULO NO PÁTIO EXTERNO
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button 
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
            >
              FINALIZAR TESTE
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

const PresenceModal = ({ onStatusSelect }: { onStatusSelect: (status: string) => void }) => {
  return (
    <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center p-4 z-[100]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-8 text-center"
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
        
        <h2 className="text-2xl font-bold text-white mb-2">Confirmação de Presença</h2>
        <p className="text-zinc-400 mb-8">Olá! Para continuar, informe seu status de disponibilidade para hoje.</p>
        
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => onStatusSelect('presente')}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/20"
          >
            <CheckCircle2 size={20} />
            Estou Presente
          </button>
          
          <button
            onClick={() => onStatusSelect('ausente')}
            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-red-900/20"
          >
            <AlertCircle size={20} />
            Estou Ausente
          </button>
          
          <button
            onClick={() => onStatusSelect('folga')}
            className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-amber-900/20"
          >
            <Calendar size={20} />
            Estou de Folga
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function FieldTestDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [isPresenceVerified, setIsPresenceVerified] = useState(false);
  const [records, setRecords] = useState<TestRecord[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<TestRecord | null>(null);
  const [executingTest, setExecutingTest] = useState<TestRecord | null>(null);
  const [finishingTest, setFinishingTest] = useState<TestRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(0);
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'local'>('checking');
  const [dbError, setDbError] = useState<string | null>(null);
  const socketRef = useRef<any>(null);
  const currentUserRef = useRef<any>(null);

  // Keep currentUserRef in sync
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const fetchAllUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        
        // Merge current user's local state if it's more recent than server data
        const mergedData = data.map((u: any) => {
          const currUser = currentUserRef.current;
          if (currUser && u.id === currUser.id) {
            const serverDate = u.lastPresenceUpdate ? new Date(u.lastPresenceUpdate).getTime() : 0;
            const localDate = currUser.lastPresenceUpdate ? new Date(currUser.lastPresenceUpdate).getTime() : 0;
            
            if (localDate > serverDate) {
              return { ...u, presenceStatus: currUser.presenceStatus, lastPresenceUpdate: currUser.lastPresenceUpdate };
            }
          }
          return u;
        });
        
        setAllUsers(mergedData);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  const fetchTests = useCallback(async () => {
    try {
      const response = await fetch('/api/tests');
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) errorMsg += ` - ${errorData.message}`;
        } catch (e) {
          // Not JSON
        }
        throw new Error(errorMsg);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setRecords(prev => {
          // Merge logic: only update records if server has a newer version
          // or if it's a record we don't have locally.
          // We also preserve local records that were just updated.
          const merged = [...prev];
          let changed = false;

          data.forEach((serverRecord: TestRecord) => {
            const localIndex = merged.findIndex(r => r.id === serverRecord.id);
            if (localIndex === -1) {
              merged.push(serverRecord);
              changed = true;
            } else {
              const localRecord = merged[localIndex];
              const serverTime = serverRecord.updatedAt ? new Date(serverRecord.updatedAt).getTime() : 0;
              const localTime = localRecord.updatedAt ? new Date(localRecord.updatedAt).getTime() : 0;

              if (serverTime > localTime) {
                merged[localIndex] = serverRecord;
                changed = true;
              }
            }
          });

          return changed ? merged : prev;
        });
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setIsMounted(true);
    }
  }, []);

  // Socket initialization
  useEffect(() => {
    console.log('Initializing socket connection to:', window.location.origin);
    socketRef.current = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socketRef.current.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
    });

    socketRef.current.on('presence-updated', (data: any) => {
      console.log('Presence updated received:', data);
      setAllUsers(prev => {
        const index = prev.findIndex(u => u.id === data.id);
        if (index !== -1) {
          const newUsers = [...prev];
          newUsers[index] = data;
          return newUsers;
        }
        return [...prev, data];
      });
    });

    socketRef.current.on('test-updated', (data: any) => {
      console.log('Test updated received:', data);
      const tests = Array.isArray(data) ? data : [data];
      setRecords(prev => {
        const merged = [...prev];
        let changed = false;
        tests.forEach((serverRecord: TestRecord) => {
          const index = merged.findIndex(r => r.id === serverRecord.id);
          if (index === -1) {
            merged.push(serverRecord);
            changed = true;
          } else {
            const localRecord = merged[index];
            const serverTime = serverRecord.updatedAt ? new Date(serverRecord.updatedAt).getTime() : 0;
            const localTime = localRecord.updatedAt ? new Date(localRecord.updatedAt).getTime() : 0;
            if (serverTime >= localTime) {
              merged[index] = serverRecord;
              changed = true;
            }
          }
        });
        console.log(`Merged ${tests.length} records from socket. Changed: ${changed}`);
        return changed ? merged : prev;
      });
    });

    return () => {
      if (socketRef.current) {
        console.log('Disconnecting socket...');
        socketRef.current.disconnect();
      }
    };
  }, [fetchAllUsers, fetchTests]);

  // Check Database Status
  useEffect(() => {
    const checkDb = async () => {
      try {
        const res = await fetch('/api/debug/supabase');
        const data = await res.json();
        if (data.status === 'success') {
          setDbStatus('connected');
        } else {
          setDbStatus('local');
          setDbError(data.message);
        }
      } catch (e) {
        setDbStatus('local');
        setDbError('Falha ao conectar com o servidor de diagnóstico.');
      }
    };
    checkDb();
  }, []);


  useEffect(() => {
    if (isAuthenticated) {
      fetchAllUsers();
      // Poll users every 30 seconds to keep presence status updated
      const interval = setInterval(fetchAllUsers, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchAllUsers]);

  useEffect(() => {
    if (currentUser && currentUser.role?.toLowerCase().trim() === 'motorista de teste') {
      const lastUpdate = currentUser.lastPresenceUpdate;
      if (lastUpdate) {
        const lastDate = new Date(lastUpdate).toDateString();
        const today = new Date().toDateString();
        if (lastDate === today) {
          setIsPresenceVerified(true);
        } else {
          setIsPresenceVerified(false);
        }
      } else {
        setIsPresenceVerified(false);
      }
    } else {
      setIsPresenceVerified(true);
    }
  }, [currentUser]);

  const updatePresenceStatus = async (userId: string, status: string) => {
    try {
      const now = new Date().toISOString();
      
      // Find the user to update
      let userToUpdate = allUsers.find(u => u.id === userId);
      
      // If not in allUsers (maybe not loaded yet), check if it's the current user
      if (!userToUpdate && userId === currentUser?.id) {
        userToUpdate = currentUser;
      }

      if (!userToUpdate) {
        console.error('User not found for update:', userId);
        return;
      }

      const updatedUser = { ...userToUpdate, presenceStatus: status, lastPresenceUpdate: now };

      // Update local states optimistically
      setAllUsers(prev => {
        const index = prev.findIndex(u => u.id === userId);
        if (index !== -1) {
          const newUsers = [...prev];
          newUsers[index] = updatedUser;
          return newUsers;
        }
        return [...prev, updatedUser];
      });
      
      if (userId === currentUser?.id) {
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setIsPresenceVerified(true);
      }
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Emit real-time update AFTER successful fetch
      socketRef.current?.emit('presence-update', updatedUser);
    } catch (error) {
      console.error('Error updating presence status:', error);
      fetchAllUsers();
    }
  };

  const toggleUserActive = async (userId: string) => {
    if (!confirm('Tem certeza que deseja alterar o status de ativação deste usuário?')) return;
    
    try {
      const userToUpdate = allUsers.find(u => u.id === userId);
      if (!userToUpdate) return;

      const updatedUser = { ...userToUpdate, isActive: userToUpdate.isActive === false ? true : false };

      // Update local state optimistically
      setAllUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle user status');
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      fetchAllUsers();
    }
  };

  // Session persistence
  useEffect(() => {
    const savedAuth = localStorage.getItem('isAuthenticated');
    const savedUser = localStorage.getItem('currentUser');
    const savedVerified = localStorage.getItem('isVerified');
    
    if (savedAuth === 'true' && savedUser) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(savedUser));
    }
    if (savedVerified === 'true') {
      setIsVerified(true);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('isAuthenticated', isAuthenticated.toString());
      if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('currentUser');
      }
    }
  }, [isAuthenticated, currentUser, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('isVerified', isVerified.toString());
    }
  }, [isVerified, isMounted]);

  // Fetch tests with polling
  useEffect(() => {
    fetchTests();
    const interval = setInterval(fetchTests, 10000); // Poll every 10 seconds as fallback
    return () => clearInterval(interval);
  }, [fetchTests]);

  // Save tests when records change (only if it was a user action)
  // We'll use a manual trigger for saving to avoid loops with polling
  const saveToBackend = async (data: TestRecord | TestRecord[]) => {
    try {
      console.log('Saving to backend:', Array.isArray(data) ? `${data.length} records` : `record ${data.id}`);
      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        // Emit real-time update
        if (socketRef.current) {
          console.log('Emitting test-update via socket');
          socketRef.current.emit('test-update', data);
        }
      } else {
        console.error('Failed to save to backend');
      }
    } catch (error) {
      console.error('Error saving tests:', error);
    }
  };

  const handleAddRecord = (newRecord: Omit<TestRecord, 'id'>) => {
    const now = new Date().toISOString();
    const recordWithId: TestRecord = {
      ...newRecord,
      id: Math.random().toString(36).substr(2, 9),
      motorista: newRecord.motorista || (dynamicDrivers.length > 0 ? dynamicDrivers[0] : ''),
      // Campos que serão preenchidos pelo motorista
      dataInicio: '-',
      horaInicio: '-',
      kmInicio: 0,
      // Campos que podem ser preenchidos depois
      dataFim: newRecord.dataFim || '-',
      horaFim: newRecord.horaFim || '-',
      kmFim: newRecord.kmFim || 0,
      feedback: newRecord.feedback || 'Aguardando início do teste...',
      updatedAt: now
    };
    
    setRecords(prev => [...prev, recordWithId]);
    saveToBackend(recordWithId);
    setIsFormOpen(false);
  };

  const handleUpdateRecord = (updatedData: Omit<TestRecord, 'id'>) => {
    if (!editingTest) return;
    const now = new Date().toISOString();
    const updatedRecord = { ...editingTest, ...updatedData, updatedAt: now };
    
    setRecords(prev => prev.map(r => r.id === editingTest.id ? updatedRecord : r));
    saveToBackend(updatedRecord);
    setEditingTest(null);
  };

  const handleDeleteRecord = async (id: string) => {
    const record = records.find(r => r.id === id);
    if (!record) return;

    const isStarted = record.dataInicio !== '-';
    
    if (isStarted) {
      const password = window.prompt('Este teste já está em andamento ou concluído. Para apagá-lo, confirme sua senha:');
      if (password !== currentUser?.password) {
        alert('Senha incorreta. O registro não foi apagado.');
        return;
      }
    } else {
      if (!confirm('Tem certeza que deseja apagar este teste pendente?')) {
        return;
      }
    }

    const now = new Date().toISOString();
    const updatedRecord = { ...record, isDeleted: true, updatedAt: now };

    setRecords(prev => prev.map(r => r.id === id ? updatedRecord : r));
    saveToBackend(updatedRecord);
  };

  const handleStartTest = (id: string, data: any) => {
    const now = new Date().toISOString();
    const recordToStart = records.find(r => r.id === id);
    if (!recordToStart) return;

    // Se o motorista atual for um motorista de teste, garante que o nome dele está no registro
    const currentDriverName = isDriver ? `${currentUser?.firstName} ${currentUser?.lastName}` : recordToStart.motorista;

    const updatedRecord = { 
      ...recordToStart, 
      ...data, 
      motorista: currentDriverName,
      feedback: 'Teste em andamento...', 
      updatedAt: now 
    };
    setRecords(prev => prev.map(r => r.id === id ? updatedRecord : r));
    saveToBackend(updatedRecord);
    setExecutingTest(null);
  };

  const handleFinishTest = (id: string, data: any) => {
    const now = new Date().toISOString();
    const recordToFinish = records.find(r => r.id === id);
    if (!recordToFinish) return;

    const updatedRecord = { ...recordToFinish, ...data, updatedAt: now };
    setRecords(prev => prev.map(r => r.id === id ? updatedRecord : r));
    saveToBackend(updatedRecord);
    setFinishingTest(null);
  };

  const isDriver = currentUser?.role?.toLowerCase().trim() === 'motorista de teste';
  const isAdminOrConsultant = currentUser?.role?.toLowerCase().trim() === 'administrador' || currentUser?.role?.toLowerCase().trim() === 'consultor';
  const driverName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '';

  const dynamicDrivers = allUsers
    .filter(u => u.role?.toLowerCase().trim() === 'motorista de teste' && u.isActive !== false)
    .map(u => `${u.firstName} ${u.lastName}`);

  const filteredRecords = records.filter(r => {
    if (r.isDeleted) return false;
    
    const matchesSearch = 
      r.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.motorista.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.os.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.tipoVeiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.testeEngatado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      PERCURSOS.find(p => p.id === Number(r.percurso))?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || r.dataSolicitacao === dateFilter || r.dataInicio === dateFilter || r.dataFim === dateFilter;
    
    if (isDriver) {
      const driverFirstName = currentUser.firstName.toLowerCase();
      const driverLastName = currentUser.lastName.toLowerCase();
      const recordMotorista = r.motorista.toLowerCase();
      
      const isAssigned = recordMotorista.includes(driverFirstName) || 
                         recordMotorista.includes(driverLastName) ||
                         driverName.toLowerCase().includes(recordMotorista);

      return matchesSearch && matchesDate && isAssigned;
    }
    return matchesSearch && matchesDate;
  });

  // Logic for "motorista de teste": only show the next test in the queue (FIFO) unless history is toggled
  const displayRecords = (() => {
    if (isDriver && !showHistory) {
      // Prioritize tests that are already in progress (started but not finished)
      const inProgressTest = filteredRecords.find(r => r.dataInicio !== '-' && r.dataFim === '-');
      if (inProgressTest) return [inProgressTest];

      // If no test is in progress, show the oldest unfinished test
      const nextTest = filteredRecords.find(r => r.dataFim === '-');
      return nextTest ? [nextTest] : [];
    }
    
    // Sort by date (most recent first) for history/admin view
    return [...filteredRecords].sort((a, b) => {
      const dateA = a.dataSolicitacao || '0000-00-00';
      const dateB = b.dataSolicitacao || '0000-00-00';
      return dateB.localeCompare(dateA);
    });
  })();

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

  if (!isPresenceVerified) {
    return <PresenceModal onStatusSelect={(status) => updatePresenceStatus(currentUser.id, status)} />;
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
                    <p className="text-xs text-sky-500 font-medium">Olá, {currentUser.firstName} ({currentUser.role?.trim()})</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
              <Calendar size={16} className="text-zinc-500" />
              <input 
                type="date" 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent text-xs text-zinc-300 outline-none [color-scheme:dark]"
              />
              {dateFilter && (
                <button onClick={() => setDateFilter('')} className="text-zinc-500 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-sky-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm w-full md:w-48 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
              />
            </div>

            {isDriver ? (
              <button 
                onClick={() => {
                  setIsVerified(false);
                  setIsAuthenticated(false);
                  setCurrentUser(null);
                }}
                className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
                title="Sair/ Organizar oficina"
              >
                <LogOut size={20} />
              </button>
            ) : (
              <button 
                onClick={() => {
                  setIsAuthenticated(false);
                  setCurrentUser(null);
                }}
                className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
                title="Sair"
              >
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Team Presence Status */}
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-500/10 rounded-lg">
                <User className="text-sky-500" size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Status da Equipe</h2>
                <p className="text-[10px] text-zinc-500">Disponibilidade dos motoristas para hoje</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {allUsers
              .filter(u => u.role?.toLowerCase().trim() === 'motorista de teste')
              .map(driver => {
                const isSelf = driver.id === currentUser?.id;
                const canEdit = isAdminOrConsultant || isSelf;
                const status = driver.presenceStatus || 'presente';
                const fullName = `${driver.firstName} ${driver.lastName}`;
                const isActive = driver.isActive !== false;

                if (!isActive && !isAdminOrConsultant) return null;

                return (
                  <div key={driver.id} className={cn(
                    "bg-zinc-900/50 border rounded-xl p-3 flex flex-col gap-2 transition-all hover:border-zinc-700",
                    isActive ? "border-zinc-800" : "border-red-900/30 opacity-60"
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col truncate">
                        <span className="text-[11px] font-bold text-white truncate pr-2">{fullName}</span>
                        {!isActive && <span className="text-[8px] text-red-500 font-bold uppercase">Desligado</span>}
                      </div>
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full flex-shrink-0",
                        !isActive ? "bg-zinc-700" :
                        status === 'presente' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                        status === 'ausente' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" :
                        "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                      )} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md",
                        !isActive ? "bg-zinc-800 text-zinc-500" :
                        status === 'presente' ? "bg-emerald-500/10 text-emerald-500" :
                        status === 'ausente' ? "bg-red-500/10 text-red-500" :
                        "bg-amber-500/10 text-amber-500"
                      )}>
                        {!isActive ? 'Inativo' : status}
                      </span>
                      {driver.lastPresenceUpdate && isActive && (
                        <span className="text-[8px] text-zinc-600">
                          {format(new Date(driver.lastPresenceUpdate), 'HH:mm')}
                        </span>
                      )}
                    </div>

                    {canEdit && isActive && (
                      <div className="flex gap-1 mt-1">
                        <button 
                          onClick={() => updatePresenceStatus(driver.id, 'presente')}
                          className={cn(
                            "flex-1 py-1 text-[8px] font-bold rounded-md border transition-all",
                            status === 'presente' ? "bg-emerald-600 border-emerald-500 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300"
                          )}
                          title="Presente"
                        >
                          P
                        </button>
                        <button 
                          onClick={() => updatePresenceStatus(driver.id, 'ausente')}
                          className={cn(
                            "flex-1 py-1 text-[8px] font-bold rounded-md border transition-all",
                            status === 'ausente' ? "bg-red-600 border-red-500 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300"
                          )}
                          title="Ausente"
                        >
                          A
                        </button>
                        <button 
                          onClick={() => updatePresenceStatus(driver.id, 'folga')}
                          className={cn(
                            "flex-1 py-1 text-[8px] font-bold rounded-md border transition-all",
                            status === 'folga' ? "bg-amber-600 border-amber-500 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300"
                          )}
                          title="Folga"
                        >
                          F
                        </button>
                      </div>
                    )}

                    {isAdminOrConsultant && (
                      <button 
                        onClick={() => toggleUserActive(driver.id)}
                        className={cn(
                          "mt-1 py-1 text-[8px] font-bold rounded-md border transition-all flex items-center justify-center gap-1",
                          isActive ? "bg-zinc-800 border-zinc-700 text-red-500 hover:bg-red-500/10" : "bg-emerald-600 border-emerald-500 text-white"
                        )}
                      >
                        {isActive ? <Trash2 size={10} /> : <Plus size={10} />}
                        {isActive ? 'Desligar' : 'Reativar'}
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Stats Summary */}
        {currentUser?.role?.toLowerCase().trim() !== 'motorista de teste' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total de Testes', value: records.filter(r => !r.isDeleted).length, icon: ClipboardCheck, color: 'text-blue-400' },
              { 
                label: 'Hoje', 
                value: records.filter(r => {
                  if (r.isDeleted) return false;
                  const today = format(new Date(), 'yyyy-MM-dd');
                  return r.dataSolicitacao === today || r.dataInicio === today || r.dataFim === today;
                }).length, 
                icon: Calendar, 
                color: 'text-sky-400' 
              },
              { label: 'Pendentes', value: records.filter(r => !r.isDeleted && r.dataFim === '-').length, icon: Clock, color: 'text-amber-400' },
              { label: 'Concluídos', value: records.filter(r => !r.isDeleted && r.dataFim !== '-').length, icon: CheckCircle2, color: 'text-purple-400' },
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

        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Truck className="text-sky-500" size={20} />
            {isDriver ? (showHistory ? 'Histórico de Testes' : 'Fila de Testes') : 'Todos os Testes'}
            <span className="text-xs font-medium bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700">
              {displayRecords.length}
            </span>
          </h2>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-800/50 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800">
                  <th className="px-4 py-4 whitespace-nowrap min-w-[200px]">Solicitante</th>
                  <th className="px-4 py-4 whitespace-nowrap min-w-[100px]">Percurso</th>
                  <th className="px-4 py-4 whitespace-nowrap min-w-[100px]">OS</th>
                  <th className="px-4 py-4 whitespace-nowrap min-w-[160px]">Veículo</th>
                  <th className="px-4 py-4 whitespace-nowrap min-w-[100px]">Tipo</th>
                  <th className="px-4 py-4 whitespace-nowrap min-w-[100px]">Engatado</th>
                  <th className="px-4 py-4 whitespace-nowrap min-w-[180px]">Cliente</th>
                  <th className="px-2 py-4 whitespace-nowrap min-w-[200px]">Falha</th>
                  <th className="px-2 py-4 whitespace-nowrap min-w-[140px]">Localização</th>
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
                {displayRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-4 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-bold uppercase whitespace-nowrap",
                        "bg-zinc-800 text-white border border-zinc-700"
                      )}>
                        {record.solicitante}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 group/percurso relative">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white border border-zinc-700">
                          {record.percurso}
                        </div>
                        <span className="text-xs font-bold text-white truncate max-w-[100px]">
                          {PERCURSOS.find(p => p.id === Number(record.percurso))?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-mono text-sky-500 font-bold">{record.os}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">{record.placa}</span>
                        <span className="text-xs font-bold text-white">{record.modelo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-bold text-white">{record.tipoVeiculo}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-bold text-white">{record.testeEngatado}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-bold text-white">{record.cliente}</span>
                    </td>
                    <td className="px-2 py-4">
                      <p className="text-xs font-bold text-white leading-relaxed">{record.falha}</p>
                    </td>
                    <td className="px-2 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <MapPin size={12} className="text-zinc-500" />
                        {record.localizacao}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col text-xs font-bold">
                        <span className="text-white">{record.dataInicio}</span>
                        <span className="text-white/70">{record.horaInicio}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col text-xs font-bold">
                        <span className="text-white">{record.dataFim}</span>
                        <span className="text-white/70">{record.horaFim}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col text-xs font-bold">
                        <span className="text-white">Ini: {record.kmInicio}</span>
                        <span className="text-white/70">Fim: {record.kmFim || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                          {record.motorista.charAt(0)}
                        </div>
                        {record.motorista}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col text-xs font-bold">
                        <span className="text-white">{record.dataSolicitacao}</span>
                        <span className="text-white/70">{record.horaSolicitacao}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {(() => {
                        const isAguardando = record.dataInicio === '-';
                        const isEmExecucao = record.dataInicio !== '-' && record.dataFim === '-';
                        const isConcluido = record.dataFim !== '-';
                        
                        // Check for failure keywords in feedback to distinguish between green and red
                        const feedbackLower = record.feedback.toLowerCase();
                        const temFalha = feedbackLower.includes('falha') || 
                                        feedbackLower.includes('problema') || 
                                        feedbackLower.includes('defeito') || 
                                        feedbackLower.includes('erro') ||
                                        feedbackLower.includes('apresentou');
                        
                        const isConcluidoComFalha = isConcluido && temFalha;
                        const isConcluidoSemFalha = isConcluido && !temFalha;

                        return (
                          <div className={cn(
                            "px-3 py-2 rounded-lg border flex items-center gap-2 min-w-[200px]",
                            isAguardando && "bg-zinc-500/10 border-zinc-500/20 text-zinc-500",
                            isEmExecucao && "bg-amber-500/10 border-amber-500/20 text-amber-500",
                            isConcluidoSemFalha && "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
                            isConcluidoComFalha && "bg-red-500/10 border-red-500/20 text-red-500"
                          )}>
                            <div className={cn(
                              "w-2 h-2 rounded-full shrink-0",
                              isAguardando && "bg-zinc-500",
                              isEmExecucao && "bg-amber-500 animate-pulse",
                              isConcluidoSemFalha && "bg-emerald-500",
                              isConcluidoComFalha && "bg-red-500"
                            )} />
                            <span className="text-xs font-bold italic leading-relaxed line-clamp-2">
                              {record.feedback}
                            </span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {isDriver && record.dataInicio === '-' && (
                          <button 
                            onClick={() => setExecutingTest(record)}
                            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold rounded-lg transition-all active:scale-95 flex items-center gap-2"
                          >
                            <Play size={12} fill="currentColor" />
                            INICIAR
                          </button>
                        )}
                        {isDriver && record.dataInicio !== '-' && record.dataFim === '-' && (
                          <button 
                            onClick={() => setFinishingTest(record)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition-all active:scale-95 flex items-center gap-2"
                          >
                            <CheckCircle2 size={12} />
                            FINALIZAR
                          </button>
                        )}
                        {currentUser && record.solicitante && (currentUser.firstName + " " + currentUser.lastName).localeCompare(record.solicitante, undefined, { sensitivity: 'base' }) === 0 ? (
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                if (record.dataInicio !== '-') {
                                  const password = window.prompt('Este teste já está em andamento ou concluído. Para editá-lo, confirme sua senha:');
                                  if (password !== currentUser?.password) {
                                    alert('Senha incorreta. O registro não pode ser editado.');
                                    return;
                                  }
                                }
                                setEditingTest(record);
                              }}
                              className="px-3 py-1.5 bg-amber-600/10 hover:bg-amber-600 text-amber-500 hover:text-white text-[10px] font-bold rounded-lg transition-all active:scale-95 flex items-center gap-2 border border-amber-500/20 hover:border-amber-600"
                            >
                              <Edit size={12} />
                              EDITAR
                            </button>
                            <button 
                              onClick={() => handleDeleteRecord(record.id)}
                              className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white text-[10px] font-bold rounded-lg transition-all active:scale-95 flex items-center gap-2 border border-red-500/20 hover:border-red-600"
                              title="Apagar meu teste"
                            >
                              <Trash2 size={12} />
                              APAGAR
                            </button>
                          </div>
                        ) : !isDriver && currentUser && record.solicitante && (currentUser.firstName + " " + currentUser.lastName).localeCompare(record.solicitante, undefined, { sensitivity: 'base' }) !== 0 ? (
                          <button 
                            onClick={() => handleDeleteRecord(record.id)}
                            className="px-3 py-1.5 bg-zinc-800 hover:bg-red-600 text-zinc-500 hover:text-white text-[10px] font-bold rounded-lg transition-all active:scale-95 flex items-center gap-2 border border-zinc-700 hover:border-red-600"
                            title="Apagar este teste (mesmo não sendo seu)"
                          >
                            <Trash2 size={12} />
                            APAGAR
                          </button>
                        ) : (
                          null
                        )}
                      </div>
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
        {(isFormOpen || editingTest) && (
          <TestForm 
            key={editingTest?.id || 'new'}
            currentUser={currentUser}
            drivers={dynamicDrivers}
            onClose={() => {
              setIsFormOpen(false);
              setEditingTest(null);
            }} 
            onSubmit={editingTest ? handleUpdateRecord : handleAddRecord}
            initialData={editingTest || undefined}
          />
        )}
        {executingTest && (
          <DriverStartForm 
            test={executingTest}
            onClose={() => setExecutingTest(null)}
            onSubmit={(data) => handleStartTest(executingTest.id, data)}
          />
        )}
        {finishingTest && (
          <DriverFinishForm 
            test={finishingTest}
            onClose={() => setFinishingTest(null)}
            onSubmit={(data) => handleFinishTest(finishingTest.id, data)}
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
