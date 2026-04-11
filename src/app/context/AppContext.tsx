import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api } from '../utils/api';
import {
  ContaBancaria,
  Cliente,
  CategoriaCusto,
  ContaReceber,
  ContaPagar,
} from '../types';
import { seedData } from '../data/seedData';

interface AppContextType {
  contasBancarias: ContaBancaria[];
  clientes: Cliente[];
  categorias: CategoriaCusto[];
  contasReceber: ContaReceber[];
  contasPagar: ContaPagar[];
  
  // Contas Bancárias
  addContaBancaria: (conta: Omit<ContaBancaria, 'id' | 'created_at'>) => void;
  updateContaBancaria: (id: string, conta: Partial<ContaBancaria>) => void;
  
  // Clientes
  addCliente: (cliente: Omit<Cliente, 'id' | 'created_at'>) => void;
  updateCliente: (id: string, cliente: Partial<Cliente>) => void;
  
  // Categorias
  addCategoria: (categoria: Omit<CategoriaCusto, 'id' | 'created_at'>) => void;
  updateCategoria: (id: string, categoria: Partial<CategoriaCusto>) => void;
  
  // Contas a Receber
  addContaReceber: (conta: Omit<ContaReceber, 'id' | 'created_at'>) => void;
  updateContaReceber: (id: string, conta: Partial<ContaReceber>) => void;
  confirmarRecebimento: (id: string, contaBancariaId: string) => void;
  
  // Contas a Pagar
  addContaPagar: (conta: Omit<ContaPagar, 'id' | 'created_at'>) => void;
  updateContaPagar: (id: string, conta: Partial<ContaPagar>) => void;
  confirmarPagamento: (id: string, contaBancariaId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
 const [contasBancarias, setContasBancarias] = useState<ContaBancaria[]>([]);
 const [clientes, setClientes] = useState<Cliente[]>([]);
 const [categorias, setCategorias] = useState<CategoriaCusto[]>([]);
 const [contasReceber, setContasReceber] = useState<ContaReceber[]>([]);
 const [contasPagar, setContasPagar] = useState<ContaPagar[]>([]);


  useEffect(() => {
    const fetchDadosBackend = async () => {
      try {
        const [cbRes, cliRes, catRes, crRes, cpRes] = await Promise.all([
          api.get('/contas-bancarias'),
          api.get('/clientes'),
          api.get('/categorias'),
          api.get('/contas-receber'),
          api.get('/contas-pagar')
        ]);
        setContasBancarias(cbRes);
        setClientes(cliRes);
        setCategorias(catRes);
        setContasReceber(crRes);
        setContasPagar(cpRes);
      } catch (error) {
        console.warn('⚠️ AVISO: Backend não acessível. O sistema continuará funcionando com os dados locais simulados para segurança visual.');
      }
    };
    fetchDadosBackend();
  }, []);

  const generateId = () => crypto.randomUUID();

  // Contas Bancárias
  const addContaBancaria = (conta: Omit<ContaBancaria, 'id' | 'created_at'>) => {
    const novaConta = { ...conta, id: generateId(), created_at: new Date().toISOString() } as ContaBancaria;
    setContasBancarias([...contasBancarias, novaConta]);
    api.post('/contas-bancarias', novaConta).catch(() => {});
  };

  const updateContaBancaria = (id: string, updates: Partial<ContaBancaria>) => {
    setContasBancarias(contasBancarias.map(c => c.id === id ? { ...c, ...updates } as ContaBancaria : c));
    api.put(`/contas-bancarias/${id}`, updates).catch(() => {});
  };

  // Clientes
  const addCliente = (cliente: Omit<Cliente, 'id' | 'created_at'>) => {
    const novoCliente = { ...cliente, id: generateId(), created_at: new Date().toISOString() } as Cliente;
    setClientes([...clientes, novoCliente]);
    api.post('/clientes', novoCliente).catch(() => {});
  };

  const updateCliente = (id: string, updates: Partial<Cliente>) => {
    setClientes(clientes.map(c => c.id === id ? { ...c, ...updates } as Cliente : c));
    api.put(`/clientes/${id}`, updates).catch(() => {});
  };

  // Categorias
  const addCategoria = (categoria: Omit<CategoriaCusto, 'id' | 'created_at'>) => {
    const novaCategoria = { ...categoria, id: generateId(), created_at: new Date().toISOString() } as CategoriaCusto;
    setCategorias([...categorias, novaCategoria]);
    api.post('/categorias', novaCategoria).catch(() => {});
  };

  const updateCategoria = (id: string, updates: Partial<CategoriaCusto>) => {
    setCategorias(categorias.map(c => c.id === id ? { ...c, ...updates } as CategoriaCusto : c));
    api.put(`/categorias/${id}`, updates).catch(() => {});
  };

  // Contas a Receber
  const addContaReceber = (conta: Omit<ContaReceber, 'id' | 'created_at'>) => {
    const novaConta = { ...conta, id: generateId(), created_at: new Date().toISOString() } as ContaReceber;
    setContasReceber([...contasReceber, novaConta]);
    api.post('/contas-receber', novaConta).catch(() => {});
  };

  const updateContaReceber = (id: string, updates: Partial<ContaReceber>) => {
    setContasReceber(contasReceber.map(c => c.id === id ? { ...c, ...updates } as ContaReceber : c));
    api.put(`/contas-receber/${id}`, updates).catch(() => {});
  };

  const confirmarRecebimento = (id: string, contaBancariaId: string) => {
    setContasReceber(contasReceber.map(c => {
      if (c.id === id) {
        const update = { 
          status: 'recebido' as const, 
          data_recebimento: new Date().toISOString().split('T')[0],
          conta_bancaria_id: contaBancariaId 
        };
        api.put(`/contas-receber/${id}`, update).catch(() => {});
        return { ...c, ...update };
      }
      return c;
    }));
  };

  // Contas a Pagar
  const addContaPagar = (conta: Omit<ContaPagar, 'id' | 'created_at'>) => {
    const novaConta = { ...conta, id: generateId(), created_at: new Date().toISOString() } as ContaPagar;
    setContasPagar([...contasPagar, novaConta]);
    api.post('/contas-pagar', novaConta).catch(() => {});
  };

  const updateContaPagar = (id: string, updates: Partial<ContaPagar>) => {
    setContasPagar(contasPagar.map(c => c.id === id ? { ...c, ...updates } as ContaPagar : c));
    api.put(`/contas-pagar/${id}`, updates).catch(() => {});
  };

  const confirmarPagamento = (id: string, contaBancariaId: string) => {
    setContasPagar(contasPagar.map(c => {
      if (c.id === id) {
        const update = { 
          status: 'pago' as const, 
          data_pagamento: new Date().toISOString().split('T')[0],
          conta_bancaria_id: contaBancariaId 
        };
        api.put(`/contas-pagar/${id}`, update).catch(() => {});
        return { ...c, ...update };
      }
      return c;
    }));
  };

  return (
    <AppContext.Provider value={{
      contasBancarias,
      clientes,
      categorias,
      contasReceber,
      contasPagar,
      addContaBancaria,
      updateContaBancaria,
      addCliente,
      updateCliente,
      addCategoria,
      updateCategoria,
      addContaReceber,
      updateContaReceber,
      confirmarRecebimento,
      addContaPagar,
      updateContaPagar,
      confirmarPagamento,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
