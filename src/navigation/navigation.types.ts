// src/navigation/navigation.types.ts

export type RootStackParamList = {
  Auth: undefined;
  ClientApp: undefined;
  RepartidorApp: undefined;
  RecolectorApp: undefined;
  SupervisorApp: undefined;
  AdminApp: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// ─── Tab principal del cliente ───────────────────────
export type ClientTabParamList = {
  PedidosTab: undefined;
  Historial: undefined;
  Perfil: undefined;
};

// ─── Stack interno de la tab Pedidos ─────────────────
export type PedidosStackParamList = {
  NuevoPedido: undefined;
  SolicitarRecogida: undefined;
};

// ─── Otros roles ─────────────────────────────────────
export type RepartidorTabParamList = {
  MiRuta: undefined;
  Pedidos: undefined;
  Historial: undefined;
  Perfil: undefined;
};

export type RecolectorTabParamList = {
  Recogidas: undefined;
  Escaner: undefined;
  Historial: undefined;
  Perfil: undefined;
};

export type SupervisorTabParamList = {
  Dashboard: undefined;
  Tracking: undefined;
  Conductores: undefined;
  Perfil: undefined;
};

export type AdminTabParamList = {
  Dashboard: undefined;
  Usuarios: undefined;
  Operaciones: undefined;
  Configuracion: undefined;
};

export type RutaStackParamList = {
  MiRutaHome:       { pedidoCompletado?: string } | undefined;
  ConfirmarEntrega: {
    id:           string;
    direccion?:   string;
    destinatario?: string;
    telefono?:    string;
  };
};