import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import { Landing } from "./components/layout/Landing";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Alert from "./components/layout/Alert";
import Dashboard from "./components/dashboard/Dashboard";
import PrivateRoute from "./components/routing/PrivateRoute";
// Redux
import store from "./store";
import { Provider } from "react-redux";
import { loadUser } from "./actions/auth";
import setAuthToken from "./utils/setAuthToken";

if (localStorage.token) {
	setAuthToken(localStorage.token);
}

function App() {
	useEffect(() => {
		store.dispatch(loadUser());
	}, []);

	return (
		<Provider store={store}>
			<Router>
				<React.Fragment>
					<Navbar />
					<Route exact path="/" component={Landing} />
					<div className="container">
						<Alert />
						<Switch>
							<Route exact path="/login" component={Login} />
							<Route exact path="/register" component={Register} />
							<PrivateRoute exact path="/dashboard" component={Dashboard} />
						</Switch>
					</div>
				</React.Fragment>
			</Router>
		</Provider>
	);
}

export default App;
