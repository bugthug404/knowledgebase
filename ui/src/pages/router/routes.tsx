import { Outlet, Route, Routes } from 'react-router-dom';
import { NotFoundPage404 } from './page-not-found-404';
import { Suspense } from 'react';

// TYPES

export type RelicRouteChildrenType = {
  default: JSX.Element;
  [key: string]: JSX.Element;
};
export type RelicRoutesType = {
  [key: string]: JSX.Element | RelicRouteChildrenType;
};

//

// Adds Outlet to the current Route's Component
export function RouteWithOutlet(Component: JSX.Element) {
  return (
    <>
      {Component}
      <Outlet />
    </>
  );
}

export const RouteMaker = (props: {
  /**
   * The routes object should be in the format of:
   * @kind path: Component
   * @kind path/*: Component with outlet
   * @description
   */
  routes: RelicRoutesType;
}) => {
  return (
    <Routes>
      {Object.keys(props.routes).map((key) => {
        const El = props.routes[key];
        if ((El as RelicRouteChildrenType).default) {
          const routesChildren = El as RelicRouteChildrenType;
          // const routePath = !key.endsWith('/*') ? `${key}/*` : key;
          const routePath = key;
          return (
            <Route key={key} path={routePath} element={routesChildren.default}>
              {Object.keys(routesChildren)
                .filter((k) => k !== 'default')
                .map((key) => {
                  const elm = <Suspense fallback={<div>Loading...</div>} key={key}>
                    {routesChildren[key]}
                  </Suspense>;

                  return (
                    <Route key={key} path={key} element={elm} />
                  );
                })}
            </Route>
          );
        }
        return <Route key={key} path={key} element={El as JSX.Element} />;
      })}
      <Route path="*" element={<NotFoundPage404 />} />
    </Routes>
  );
};
