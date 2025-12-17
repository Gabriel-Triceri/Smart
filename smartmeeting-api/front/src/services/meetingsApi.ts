import { reuniaoService } from './reuniaoService';
import { salaService } from './salaService';
import { participanteService } from './participanteService';
import { tarefaService } from './tarefaService';
import { projectService } from './projectService';

/**
 * @deprecated Prefer using specific services: reuniaoService, salaService, tarefaService, projectService, participantService.
 * This object is maintained for backward compatibility.
 */
export const meetingsApi = {
    ...reuniaoService,
    ...salaService,
    ...participanteService,
    ...tarefaService,
    ...projectService
};
