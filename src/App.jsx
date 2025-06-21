import { useState } from 'react';
import { db } from './lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

function generateSessionId() {
  return Math.random().toString(36).substring(2, 8);
}

export default function App() {
  const [sessionName, setSessionName] = useState('');
  const [minPlayers, setMinPlayers] = useState(4);
  const [timeslots, setTimeslots] = useState([{ date: '', period: 'Manhã' }]);

  const handleTimeslotChange = (index, field, value) => {
    const updated = [...timeslots];
    updated[index][field] = value;
    setTimeslots(updated);
  };

  const addTimeslot = () => {
    setTimeslots([...timeslots, { date: '', period: 'Manhã' }]);
  };

  const handleCreate = async () => {
    const sessionId = generateSessionId();

    const sessionData = {
      id: sessionId,
      sessionName,
      minPlayers,
      timeslots,
    };

    try {
      await setDoc(doc(db, 'sessions', sessionId), sessionData);
      alert(`Session created! Share this link with your players:\n\nhttp://localhost:5173/session/${sessionId}`);
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session, check console for details');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-4">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-2">🎲 Create a D&D Session</h1>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Session Name</label>
          <input
            className="w-full p-3 rounded-lg border border-gray-300 bg-white"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="Curse of Strahd - Chapter 5"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Minimum Players</label>
          <input
            type="number"
            className="w-full p-3 rounded-lg border border-gray-300 bg-white"
            value={minPlayers}
            onChange={(e) => setMinPlayers(parseInt(e.target.value))}
            min={1}
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium">Available Timeslots</label>
          {timeslots.map((slot, index) => (
            <div key={index} className="grid grid-cols-2 gap-3">
              <input
                type="date"
                className="p-3 rounded-lg border border-gray-300 bg-white"
                value={slot.date}
                onChange={(e) => handleTimeslotChange(index, 'date', e.target.value)}
              />
              <select
                className="p-3 rounded-lg border border-gray-300 bg-white"
                value={slot.period}
                onChange={(e) => handleTimeslotChange(index, 'period', e.target.value)}
              >
                <option>Manhã</option>
                <option>Tarde</option>
                <option>Noite</option>
              </select>
            </div>
          ))}

          <button
            onClick={addTimeslot}
            className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-800 py-2 rounded-lg font-semibold shadow"
          >
            ➕ Add Timeslot
          </button>
        </div>

        <button
          onClick={handleCreate}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold text-lg shadow"
        >
          ✅ Create Session
        </button>
      </div>
    </div>
  );
}
