export interface PedidoGuia {
  id: string;

  destinatario: string;

  destino: string;

  telefono?: string;

  companyName?: string;

  weight?: string;

  declaredValue?: string;

  metodoEntrega?: string;

  manifestObs?: string;

  fecha?: string;

  fragil?: boolean;
}

export interface GuiaModalProps {
  visible: boolean;

  pedido: PedidoGuia | null;

  onConfirmar: (fotoUri: string) => void;

  onCerrar: () => void;
}