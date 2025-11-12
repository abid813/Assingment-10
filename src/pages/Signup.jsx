// src/pages/Signup.jsx
import React, { useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import app from "../Firebase/firebase";

const Signup = () => {
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState("");

  const validatePassword = (password) => {
    if (!/[A-Z]/.test(password))
      return "Password must have at least one Uppercase letter.";
    if (!/[a-z]/.test(password))
      return "Password must have at least one Lowercase letter.";
    if (password.length < 6)
      return "Password must be at least 6 characters long.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name, photoURL });
      console.log("User registered:", result.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Google user:", result.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (

        <section className="max-w-[1400px] mx-auto h-[1000px]  border-slate-600 rounded pt-4"  style={{ backgroundImage: "url('/Sprinkle.svg')" }}>


    <div className="max-w-md mx-auto mt-12 p-6 bg-slate-800 text-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          className="border p-2 rounded"
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="border p-2 rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="border p-2 rounded"
          type="text"
          placeholder="Photo URL"
          value={photoURL}
          onChange={(e) => setPhotoURL(e.target.value)}
        />

        {/* 👁️ Password Input with Toggle */}
        <div className="relative">
          <input
            className="border p-2 rounded w-full pr-10"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            className="absolute right-3 top-2.5 cursor-pointer select-none text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button className="mt-2 font-bold text-white py-2 rounded" style={{ background: "linear-gradient(to right,#0000,#0f9b0f)" }}>
          Register
        </button>
      </form>

      <button
  onClick={handleGoogleLogin}
  className="mt-4 w-full font-bold text-white py-2 p-4 rounded"
  style={{ background: "linear-gradient(to right, #ba8b, #181)" }}
>
  Continue with Google
</button>


      <p className="mt-4 text-center font-bold text-sm">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-500 font-bold">
          Login
        </Link>
      </p>
    </div>
     </section>
  );

 
};

export default Signup;
