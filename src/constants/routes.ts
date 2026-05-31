export const ROUTES = {
  AUTH: {
    LOGIN: 'Login',

    REGISTER: 'Register',
  },

  CLIENT: {
    HOME: 'Inicio',

    PEDIDOS: 'Pedidos',

    HISTORIAL: 'Historial',

    PERFIL: 'Perfil',
  },

  REPARTIDOR: {
    HOME: 'RepartidorInicio',

    MI_RUTA: 'MiRuta',

    ENTREGAS:
      'ConfirmarEntrega',

    PERFIL: 'PerfilRepartidor',
  },

  MODALS: {
    RESUMEN_PEDIDO:
      'ResumenPedidoModal',
  },
} as const;