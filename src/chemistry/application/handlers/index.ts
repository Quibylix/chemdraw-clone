import {
  DomainEventBus,
  DomainEventClass,
} from "../../../shared/domain/base/domain-event-bus.interface";
import { DomainEventHandler } from "../../../shared/application/base/domain-event-handler.interface";
import { AtomCreatedHandler } from "./atom-created.handler";
import { AtomDeletedHandler } from "./atom-deleted.handler";
import { AtomUpdatedHandler } from "./atom-updated.handler";
import { BondCreatedHandler } from "./bond-created.handler";
import { BondDeletedHandler } from "./bond-deleted.handler";
import { BondUpdatedHandler } from "./bond-updated.handler";
import { AtomCreatedEvent } from "../../domain/events/atom-created.event";
import { AtomDeletedEvent } from "../../domain/events/atom-deleted.event";
import { AtomUpdatedEvent } from "../../domain/events/atom-updated.event";
import { BondCreatedEvent } from "../../domain/events/bond-created.event";
import { BondDeletedEvent } from "../../domain/events/bond-deleted.event";
import { BondUpdatedEvent } from "../../domain/events/bond-updated.event";
import { IntegrationEventBus } from "../../../shared/application/base/integration-event-bus.interface";
import { DomainEvent } from "../../../shared/domain/base/domain-event";

export function registerHandlers(
  domainEventBus: DomainEventBus,
  integrationEventBus: IntegrationEventBus,
): void {
  const handlers: [DomainEventClass<DomainEvent>, DomainEventHandler][] = [
    [AtomCreatedEvent, new AtomCreatedHandler(integrationEventBus)],
    [AtomDeletedEvent, new AtomDeletedHandler(integrationEventBus)],
    [AtomUpdatedEvent, new AtomUpdatedHandler(integrationEventBus)],
    [BondCreatedEvent, new BondCreatedHandler(integrationEventBus)],
    [BondDeletedEvent, new BondDeletedHandler(integrationEventBus)],
    [BondUpdatedEvent, new BondUpdatedHandler(integrationEventBus)],
  ];

  handlers.forEach(([eventType, handler]) =>
    domainEventBus.subscribe(eventType, (event) => handler.handle(event)),
  );
}
