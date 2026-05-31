export type PedidoEstado =
  | 'pendiente'
  | 'confirmado'
  | 'recogido'
  | 'transito'
  | 'entregado'
  | 'cancelado';

export type MetodoEntrega =
  | 'pickup'
  | 'punto_fisico'
  | 'domicilio';

export interface PedidoCliente {
  id: string;

  fecha?: string;

  estado: PedidoEstado;

  cliente?: string;

  destinatario: string;

  telefono: string;

  origen: string;

  destino: string;

  direccion?: string;

  observaciones?: string;

  companyName?: string;

  mensajero?: string | null;

  pago?: string;

  estadoPago?: string;

  fechaEntrega?: string;

  weight?: string;

  declaredValue?: string;

  metodoEntrega?: MetodoEntrega | string;

  manifestObs?: string;

  fragil?: boolean;
}

export interface ResumenPedidoModalProps {
  visible: boolean;

  pedido: PedidoCliente | null;

  onClose: () => void;

  onConfirm?: () => void;

  onCancelar?: () => void;

  onEditar?: () => void;

  onIniciarViaje?: () => void;
}