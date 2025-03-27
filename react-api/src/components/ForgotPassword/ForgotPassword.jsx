import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [matricule, setMatricule] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const maskEmail = (email) => {
    const [name, domain] = email.split("@");
    return `${name.charAt(0)}****${name.charAt(name.length - 1)}@${domain}`;
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await axios.post("http://localhost:8000/api/request-reset", { matricule });
      setEmail(maskEmail(response.data.email));
      setStep(2);
    } catch (error) {
      setMessage("Matricule introuvable");
    }
    setLoading(false);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await axios.post("http://localhost:8000/api/verify-code", { matricule, verificationCode });
      setStep(3);
    } catch (error) {
      setMessage("Code incorrect");
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await axios.post("http://localhost:8000/api/reset-password", { matricule, newPassword });
      alert("Mot de passe mis à jour avec succès");
      navigate("/");
    } catch (error) {
      setMessage("Erreur lors de la mise à jour");
    }
    setLoading(false);
  };

  return (
    <div className="forgot-password-container">
      <h2 className="fixed-title">Réinitialisation du mot de passe</h2>
      {step === 1 && (
        <form onSubmit={handleRequestReset}>
          <p>Veuillez saisir votre matricule</p>
          <input type="text" placeholder="Matricule" value={matricule} onChange={(e) => setMatricule(e.target.value)} required />
          <button type="submit" disabled={loading}>Envoyer</button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleVerifyCode}>
          <p>On a envoyé un code de vérification à l'email ({email})</p>
          <input type="text" placeholder="Code reçu" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} required />
          <button type="submit" disabled={loading}>Vérifier</button>
        </form>
      )}
      {step === 3 && (
        <form onSubmit={handleResetPassword}>
          <p>Écrire votre nouveau mot de passe</p>
          <input type="password" placeholder="Nouveau mot de passe" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <input type="password" placeholder="Confirmer le mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <button type="submit" disabled={loading}>Sauvegarder</button>
        </form>
      )}
      {message && <p className="error-message">{message}</p>}
    </div>
  );
};

export default ForgotPassword;