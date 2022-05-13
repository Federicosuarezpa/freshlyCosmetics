import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/common/Header';
import OrdersInfoPage from "./pages/OrdersInfoPage";
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
  return (
      <Router>
          <Header></Header>
          <Routes>
              <Route exact path="/" element={<OrdersInfoPage></OrdersInfoPage>}></Route>
          </Routes>
      </Router>
  );
}

export default App;