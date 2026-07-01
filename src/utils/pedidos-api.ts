export interface PedidoListadoPaginado {
  total?:        number;
  page?:         number;
  limit?:        number;
  totalPaginas?: number;
  items?:        unknown[];
}

export const ESTADO_PEDIDO = {
  CREADO:             1,
  ASIGNADO:           2,
  RECIBIDO_REPARTIDOR: 3,
  EN_CURSO:           4,
  ENTREGADO:          5,
  CANCELADO:          6,
  NO_ENTREGADO:       7,
  DEVUELTO:           8,
} as const;

export const ESTADOS_PEDIDO_TERMINALES = [
  ESTADO_PEDIDO.ENTREGADO,
  ESTADO_PEDIDO.CANCELADO,
  ESTADO_PEDIDO.NO_ENTREGADO,
  ESTADO_PEDIDO.DEVUELTO,
];

export function pedidoEstadoId(pedido: Record<string, unknown>): number {
  return Number(pedido.idEstadoPedido ?? 0);
}

export function parsePedidosList(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data as Record<string, unknown>[];
  }
  if (data && typeof data === 'object' && Array.isArray((data as PedidoListadoPaginado).items)) {
    return (data as PedidoListadoPaginado).items as Record<string, unknown>[];
  }
  return [];
}

export function parsePedidosTotal(data: unknown): number {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const total = Number((data as PedidoListadoPaginado).total);
    if (!Number.isNaN(total)) {
      return total;
    }
  }
  return parsePedidosList(data).length;
}

/** Pedidos activos del repartidor (todo lo que no está cerrado). */
export function filtrarPedidosActivos(lista: Record<string, unknown>[]): Record<string, unknown>[] {
  return lista.filter((p) => !ESTADOS_PEDIDO_TERMINALES.includes(pedidoEstadoId(p)));
}

/** Pedidos visibles en la pestaña "Pedidos" del repartidor. */
export function filtrarPedidosPorAceptar(lista: Record<string, unknown>[]): Record<string, unknown>[] {
  return filtrarPedidosActivos(lista);
}

/** Pedidos activos en "Mi Ruta". */
export function filtrarPedidosEnRuta(lista: Record<string, unknown>[]): Record<string, unknown>[] {
  return lista.filter((p) => {
    const id = pedidoEstadoId(p);
    return id === ESTADO_PEDIDO.RECIBIDO_REPARTIDOR || id === ESTADO_PEDIDO.EN_CURSO;
  });
}

export const REPARTIDOR_PEDIDOS_PARAMS = {
  limit: 100,
  page:  1,
};
