import { ResultAsync } from "neverthrow";
import { EntityId } from "../../../shared/domain/base/entity.base";
import { ApplicationService } from "../../../shared/application/base/application-service.base";
import { MoleculeRepository } from "../../domain/repositories/molecule-repository";
import { BondType } from "../../domain/entities/bond";
import { DomainEventBus } from "../../../shared/domain/base/domain-event-bus.interface";

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
  constructor(
    private repository: MoleculeRepository,
    private domainEventBus: DomainEventBus,
  ) {}

  public execute(
    command: CreateBondCommand,
  ): ResultAsync<CreateBondDTO, Error> {
    return this.repository.findById(command.moleculeId).andThen((molecule) => {
      return molecule
        .addBond(command.atomAId, command.atomBId, BondType.Single)
        .asyncAndThen(() =>
          this.repository
            .save(molecule)
            .map(() => this.domainEventBus.publishEventsFromAggregate(molecule))
            .map(() => ({
              atomAId: command.atomAId,
              atomBId: command.atomBId,
              type: BondType.Single,
            })),
        );
    });
  }
}
