export type PedidoEstado =
  | 'pendiente'
  | 'transito'
  | 'entregado'
  | 'cancelado';

export interface PedidoEstadoConfig {
  id: PedidoEstado;

  label: string;

  color: string;

  bg: string;
}

export const PEDIDO_ESTADOS: PedidoEstadoConfig[] =
  [
    {
      id: 'pendiente',

      label: 'Pendiente',

      color: '#D97706',

      bg: '#FEF3C7',
    },

    {
      id: 'transito',

      label: 'En tránsito',

      color: '#2563EB',

      bg: '#DBEAFE',
    },

    {
      id: 'entregado',

      label: 'Entregado',

      color: '#16A34A',

      bg: '#DCFCE7',
    },

    {
      id: 'cancelado',

      label: 'Cancelado',

      color: '#DC2626',

      bg: '#FEE2E2',
    },
  ];