import { createSelector } from '@reduxjs/toolkit';

/**
 * Core selectors module for shared selector patterns
 * 
 * This module provides utilities for creating memoized selectors
 * that respect our modular architecture principles.
 */

/**
 * Creates a selector that memoizes its results based on input parameters
 * 
 * @example
 * const selectUserById = createParameterizedSelector(
 *   (state) => state.users.entities,
 *   (entities, userId) => entities[userId]
 * );
 * 
 * // Usage:
 * const user = useSelector(state => selectUserById(state, userId));
 */
export function createParameterizedSelector<State, Params extends any[], Result>(
  selectState: (state: State) => any,
  selectResult: (slice: any, ...params: Params) => Result
) {
  return (state: State, ...params: Params): Result => {
    const slice = selectState(state);
    return selectResult(slice, ...params);
  };
}

/**
 * Creates a memoized selector that filters items based on a predicate
 * 
 * @example
 * const selectCompletedTodos = createFilterSelector(
 *   (state) => state.todos.items,
 *   (todo) => todo.completed
 * );
 */
export function createFilterSelector<State, Item>(
  selectItems: (state: State) => Item[],
  predicate: (item: Item) => boolean
) {
  return createSelector(
    selectItems,
    (items) => items.filter(predicate)
  );
}

/**
 * Creates a selector that transforms each item in a collection
 * 
 * @example
 * const selectTodoTitles = createMapSelector(
 *   (state) => state.todos.items,
 *   (todo) => todo.title
 * );
 */
export function createMapSelector<State, Item, Result>(
  selectItems: (state: State) => Item[],
  mapFn: (item: Item) => Result
) {
  return createSelector(
    selectItems,
    (items) => items.map(mapFn)
  );
}

/**
 * Creates a selector that sorts items based on a comparison function
 * 
 * @example
 * const selectSortedTodos = createSortSelector(
 *   (state) => state.todos.items,
 *   (a, b) => a.createdAt - b.createdAt
 * );
 */
export function createSortSelector<State, Item>(
  selectItems: (state: State) => Item[],
  compareFn: (a: Item, b: Item) => number
) {
  return createSelector(
    selectItems,
    (items) => [...items].sort(compareFn)
  );
}

/**
 * Creates a selector for paginated data
 * 
 * @example
 * const selectPaginatedTodos = createPaginationSelector(
 *   (state) => state.todos.items,
 *   (state) => state.todos.pagination.page,
 *   (state) => state.todos.pagination.pageSize
 * );
 */
export function createPaginationSelector<State, Item>(
  selectItems: (state: State) => Item[],
  selectPage: (state: State) => number,
  selectPageSize: (state: State) => number
) {
  return createSelector(
    [selectItems, selectPage, selectPageSize],
    (items, page, pageSize) => {
      const startIndex = (page - 1) * pageSize;
      return items.slice(startIndex, startIndex + pageSize);
    }
  );
}

/**
 * Creates a normalized entity selector with utility methods
 * 
 * @example
 * const todoSelectors = createEntitySelectors(
 *   (state) => state.todos
 * );
 * 
 * // Usage:
 * const allTodos = useSelector(todoSelectors.selectAll);
 * const todoById = useSelector(state => todoSelectors.selectById(state, id));
 */
export function createEntitySelectors<State, Entity extends { id: string | number }>(
  selectEntities: (state: State) => {
    ids: (string | number)[];
    entities: Record<string | number, Entity>;
  }
) {
  return {
    selectAll: createSelector(
      selectEntities,
      (entityState) => entityState.ids.map(id => entityState.entities[id]).filter(Boolean)
    ),
    selectById: createParameterizedSelector(
      selectEntities,
      (entityState, id: string | number) => entityState.entities[id]
    ),
    selectIds: createSelector(
      selectEntities,
      (entityState) => entityState.ids
    ),
    selectEntities: createSelector(
      selectEntities,
      (entityState) => entityState.entities
    ),
    selectTotal: createSelector(
      selectEntities,
      (entityState) => entityState.ids.length
    )
  };
} 