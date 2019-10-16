import React, { StrictMode, Fragment } from "react";
import Board from "../board";
import Header from '../header';
import { SessionProvider } from "hooks/context/session";
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

function App() {
  return (
		<StrictMode>
			<div className="h-screen flex flex-col">
				<Router>
					<Header />
					<Switch>
						<Fragment>
							<section className="m-auto">
								<Route exact path="/">
									<SessionProvider>
										<Board />
									</SessionProvider>
								</Route>
								<Route path="/multi-player">
									<h1>Coming soon!</h1>
								</Route>
								<Route path="/about">
									<h1>About!</h1>
								</Route>
							</section>
						</Fragment>
					</Switch>
				</Router>
			</div>
		</StrictMode>
  );
}

export default App;
