import React from "react";
import { Link } from 'react-router-dom'

function Header() {
  return (
		<nav className="flex items-center justify-between flex-wrap bg-teal-500 p-6">
		<Link to="/">
		<div className="flex items-center flex-shrink-0 text-white mr-6 ">
			<span className="font-semibold text-xl tracking-tight">Quiz App</span>
		</div>
		</Link>
		<div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
			<div className="text-sm lg:flex-grow">
				<Link to="/" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
				Single player
				</Link>
				<Link to="multi-player" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
					Multi player
				</Link>
			</div>
			<div>
				<Link to="/about" href="#" className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0">About</Link>
			</div>
		</div>
	</nav>
  );
}

export default Header;
