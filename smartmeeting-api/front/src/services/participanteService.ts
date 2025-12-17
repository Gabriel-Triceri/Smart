import { Participante } from '../types/meetings';
import api from './httpClient';

export const participanteService = {

    async searchParticipantes(query: string): Promise<Participante[]> {
        const response = await api.get('/pessoas', {
            params: { search: query }
        });

        return response.data.map((pessoa: any) => ({
            ...pessoa,
            id: pessoa.id,
            tipoUsuario: pessoa.tipoUsuario?.toString() || 'FUNCIONARIO',
            departamento: pessoa.tipoUsuario?.toString()
        }));
    }
};
