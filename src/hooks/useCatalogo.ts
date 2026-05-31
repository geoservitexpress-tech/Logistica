// src/hooks/useCatalogo.ts

import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';

export interface CatalogoItem {
  id:     string;
  nombre: string;
}

interface CatalogoState {
  paises:        CatalogoItem[];
  departamentos: CatalogoItem[];
  ciudades:      CatalogoItem[];
  tiposVia:      CatalogoItem[];
  cargando:      boolean;
  error:         string | null;
}

export function useCatalogo() {
  const [state, setState] = useState<CatalogoState>({
    paises:        [],
    departamentos: [],
    ciudades:      [],
    tiposVia:      [],
    cargando:      true,
    error:         null,
  });

  useEffect(() => {
    let montado = true;

    async function cargar() {
      try {
        const [rPaises, rDeptos, rCiudades, rVias] = await Promise.all([
          apiClient.get<CatalogoItem[]>(ENDPOINTS.CATALOGO.PAISES),
          apiClient.get<CatalogoItem[]>(ENDPOINTS.CATALOGO.DEPARTAMENTOS),
          apiClient.get<CatalogoItem[]>(ENDPOINTS.CATALOGO.CIUDADES),
          apiClient.get<CatalogoItem[]>(ENDPOINTS.CATALOGO.TIPOS_VIA),
        ]);

        if (!montado) return;

        setState({
          paises:        rPaises.data,
          departamentos: rDeptos.data,
          ciudades:      rCiudades.data,
          tiposVia:      rVias.data,
          cargando:      false,
          error:         null,
        });
      } catch (e: unknown) {
        if (!montado) return;
        const err = e as { message?: string };
        setState((prev) => ({
          ...prev,
          cargando: false,
          error:    err?.message ?? 'Error al cargar catálogos',
        }));
      }
    }

    cargar();
    return () => { montado = false; };
  }, []);

  return state;

  

  
}

const [rPaises, rDeptos, rCiudades, rVias] = await Promise.all([
  apiClient.get(ENDPOINTS.CATALOGO.PAISES),
  apiClient.get(ENDPOINTS.CATALOGO.DEPARTAMENTOS),
  apiClient.get(ENDPOINTS.CATALOGO.CIUDADES),
  apiClient.get(ENDPOINTS.CATALOGO.TIPOS_VIA),
]);

// TEMPORAL — ver estructura real
console.log('PAISES:', JSON.stringify(rPaises.data[0]));
console.log('DEPTOS:', JSON.stringify(rDeptos.data[0]));
console.log('CIUDADES:', JSON.stringify(rCiudades.data[0]));
console.log('VIAS:', JSON.stringify(rVias.data[0]));

