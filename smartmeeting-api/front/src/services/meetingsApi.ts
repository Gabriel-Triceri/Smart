import { reuniaoService } from './reuniaoService';
import { salaService } from './salaService';
import { participanteService } from './participanteService';
// FIX #4: tarefaService usa export default — deve ser importado sem chaves.
// A versão anterior usava `import { tarefaService }` o que resultava em undefined.
import tarefaService from './tarefaService';
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