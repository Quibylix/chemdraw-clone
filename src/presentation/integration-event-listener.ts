import { AtomCreatedIntegration } from "../chemistry/application/events/atom-created.integration";
import { AtomDeletedIntegration } from "../chemistry/application/events/atom-deleted.integration";
import { AtomUpdatedIntegration } from "../chemistry/application/events/atom-updated.integration";
import { BondCreatedIntegration } from "../chemistry/application/events/bond-created.integration";
import { BondDeletedIntegration } from "../chemistry/application/events/bond-deleted.integration";
import { BondUpdatedIntegration } from "../chemistry/application/events/bond-updated.integration";
import { Scene, BondDTO } from "./scene";
import { IntegrationEventBus } from "../shared/application/base/integration-event-bus.interface";

export class IntegrationEventListener {
  constructor(
    private integrationBus: IntegrationEventBus,
    private scene: Scene,
  ) {}

  subscribe(): void {
    this.integrationBus.subscribe(AtomCreatedIntegration, (event) => {
      this.scene.insertAtom({
        id: event.atomId,
        symbol: event.symbol,
        x: event.x,
        y: event.y,
      });
    });

    this.integrationBus.subscribe(AtomDeletedIntegration, (event) => {
      this.scene.atoms.value = this.scene.atoms.value.filter(
        (a) => a.id !== event.atomId,
      );
    });

    this.integrationBus.subscribe(AtomUpdatedIntegration, (event) => {
      this.scene.atoms.value = this.scene.atoms.value.map((a) =>
        a.id === event.atomId ? { ...a, symbol: event.newSymbol } : a,
      );
    });

    this.integrationBus.subscribe(BondCreatedIntegration, (event) => {
      const newBond: BondDTO = {
        atomAId: event.atomAId,
        atomBId: event.atomBId,
        type: event.bondType,
      };
      this.scene.bonds.value = [...this.scene.bonds.value, newBond];
    });

    this.integrationBus.subscribe(BondDeletedIntegration, (event) => {
      this.scene.bonds.value = this.scene.bonds.value.filter(
        (b) =>
          !(
            (b.atomAId === event.atomAId && b.atomBId === event.atomBId) ||
            (b.atomAId === event.atomBId && b.atomBId === event.atomAId)
          ),
      );
    });

    this.integrationBus.subscribe(BondUpdatedIntegration, (event) => {
      this.scene.bonds.value = this.scene.bonds.value.map((b) => {
        const matches =
          (b.atomAId === event.atomAId && b.atomBId === event.atomBId) ||
          (b.atomAId === event.atomBId && b.atomBId === event.atomAId);
        return matches ? { ...b, type: event.newBondType } : b;
      });
    });
  }
}
