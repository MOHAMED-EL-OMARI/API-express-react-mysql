import React, { useContext, useState } from "react";
import "./LoginPage.css";
import logo from "../../assets/SNRT-logo.png";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Pour la redirection
import { AuthContext } from "../authcontext";

const LoginPage = () => {
    const [nom, setNom] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false); // Indicateur de chargement
    const navigate = useNavigate(); // Hook pour la navigation
    const { login } = useContext(AuthContext); // Get login function

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true); // Add loading state when submitting

        try {
            const response = await axios.post(
                "http://localhost:5000/api/login",
                {
                    nom,
                    password,
                }
            );

            if (response.data.success) {
                login(response.data.user, response.data.token);
                navigate("/database");
            } else {
                setError("Nom ou mot de passe incorrect");
                setLoading(false); // Reset loading state
            }
        } catch (error) {
            console.error("Erreur lors de la connexion :", error);
            setLoading(false); // Reset loading state

            // Gestion des erreurs spécifiques
            if (error.response) {
                if (error.response.status === 401) {
                    setError("Nom ou mot de passe incorrect");
                } else {
                    setError("Une erreur s'est produite lors de la connexion");
                }
            } else if (error.request) {
                // Pas de réponse du serveur
                setError(
                    "Le serveur ne répond pas. Veuillez réessayer plus tard."
                );
            } else {
                // Erreur inattendue
                setError("Une erreur inattendue s'est produite");
            }
        }
    };

    return (
        <div className="login-container">
            <div className="left-section">
                <h1 className="login-title">Login</h1>
                <form className="login-form" onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>Nom</label>
                        <input
                            type="text"
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <div className="remember-me">
                        <input type="checkbox" id="remember" />
                        <label htmlFor="remember">Remember me</label>
                    </div>
                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? "Connexion en cours..." : "Connexion"}
                    </button>
                    <br />
                    <div className="frgt-psw">
                        <a href="/forgot-password">Mot de passe oublié ?</a>
                    </div>
                </form>
            </div>

            <div className="right-section">
                <div className="logo-container">
                    <img src={logo} alt="SNRT Logo" className="logo" />
                    <p className="company-name">
                        الشركة الوطنية للإذاعة و التلفزة
                    </p>
                    <p className="contact-info">
                        +212 537 77 77 77 | www.snrt.ma
                    </p>
                    <p className="contact-info">
                        Société Nationale de Radiodiffusion et de Télévision
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
