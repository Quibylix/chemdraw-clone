import { ResultAsync } from "neverthrow";
import { EntityId } from "../../../shared/domain/base/entity.base";
import { BondType } from "../../domain/entities/bond";
import { ApplicationService } from "../../../shared/application/base/application-service.base";
import { MoleculeRepository } from "../../domain/repositories/molecule-repository";

export class UpdateBondTypeCommand {
  constructor(
    public readonly moleculeId: EntityId,
    public readonly atomAId: EntityId,
    public readonly atomBId: EntityId,
    public readonly newType: BondType,
  ) {}
}

export class UpdateBondTypeService implements ApplicationService<
  UpdateBondTypeCommand,
  void
> {
  constructor(private repository: MoleculeRepository) {}

  public execute(command: UpdateBondTypeCommand): ResultAsync<void, Error> {
    return this.repository.findById(command.moleculeId).andThen((molecule) => {
      return molecule
        .updateBondType(command.atomAId, command.atomBId, command.newType)
        .asyncAndThen(() => this.repository.save(molecule));
    });
  }
}
