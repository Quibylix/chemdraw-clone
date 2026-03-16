import "./style.css";
import { EditorApp } from "./presentation/editor-app";
import { InMemoryMoleculeRepository } from "./infrastructure/repositories/in-memory-molecule-repository";
import { CreateMoleculeService } from "./application/use-cases/create-molecule.service";
import { CreateAtomService } from "./application/use-cases/create-atom.service";
import { CreateBondService } from "./application/use-cases/create-bond.service";
import { DeleteAtomService } from "./application/use-cases/delete-atom.service";
import { UpdateAtomService } from "./application/use-cases/update-atom.service";

const container = document.querySelector<HTMLDivElement>("#app")!;

const repository = new InMemoryMoleculeRepository();

const createMoleculeService = new CreateMoleculeService(repository);
const createAtomService = new CreateAtomService(repository);
const createBondService = new CreateBondService(repository);
const deleteAtomService = new DeleteAtomService(repository);
const updateAtomService = new UpdateAtomService(repository);

new EditorApp(
  container,
  repository,
  createMoleculeService,
  createAtomService,
  createBondService,
  deleteAtomService,
  updateAtomService,
).run();
