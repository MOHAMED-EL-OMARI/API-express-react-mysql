import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage/LoginPage";
import { AuthProvider } from "./components/authcontext";
import DatabaseConnect from "./components/DatabaseConnect/DatabaseConnect";
import ProtectedRoute from "./components/ProtectedRoute";
import Tables from "./components/Tables/Tables";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/forgotPaasword" element={<ForgotPassword />} />
                    <Route
                        path="/database"
                        element={
                            <ProtectedRoute>
                                <DatabaseConnect />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/tables"
                        element={
                            <ProtectedRoute>
                                <Tables />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
