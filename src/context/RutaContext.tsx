// src/context/RutaContext.tsx

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { apiClient } from '@/api';
import { getApiErrorMessage } from '@/utils/helpers';
import {
  filtrarPedidosEnRuta,
  parsePedidosList,
  pedidoEstadoId,
  REPARTIDOR_PEDIDOS_PARAMS,
} from '@/utils/pedidos-api';

type EstadoPedido = 'PROXIMO' | 'PENDIENTE' | 'COMPLETADO';

interface Pedido {
  id:                 string;
  direccion:          string;
  ciudad:             string;
  destinatario:       string;
  telefono:           string;
  observacion:        string;
  estado:             EstadoPedido;
  accion:             string;
  idEstadoPedido:     number;
  tipoOperacion:      string;
  pagadoPorRemitente: boolean;
  precio:             number;
  lat?:               number;
  lng?:               number;
}

interface RutaContextData {
  pedidos:         Pedido[];
  cargando:        boolean;
  error:           string;
  cargarPedidos:   () => Promise<void>;
  completarPedido: (id: string) => void;
}

const RutaContext = createContext<RutaContextData>({} as RutaContextData);

function apiToPedido(p: Record<string, unknown>, index: number): Pedido {
  const nombre = typeof p.destinatarioNombre === 'string' ? p.destinatarioNombre : 'Sin nombre';
  const tel    = typeof p.destinatarioTelefono === 'string' ? p.destinatarioTelefono : 'Sin telefono';
  const obs    = typeof p.observacionesManifiesto === 'string'
    ? p.observacionesManifiesto
    : (p.fragil ? 'Fragil - manejar con cuidado' : 'Sin observaciones');

  return {
    id:                 String(p.idPedido),
    direccion:          typeof p.direccion === 'string' ? p.direccion : 'Sin direccion',
    ciudad:             '',
    destinatario:       nombre,
    telefono:           tel,
    observacion:        obs,
    estado:             index === 0 ? 'PROXIMO' : 'PENDIENTE',
    accion:             index === 0 ? 'Siguiente Entrega' : 'Iniciar Entrega',
    idEstadoPedido:     pedidoEstadoId(p),
    tipoOperacion:      typeof p.tipoOperacion === 'string' ? p.tipoOperacion : 'DESPACHO',
    pagadoPorRemitente: typeof p.pagadoPorRemitente === 'boolean' ? p.pagadoPorRemitente : false,
    precio:             parseFloat(String(p.precio)) || 0,
  };
}

export function RutaProvider({ children }: { children: ReactNode }) {
  const [pedidos,  setPedidos]  = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error,    setError]    = useState<string>('');

  const cargarPedidos = useCallback(async (): Promise<void> => {
    setCargando(true);
    setError('');
    try {
      const { data } = await apiClient.get('/repartidor/pedidos', {
        params: REPARTIDOR_PEDIDOS_PARAMS,
      });
      const lista = parsePedidosList(data);
      const activos = filtrarPedidosEnRuta(lista);
      setPedidos(activos.map((p, i) => apiToPedido(p, i)));
    } catch (e) {
      const msg = getApiErrorMessage(
        e,
        'No se pudo cargar tu ruta. Verifica tu conexión e intenta de nuevo.',
      );
      setError(msg);
      setPedidos([]);
      console.log('ERROR cargando ruta:', e);
    } finally {
      setCargando(false);
    }
  }, []);

  const completarPedido = useCallback((_id: string): void => {
    cargarPedidos();
  }, [cargarPedidos]);

  return (
    <RutaContext.Provider value={{ pedidos, cargando, error, cargarPedidos, completarPedido }}>
      {children}
    </RutaContext.Provider>
  );
}

export function useRuta() {
  return useContext(RutaContext);
}

export type { Pedido, EstadoPedido };