import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/common/header';
import GetOrdersInfo from "./components/render/ordersInfo";
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
  return (
      <Router>
          <Header></Header>
          <Routes>
              <Route exact path="/" element={<GetOrdersInfo></GetOrdersInfo>}></Route>
          </Routes>
      </Router>
  );
}

export default App;