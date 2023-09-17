import { AggregateRoot } from '../entities/aggregate-root';
import { UniqueEntityId } from '../entities/unique-entity-id';
import { DomainEvent } from './domain-event';

type DomainEventCallback = (event: any) => void;

export class DomainEvents {
  private static handlersMap: Record<string, DomainEventCallback[]> = {}; // string = event, DomainEventCallback = Subscriber
  private static markedAggregates: AggregateRoot<any>[] = []; // Mark which aggregates have events but are not ready

  public static markAggregateForDispatch(aggregate: AggregateRoot<any>) {
    const aggregateFound = !!this.findMarkedAggregateByID(aggregate.id);

    if (!aggregateFound) {
      this.markedAggregates.push(aggregate);
    }
  }

  private static dispatchAggregateEvents(aggregate: AggregateRoot<any>) {
    aggregate.domainEvents.forEach((event: DomainEvent) =>
      this.dispatch(event),
    );
  }

  private static removeAggregateFromMarkedDispatchList(
    aggregate: AggregateRoot<any>,
  ) {
    const index = this.markedAggregates.findIndex((a) => a.equals(aggregate));

    this.markedAggregates.splice(index, 1);
  }

  private static findMarkedAggregateByID(
    id: UniqueEntityId,
  ): AggregateRoot<any> | undefined {
    return this.markedAggregates.find((aggregate) => aggregate.id.equals(id));
  }

  public static dispatchEventsForAggregate(id: UniqueEntityId) {
    const aggregate = this.findMarkedAggregateByID(id);

    if (aggregate) {
      this.dispatchAggregateEvents(aggregate);
      aggregate.clearEvents();
      this.removeAggregateFromMarkedDispatchList(aggregate);
    }
  }

  public static register(
    callback: DomainEventCallback,
    eventClassName: string,
  ) {
    const wasEventRegisteredBefore = eventClassName in this.handlersMap;

    if (!wasEventRegisteredBefore) {
      this.handlersMap[eventClassName] = [];
    }

    this.handlersMap[eventClassName].push(callback);
  }

  public static clearHandlers() {
    this.handlersMap = {};
  }

  public static clearMarkedAggregates() {
    this.markedAggregates = [];
  }

  private static dispatch(event: DomainEvent) {
    const eventClassName: string = event.constructor.name;

    const isEventRegistered = eventClassName in this.handlersMap;

    if (isEventRegistered) {
      const handlers = this.handlersMap[eventClassName];

      for (const handler of handlers) {
        handler(event);
      }
    }
  }
}
