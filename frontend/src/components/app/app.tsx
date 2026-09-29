import { Route, Routes } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

import Main from '../../pages/main/main';
import Login from '../../pages/login/login';
import Register from '../../pages/register/register';
import Favorites from '../../pages/favorites/favorites';
import Property from '../../pages/property/property';
import AddOffer from '../../pages/add-offer/add-offer';
import EditOffer from '../../pages/edit-offer/edit-offer';
import NotFound from '../../pages/not-found/not-found';
import Header from '../header/header';
import PrivateRoute from '../private-route/private-route';
import { AppRoute, AuthorizationStatus } from '../../const';

const App = (): JSX.Element => (
  <Routes>
    <Route path={AppRoute.Root} element={<Header />}>
      <Route index element={<Main />} />
      <Route path={AppRoute.Login} element={<Login />} />
      <Route path={AppRoute.Register} element={<Register />} />
      <Route
        path={AppRoute.Favorites}
        element={
          <PrivateRoute
            restrictedFor={AuthorizationStatus.NoAuth}
            redirectTo={AppRoute.Login}
          >
            <Favorites />
          </PrivateRoute>
        }
      />
      <Route path={`${AppRoute.Property}/:id`} element={<Property />} />
      <Route
        path={`${AppRoute.Property}/:id${AppRoute.Edit}`}
        element={
          <PrivateRoute
            restrictedFor={AuthorizationStatus.NoAuth}
            redirectTo={AppRoute.Login}
          >
            <EditOffer />
          </PrivateRoute>
        }
      />
      <Route
        path={AppRoute.Add}
        element={
          <PrivateRoute
            restrictedFor={AuthorizationStatus.NoAuth}
            redirectTo={AppRoute.Login}
          >
            <AddOffer />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

export default App;
