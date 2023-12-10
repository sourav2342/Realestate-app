import { Link } from "react-router-dom"

export default function Header() {
  return (
    <header className="bg-slate-200 shadow-md">
        <div className="flex justify-between p-2 items-center max-w-6xl mx-auto">
            <Link to='/'>
             <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
              <span className="text-slate-500 ">Estate</span>
             </h1>
            </Link>
            <form>
                <input type="text" placeholder="Search..." 
                       className="bg-transparent focus:outline-none w-24 sm:w-64 p-3 rounded-lg" />
            </form>
            <ul className="flex gap-4">
                <Link to='/'><li className="hidden sm:inline hover:underline">Home</li></Link>
                <Link to='/about'><li className="hidden sm:inline hover:underline">About</li></Link>
                <Link to='/signin'><li className="hidden sm:inline hover:underline">Sign in</li></Link>
            </ul>
      </div>
    </header>
  )
}
