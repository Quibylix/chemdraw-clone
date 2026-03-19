import { EntityId } from "../../../shared/domain/base/entity.base";
import { ApplicationService } from "../../../shared/application/base/application-service.base";
import { MoleculeRepository } from "../../domain/repositories/molecule-repository";
import { BondType } from "../../domain/entities/bond";

export type CreateBondDTO = {
  atomAId: EntityId;
  atomBId: EntityId;
  type: BondType;
};

export class CreateBondCommand {
  constructor(
    public readonly moleculeId: EntityId,
    public readonly atomAId: EntityId,
    public readonly atomBId: EntityId,
  ) {}
}

export class CreateBondService implements ApplicationService<
  CreateBondCommand,
  CreateBondDTO
> {
  constructor(private repository: MoleculeRepository) {}

  public execute(command: CreateBondCommand) {
    return this.repository.findById(command.moleculeId).andThen((molecule) => {
      return molecule
        .addBond(command.atomAId, command.atomBId, BondType.Single)
        .asyncAndThen(() =>
          this.repository.save(molecule).map(() => {
            return {
              atomAId: command.atomAId,
              atomBId: command.atomBId,
              type: BondType.Single,
            };
          }),
        );
    });
  }
}
