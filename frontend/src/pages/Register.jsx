import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import FormInput from "../components/FormInput";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register(form);
      showToast(data.message || "Registration successful");
      navigate("/login");
    } catch (err) {
      showToast(err.response?.data?.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Create account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput label="Name" id="name" value={form.name} onChange={handleChange} required />
        <FormInput label="Email" id="email" type="email" value={form.email} onChange={handleChange} required />
        <FormInput label="Password" id="password" type="password" value={form.password} onChange={handleChange} required />
        <FormInput label="Address" id="address" value={form.address} onChange={handleChange} required />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2.5 font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link to="/login" className="text-indigo-400 hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
};

export default Register;
