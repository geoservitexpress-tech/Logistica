// src/context/RutaContext.tsx

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { apiClient } from '@/api';

type EstadoPedido = 'PROXIMO' | 'PENDIENTE' | 'COMPLETADO';

interface Pedido {
  id:             string;
  direccion:      string;
  ciudad:         string;
  destinatario:   string;
  telefono:       string;
  observacion:    string;
  estado:         EstadoPedido;
  accion:         string;
  idEstadoPedido: number;
  tipoOperacion:  string;
  lat?:           number;
  lng?:           number;
}

interface RutaContextData {
  pedidos:         Pedido[];
  cargando:        boolean;
  cargarPedidos:   () => Promise<void>;
  completarPedido: (id: string) => void;
}

const RutaContext = createContext<RutaContextData>({} as RutaContextData);

function apiToPedido(p: Record<string, unknown>, index: number): Pedido {
  const nombre = typeof p.destinatarioNombre   === 'string' ? p.destinatarioNombre   : 'Sin nombre';
  const tel    = typeof p.destinatarioTelefono === 'string' ? p.destinatarioTelefono : 'Sin telefono';
  const obs    = typeof p.observacionesManifiesto === 'string'
    ? p.observacionesManifiesto
    : (p.fragil ? 'Fragil - manejar con cuidado' : 'Sin observaciones');

  return {
    id:             String(p.idPedido),
    direccion:      typeof p.direccion      === 'string' ? p.direccion      : 'Sin direccion',
    ciudad:         '',
    destinatario:   nombre,
    telefono:       tel,
    observacion:    obs,
    estado:         index === 0 ? 'PROXIMO' : 'PENDIENTE',
    accion:         index === 0 ? 'Siguiente Entrega' : 'Iniciar Entrega',
    idEstadoPedido: typeof p.idEstadoPedido === 'number' ? p.idEstadoPedido : 0,
    tipoOperacion:  typeof p.tipoOperacion  === 'string' ? p.tipoOperacion  : 'DESPACHO',
  };
}

export function RutaProvider({ children }: { children: ReactNode }) {
  const [pedidos,  setPedidos]  = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);

  const cargarPedidos = useCallback(async (): Promise<void> => {
    setCargando(true);
    try {
      const { data } = await apiClient.get('/repartidor/pedidos');
      const lista = Array.isArray(data) ? data : [];
      const activos = lista.filter((p: Record<string, unknown>) =>
        p.idEstadoPedido === 3 || p.idEstadoPedido === 4,
      );
      setPedidos(activos.map((p: Record<string, unknown>, i: number) => apiToPedido(p, i)));
    } catch (e) {
      console.log('ERROR cargando ruta:', e);
    } finally {
      setCargando(false);
    }
  }, []);

  const completarPedido = (id: string): void => {
    setPedidos((prev) => {
      const updated = prev.map((p) =>
        p.id === id ? { ...p, estado: 'COMPLETADO' as EstadoPedido } : p,
      );
      const hayProximo = updated.some((p) => p.estado === 'PROXIMO');
      if (!hayProximo) {
        const idxPendiente = updated.findIndex((p) => p.estado === 'PENDIENTE');
        if (idxPendiente !== -1) {
          updated[idxPendiente] = {
            ...updated[idxPendiente],
            estado: 'PROXIMO',
            accion: 'Siguiente Entrega',
          };
        }
      }
      return updated;
    });
  };

  return (
    <RutaContext.Provider value={{ pedidos, cargando, cargarPedidos, completarPedido }}>
      {children}
    </RutaContext.Provider>
  );
}

export function useRuta() {
  return useContext(RutaContext);
}

export type { Pedido, EstadoPedido };