import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';

import GrowxSsdiCpaCsForm from './Components/GrowxSsdiCpaCsForm';
import GrowxSsdiCpaTjForm from './Components/GrowxSsdiCpaTjForm';
import GrowxSsdiCpaLdForm from './Components/GrowxSsdiCpaLdForm';
import GrowxTicketToWorkForm from './Components/GrowxTicketToWorkForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GrowxSsdiCpaCsForm />} />
        <Route path="/ssdi-cpa-cs" element={<GrowxSsdiCpaCsForm />} />
        <Route path="/ssdi-cpa-tj" element={<GrowxSsdiCpaTjForm />} />
        <Route path="/ssdi-cpa-ld" element={<GrowxSsdiCpaLdForm />} />
        <Route path="/ticket-to-work" element={<GrowxTicketToWorkForm />} />
      </Routes>
    </Router>
  );
}

export default App;
