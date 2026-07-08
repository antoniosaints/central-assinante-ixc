import { http } from '@/config/api';

export const ClienteService = {
  async buscarPerfil() {
    const { data } = await http.get('/cliente/perfil');
    return data;
  },
};
