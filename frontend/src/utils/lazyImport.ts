import React, { lazy, ComponentType, LazyExoticComponent } from 'react';

/**
 * Creates a lazy-loaded component with TypeScript support
 * @param factory Function that imports the component
 * @param name Optional name for better debugging
 */
export function lazyImport<
  T extends React.ComponentType<any>,
  I extends { [K2 in K]: T },
  K extends keyof I
>(factory: () => Promise<I>, name: K): I {
  return Object.create({
    [name]: lazy(() => factory().then((module) => ({ default: module[name] }))),
  });
}

/**
 * Creates a lazy-loaded component with preloading capability
 * @param importFunc Function that imports the component
 */
export interface LazyComponentWithPreload<T extends ComponentType<any>> extends LazyExoticComponent<T> {
  preload: () => Promise<{ default: T }>;
}

export function lazyWithPreload<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): LazyComponentWithPreload<T> {
  const Component = lazy(importFunc) as LazyComponentWithPreload<T>;
  Component.preload = importFunc;
  return Component;
}
