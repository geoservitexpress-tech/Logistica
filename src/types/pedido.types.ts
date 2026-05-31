export type PedidoEstado =
  | 'pendiente'
  | 'asignado'
  | 'recogido'
  | 'transito'
  | 'entregado'
  | 'cancelado';

// Subconjunto usado en las badges del cliente
export type OrderEstado = 'pendiente' | 'transito' | 'entregado';

export interface Pedido {
  id: string;
  fecha: string;
  estado: PedidoEstado;
  origen: string;
  destino: string;
  destinatario: string;
  telefono: string;
  mensajero?: string | null;
  pago: string;
  estadoPago: 'Pendiente' | 'Pagado';
  fechaEntrega?: string;
  observaciones?: string;
}

// Tipo extendido usado en las pantallas del cliente y OrderDetailModal
export interface Order {
  id: string;
  estado: OrderEstado;
  fecha?: string;
  fechaEntrega?: string;
  destinatario: string;
  telefono?: string;
  origen?: string;
  destino: string;
  companyName?: string;
  mensajero?: string;
  pago?: string;
  estadoPago?: string;
  metodoEntrega?: string;
  weight?: string | number;
  declaredValue?: string | number;
  fragil?: boolean;
  manifestObs?: string;
  fotos?: string[];
}

// Tipo usado en GuiaModal — subconjunto de Order
export type PedidoGuia = Pick<Order,
  | 'id'
  | 'destinatario'
  | 'destino'
  | 'telefono'
  | 'companyName'
  | 'weight'
  | 'declaredValue'
  | 'metodoEntrega'
  | 'manifestObs'
  | 'fecha'
  | 'fragil'
>;