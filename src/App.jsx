import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';

import GrowxSsdiCpaCsForm from './Components/GrowxSsdiCpaCsForm';
import GrowxSsdiCpaTjForm from './Components/GrowxSsdiCpaTjForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GrowxSsdiCpaCsForm />} />
        <Route path="/ssdi-cpa-cs" element={<GrowxSsdiCpaCsForm />} />
        <Route path="/ssdi-cpa-tj" element={<GrowxSsdiCpaTjForm />} />
      </Routes>
    </Router>
  );
}

export default App;
