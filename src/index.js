import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider,} from "react-router-dom";
import './App.css';
import './InGame.css';
import App from './App';
import InGame from './pages/InGame'
import NotFound from './NotFound';
import './fonts/Belanosima/Belanosima-SemiBold.ttf'
import * as serviceWorkerRegistration from './serviceWorkerRegistration';



const router = createBrowserRouter([
  {
    path: "/",
    element: < App/>,
  },
  {
    path: "/learn-kana",
    element: < App/>,
  },
  {
    path: "/learn-kana∕game",
    element: <InGame />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

serviceWorkerRegistration.register();