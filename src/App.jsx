import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';

import GrowxSsdiCpaCsForm from './Components/GrowxSsdiCpaCsForm';
import GrowxSsdiCpaTjForm from './Components/GrowxSsdiCpaTjForm';
import GrowxSsdiCpaLdForm from './Components/GrowxSsdiCpaLdForm';
import GrowxTicketToWorkForm from './Components/GrowxTicketToWorkForm';
import GrowxSsdiCpaPy2NewForm from './Components/GrowxSsdiCpaPy2NewForm';
import GrowxHomeInsuranceLnForm from './Components/GrowxHomeInsuranceLnForm';
import GrowxAutoLnForm from './Components/GrowxAutoLnForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GrowxSsdiCpaCsForm />} />
        <Route path="/ssdi-cpa-cs" element={<GrowxSsdiCpaCsForm />} />
        <Route path="/ssdi-cpa-tj" element={<GrowxSsdiCpaTjForm />} />
        <Route path="/ssdi-cpa-ld" element={<GrowxSsdiCpaLdForm />} />
        <Route path="/ticket-to-work" element={<GrowxTicketToWorkForm />} />
        <Route path="/ssdi-cpa-py-2-new" element={<GrowxSsdiCpaPy2NewForm />} />
        <Route path="/home-insurance-ln" element={<GrowxHomeInsuranceLnForm />} />
        <Route path="/auto-ln" element={<GrowxAutoLnForm />} />
      </Routes>
    </Router>
  );
}

export default App;
