export type RootStackParamList = {
  Auth:          undefined;
  ClientApp:     undefined;
  RepartidorApp: undefined;
  RecolectorApp: undefined;
  SupervisorApp: undefined;
  AdminApp:      undefined;
};

export type AuthStackParamList = {
  Login:    undefined;
  Register: undefined;
};

export type ClientTabParamList = {
  PedidosTab: undefined;
  Historial:  undefined;
  Perfil:     undefined;
};

export type PedidosStackParamList = {
  NuevoPedido:       undefined;
  SolicitarRecogida: {
    destinoEntrega: {
      nombreDestinatario:      string;
      telefonoDestinatario:    string;
      tipoViaNombre:           string;
      nombreVia:               string;
      numeroPlaca:             string;
      numeroSecundario:        string;
      idCiudad:                number;
      idDepartamento:          number;
      idPais:                  number;
      observacionesDireccion?: string;
    };
    pedidoBase: {
      idTipoPedido:             number;
      fechaEntrega:             string;
      tipoProductoNombre:       string;
      pesoKg:                   number;
      valorDeclarado:           number;
      fragil:                   boolean;
      observacionesManifiesto?: string;
      pagadoPorRemitente:       boolean;
      precio?:                  number;
      idMetodoPago?:            number;
    };
  };
};

export type RepartidorTabParamList = {
  MiRuta:    undefined;
  Pedidos:   undefined;
  Historial: undefined;
  Perfil:    undefined;
};

export type RecolectorTabParamList = {
  Recogidas: undefined;
  Escaner:   undefined;
  Historial: undefined;
  Perfil:    undefined;
};

export type SupervisorTabParamList = {
  Dashboard:   undefined;
  Tracking:    undefined;
  Conductores: undefined;
  Perfil:      undefined;
};

export type AdminTabParamList = {
  Dashboard:     undefined;
  Usuarios:      undefined;
  Operaciones:   undefined;
  Configuracion: undefined;
};

export type RutaStackParamList = {
  MiRutaHome:       { pedidoCompletado?: string } | undefined;
  ConfirmarEntrega: {
    id:                  string;
    direccion?:          string;
    destinatario?:       string;
    telefono?:           string;
    pagadoPorRemitente?: boolean;
    precio?:             number;
    tipoOperacion?:      string;
  };
};