import "./style.css";
import { EditorApp } from "./presentation/editor-app";
import { InMemoryMoleculeRepository } from "./infrastructure/repositories/in-memory-molecule-repository";
import { CreateMoleculeService } from "./application/use-cases/create-molecule.service";
import { AddAtomService } from "./application/use-cases/add-atom.service";
import { CreateBondService } from "./application/use-cases/create-bond.service";

const container = document.querySelector<HTMLDivElement>("#app")!;

const repository = new InMemoryMoleculeRepository();

const createMoleculeService = new CreateMoleculeService(repository);
const addAtomService = new AddAtomService(repository);
const createBondService = new CreateBondService(repository);

new EditorApp(
  container,
  repository,
  createMoleculeService,
  addAtomService,
  createBondService,
).run();
