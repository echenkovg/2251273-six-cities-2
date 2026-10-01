import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';

import App from './components/app/app';
import store from './store';
import history from './history';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <Provider store={store}>
    <HistoryRouter history={history}>
      <ToastContainer />
      <App />
    </HistoryRouter>
  </Provider>,
);

