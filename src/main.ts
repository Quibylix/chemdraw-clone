import "./style.css";
import { EditorApp } from "./presentation/editor-app";
import { InMemoryMoleculeRepository } from "./chemistry/infrastructure/repositories/in-memory-molecule-repository";
import { CreateMoleculeService } from "./chemistry/application/use-cases/create-molecule.service";
import { CreateAtomService } from "./chemistry/application/use-cases/create-atom.service";
import { CreateBondService } from "./chemistry/application/use-cases/create-bond.service";
import { DeleteAtomService } from "./chemistry/application/use-cases/delete-atom.service";
import { UpdateAtomService } from "./chemistry/application/use-cases/update-atom.service";
import { FindAtomAtService } from "./chemistry/application/use-cases/find-atom-at.service";
import { GetAtomOrBondAtService } from "./chemistry/application/use-cases/get-atom-or-bond-at.service";
import { DeleteBondService } from "./chemistry/application/use-cases/delete-bond.service";
import { UpdateBondTypeService } from "./chemistry/application/use-cases/update-bond-type.service";
import { InMemoryDomainEventBus } from "./chemistry/infrastructure/event-bus/in-memory-domain-event-bus";
import { InMemoryIntegrationEventBus } from "./shared/infrastructure/event-bus/in-memory-integration-event-bus";
import { registerHandlers } from "./chemistry/application/handlers";
import { IntegrationEventListener } from "./presentation/integration-event-listener";

const container = document.querySelector<HTMLDivElement>("#app")!;

const repository = new InMemoryMoleculeRepository();

const domainEventBus = new InMemoryDomainEventBus();
const integrationEventBus = new InMemoryIntegrationEventBus();

registerHandlers(domainEventBus, integrationEventBus);

const createMoleculeService = new CreateMoleculeService(repository);
const createAtomService = new CreateAtomService(repository, domainEventBus);
const createBondService = new CreateBondService(repository, domainEventBus);
const deleteAtomService = new DeleteAtomService(repository, domainEventBus);
const updateAtomService = new UpdateAtomService(repository, domainEventBus);
const findAtomService = new FindAtomAtService(repository);
const getAtomOrBondAtService = new GetAtomOrBondAtService(repository);
const deleteBondService = new DeleteBondService(repository, domainEventBus);
const updateBondTypeService = new UpdateBondTypeService(
  repository,
  domainEventBus,
);

const editorApp = new EditorApp(
  container,
  createMoleculeService,
  createAtomService,
  createBondService,
  deleteAtomService,
  updateAtomService,
  findAtomService,
  getAtomOrBondAtService,
  deleteBondService,
  updateBondTypeService,
);

const eventListener = new IntegrationEventListener(
  integrationEventBus,
  editorApp.scene,
);
eventListener.subscribe();

editorApp.run();
