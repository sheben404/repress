import { useRoutes } from 'react-router-dom';
import { routes } from 'repress:routes';

export const Content = () => {
  const routeElement = useRoutes(routes);
  return routeElement;
};
