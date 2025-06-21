import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from './lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function SessionPage() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [name, setName] = useState('');
  const [responses, setResponses] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchSession() {
      const docSnap = await getDoc(doc(db, 'sessions', id));
      if (docSnap.exists()) {
        setSession(docSnap.data());
        setResponses(
          docSnap.data().timeslots.map(() => ({
            availability: null,
            comment: '',
          }))
        );
      }
    }
    fetchSession();
  }, [id]);

  const handleSelect = (index, availability) => {
    const updated = [...responses];
    updated[index].availability = availability;
    setResponses(updated);
  };

  const handleCommentChange = (index, value) => {
    const updated = [...responses];
    updated[index].comment = value;
    setResponses(updated);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('Please enter your name.');
      return;
    }

    await setDoc(doc(db, 'sessions', id, 'responses', name.trim()), {
      responses,
    });

    setSubmitted(true);
  };

  if (!session) return <div className="text-white p-6">Loading session...</div>;
  if (submitted) return <div className="text-white p-6 text-center text-xl">🎉 Response submitted! Thanks, {name}.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">📅 Join Session: {session.sessionName}</h1>

        <div className="space-y-2">
          <label className="block text-sm">Your Name</label>
          <input
            className="w-full p-3 rounded bg-gray-700 text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Elora the Brave"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Pick your availability</h2>

          {session.timeslots.map((slot, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-xl space-y-2 shadow">
              <p className="font-medium text-lg">
                {slot.date} — {slot.period}
              </p>

              <div className="flex gap-3">
                {[
                  { key: 'yes', label: '✅ Available', color: 'bg-green-300 text-green-900' },
                  { key: 'no', label: '❌ Unavailable', color: 'bg-red-300 text-red-900' },
                ].map(({ key, label, color }) => {
                  const isActive = responses[index]?.availability === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelect(index, key)}
                      className={`px-4 py-2 rounded-full transition-all duration-200 ${
                        isActive ? `${color} font-bold shadow-lg` : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <textarea
                className="w-full mt-2 p-2 rounded bg-gray-700 text-white"
                placeholder="Optional comment for this slot..."
                value={responses[index]?.comment || ''}
                onChange={(e) => handleCommentChange(index, e.target.value)}
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          className="bg-indigo-500 hover:bg-indigo-600 px-6 py-3 rounded w-full text-lg font-semibold"
        >
          🚀 Submit Responses
        </button>
      </div>
    </div>
  );
}
