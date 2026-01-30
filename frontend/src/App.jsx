import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Tickets from "./pages/Tickets";
import TicketDetail from "./pages/TicketDetail";
import { isAuthenticated } from "./api/auth";


function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/" />;
}

export default function App() {
  return (

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/tickets"
            element={
              <PrivateRoute>
                <Tickets />
              </PrivateRoute>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <PrivateRoute>
                <TicketDetail />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
  );
}
