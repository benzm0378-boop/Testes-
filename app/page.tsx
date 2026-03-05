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
  LayoutDashboard
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// --- Types ---

type Solicitante = 'Supervisor' | 'Líder de oficina' | 'Equipe de ônibus';

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
  dataSolicitacao: string;
  horaSolicitacao: string;
}

// --- Mock Data ---

const INITIAL_DATA: TestRecord[] = [
  {
    id: '1',
    solicitante: 'Supervisor',
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
    dataSolicitacao: '2024-03-09',
    horaSolicitacao: '15:30',
  },
  {
    id: '2',
    solicitante: 'Líder de oficina',
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
    dataSolicitacao: '2024-03-10',
    horaSolicitacao: '09:15',
  }
];

// --- Components ---

const WorkshopCheck = ({ onVerified }: { onVerified: () => void }) => {
  const [status, setStatus] = useState<'pending' | 'denied'>('pending');

  return (
    <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center p-4 z-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl text-center"
      >
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <ClipboardCheck size={32} />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Verificação de Segurança</h2>
        <p className="text-zinc-400 mb-8">Antes de acessar o painel de controle, confirme o estado da oficina.</p>
        
        <div className="space-y-4">
          <p className="text-lg font-medium text-zinc-200">A oficina foi organizada?</p>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onVerified}
              className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all active:scale-95"
            >
              Sim, está organizada
            </button>
            <button
              onClick={() => setStatus('denied')}
              className="py-3 px-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl transition-all active:scale-95"
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
              className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200 text-sm flex items-start gap-3 text-left"
            >
              <AlertCircle className="shrink-0 mt-0.5" size={18} />
              <p>Por favor, realize a organização da oficina antes de prosseguir com o agendamento de testes. A segurança e ordem são fundamentais.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const TestForm = ({ onClose, onSubmit }: { onClose: () => void, onSubmit: (data: Omit<TestRecord, 'id'>) => void }) => {
  const [formData, setFormData] = useState<Partial<TestRecord>>({
    solicitante: 'Supervisor',
    percurso: 1,
    dataSolicitacao: format(new Date(), 'yyyy-MM-dd'),
    horaSolicitacao: format(new Date(), 'HH:mm'),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
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
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Supervisor">Supervisor</option>
                  <option value="Líder de oficina">Líder de oficina</option>
                  <option value="Equipe de ônibus">Equipe de ônibus</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Percurso (1-9)</label>
                <select 
                  name="percurso"
                  required
                  value={formData.percurso}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {[1,2,3,4,5,6,7,8,9].map(n => (
                    <option key={n} value={n}>Percurso {n}</option>
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
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Modelo</label>
                <input 
                  type="text" 
                  name="modelo"
                  required
                  placeholder="Ex: Volvo FH 540"
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
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
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
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
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Seção 3: Detalhes do Teste */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} /> Planejamento do Teste
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Data Início</label>
                  <input 
                    type="date" 
                    name="dataInicio"
                    required
                    onChange={handleChange}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Hora Início</label>
                  <input 
                    type="time" 
                    name="horaInicio"
                    required
                    onChange={handleChange}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Km Início</label>
                  <input 
                    type="number" 
                    name="kmInicio"
                    required
                    placeholder="0"
                    onChange={handleChange}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm"
                  />
                </div>
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
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Falha a verificar</label>
                <textarea 
                  name="falha"
                  required
                  rows={3}
                  placeholder="Descreva o problema relatado..."
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
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
              className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
            >
              Agendar Teste
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default function FieldTestDashboard() {
  const [isVerified, setIsVerified] = useState(false);
  const [records, setRecords] = useState<TestRecord[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
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
      // Campos que podem ser preenchidos depois
      dataFim: newRecord.dataFim || '-',
      horaFim: newRecord.horaFim || '-',
      kmFim: newRecord.kmFim || 0,
      feedback: newRecord.feedback || 'Aguardando teste...',
    };
    setRecords(prev => [recordWithId, ...prev]);
    setIsFormOpen(false);
  };

  const filteredRecords = records.filter(r => 
    r.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.motorista.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isVerified) {
    return <WorkshopCheck onVerified={() => setIsVerified(true)} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Controle de Testes em Campo</h1>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Gestão de Frotas & Oficina</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por placa, modelo, cliente..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm w-full md:w-64 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total de Testes', value: records.length, icon: ClipboardCheck, color: 'text-blue-400' },
            { label: 'Hoje', value: records.filter(r => r.dataInicio === format(new Date(), 'yyyy-MM-dd')).length, icon: Calendar, color: 'text-emerald-400' },
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

        {/* Spreadsheet Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-800/50 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800">
                  <th className="px-4 py-4 whitespace-nowrap">Solicitante</th>
                  <th className="px-4 py-4 whitespace-nowrap">Percurso</th>
                  <th className="px-4 py-4 whitespace-nowrap">Veículo</th>
                  <th className="px-4 py-4 whitespace-nowrap">Cliente</th>
                  <th className="px-4 py-4 whitespace-nowrap">Falha</th>
                  <th className="px-4 py-4 whitespace-nowrap">Localização</th>
                  <th className="px-4 py-4 whitespace-nowrap">Início</th>
                  <th className="px-4 py-4 whitespace-nowrap">Fim</th>
                  <th className="px-4 py-4 whitespace-nowrap">KM</th>
                  <th className="px-4 py-4 whitespace-nowrap">Motorista</th>
                  <th className="px-4 py-4 whitespace-nowrap">Solicitação</th>
                  <th className="px-4 py-4 whitespace-nowrap">Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-4 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase",
                        record.solicitante === 'Supervisor' ? "bg-blue-500/10 text-blue-400" :
                        record.solicitante === 'Líder de oficina' ? "bg-purple-500/10 text-purple-400" :
                        "bg-orange-500/10 text-orange-400"
                      )}>
                        {record.solicitante}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white border border-zinc-700">
                          {record.percurso}
                        </div>
                      </div>
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
                    <td className="px-4 py-4 max-w-[200px]">
                      <p className="text-xs text-zinc-400 truncate group-hover:whitespace-normal transition-all">{record.falha}</p>
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
                          "w-2 h-2 rounded-full",
                          record.feedback.includes('Aguardando') ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                        )} />
                        <span className="text-xs text-zinc-400 italic truncate max-w-[150px]">{record.feedback}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Footer of the spreadsheet with the button */}
          <div className="p-6 bg-zinc-900/50 border-t border-zinc-800 flex justify-center">
            <button 
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-3 px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-xl shadow-emerald-900/20 group"
            >
              <Plus size={24} className="group-hover:rotate-90 transition-transform" />
              <span>CADASTRAR NOVO TESTE</span>
            </button>
          </div>
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
      </AnimatePresence>

      {/* Floating Action for Mobile (Optional) */}
      <button 
        onClick={() => setIsFormOpen(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl z-40"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}
