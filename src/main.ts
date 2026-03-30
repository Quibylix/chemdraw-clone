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

const container = document.querySelector<HTMLDivElement>("#app")!;

const repository = new InMemoryMoleculeRepository();

const createMoleculeService = new CreateMoleculeService(repository);
const createAtomService = new CreateAtomService(repository);
const createBondService = new CreateBondService(repository);
const deleteAtomService = new DeleteAtomService(repository);
const updateAtomService = new UpdateAtomService(repository);
const findAtomService = new FindAtomAtService(repository);
const getAtomOrBondAtService = new GetAtomOrBondAtService(repository);
const deleteBondService = new DeleteBondService(repository);
const updateBondTypeService = new UpdateBondTypeService(repository);

new EditorApp(
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
).run();
