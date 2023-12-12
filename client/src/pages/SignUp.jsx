import { useState } from "react";
import {Link, useNavigate} from "react-router-dom";
import OAuth from "../components/OAuth";

export default function SignIn() {
  
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.id]: e.target.value });
    console.log(formData);
  }

  const handleSubmit = async (e) => {
     e.preventDefault();
     try {

      setLoading(true);
      const res = await fetch('/api/auth/signup', 
        {
          method:'POST',
          headers: {
           'Content-Type' : 'application/json',
          },
          body: JSON.stringify(formData),
        });
       const data = await res.json();
       if(data.success === false) {
         setError(data.message);
         setLoading(false);
         return;
       }
       setLoading(false);
       setError(null);
       navigate('/signin');
     } catch (error) {
        setLoading(false);
        setError(error.message);
     }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">  
      <h1 className="text-3xl text-center font-semibold my-7">Sign Up</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input onChange={handleChange} type="text" placeholder="Username" id="username" className="bg-slate-100 p-3 rounded-lg"/>
        <input onChange={handleChange} type="email" placeholder="Email" id="email" className="bg-slate-100 p-3 rounded-lg"/>
        <input onChange={handleChange} type="password" placeholder="password" id="password" className="bg-slate-100 p-3 rounded-lg"/>
        <button disabled={loading} className="bg-slate-700 text-white p-3 rounded-lg uppercase">{loading ? "loading...": "Sign up"}</button>
        <OAuth/>
      </form>
      <div className="flex gap-2 mt-5">
        <p>Have an account?</p>
        <Link to='/signin'>
          <span className="text-blue-500 ">Sign in</span>
        </Link>
      </div>
      {error && <p className="text-red-500 mt-5">{error}</p>}
    </div>
  )
}
