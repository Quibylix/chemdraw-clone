import { EntityId } from "../../domain/base/entity.base";
import { ApplicationService } from "../base/application-service.base";
import { MoleculeRepository } from "../../domain/repositories/molecule-repository";

export class CreateBondCommand {
  constructor(
    public readonly moleculeId: EntityId,
    public readonly atomAId: EntityId,
    public readonly atomBId: EntityId,
  ) {}
}

export class CreateBondService implements ApplicationService<CreateBondCommand> {
  constructor(private repository: MoleculeRepository) {}

  public execute(command: CreateBondCommand) {
    return this.repository.findById(command.moleculeId).andThen((molecule) => {
      return molecule
        .addBond(command.atomAId, command.atomBId)
        .asyncAndThen(() => this.repository.save(molecule));
    });
  }
}
