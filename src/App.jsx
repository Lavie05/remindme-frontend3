import React, { useState } from 'react';
import Dashboard from './Dashboard';
import Intro from './Intro';

function App() {
const [showIntro, setShowIntro] = useState(true);
const [isLoggedIn, setIsLoggedIn] = useState(true);

if (showIntro) {
return <Intro onFinish={() => setShowIntro(false)} />;
}

return (
<div className="App">
<Dashboard onLogout={() => setIsLoggedIn(false)} />
</div>
);
}

export default App;