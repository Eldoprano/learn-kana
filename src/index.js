import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider,} from "react-router-dom";
import './App.css';
import './InGame.css';
import App from './App';
import InGame from './pages/InGame'
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
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();