import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from './lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

function getColorFromVotes(slotIndex, responses) {
  let yes = 0, no = 0;
  for (const res of responses) {
    const vote = res.data[slotIndex];
    if (vote?.availability === 'yes') yes++;
    if (vote?.availability === 'no') no++;
  }

  const total = yes + no || 1;
  const r = Math.round((no / total) * 255);
  const g = Math.round((yes / total) * 255);
  const b = 180; // soft blue balance

  return `rgb(${r}, ${g}, ${b})`;
}

export default function DMResponsesPage() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    async function loadData() {
      const sessionDoc = await getDoc(doc(db, 'sessions', id));
      if (!sessionDoc.exists()) {
        setLoading(false);
        return;
      }

      const sessionData = sessionDoc.data();
      setSession(sessionData);

      const responsesSnapshot = await getDocs(collection(db, 'sessions', id, 'responses'));
      const playerResponses = [];
      responsesSnapshot.forEach((docSnap) => {
        playerResponses.push({ playerName: docSnap.id, data: docSnap.data().responses });
      });

      setResponses(playerResponses);
      setLoading(false);
    }

    loadData();
  }, [id]);

  const handleRecommend = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: { ...session, responses } }),
      });

      const data = await res.json();
      setRecommendation(data.recommendation);
    } catch (err) {
      alert('Failed to get recommendation');
    }
    setLoadingAI(false);
  };

  if (loading) return <div className="text-white p-6">Loading responses...</div>;
  if (!session) return <div className="text-white p-6">Session not found</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-4">🧙 Responses for "{session.sessionName}"</h1>

        <button
          onClick={handleRecommend}
          className="bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-lg text-white font-bold w-full"
        >
          {loadingAI ? 'Thinking...' : '🔮 Recommend Best Time'}
        </button>

        {recommendation && (
          <div className="bg-purple-800 mt-4 p-4 rounded-xl text-white text-lg shadow">
            <strong>🧠 AI Suggestion:</strong> {recommendation}
          </div>
        )}

        <div className="bg-gray-700 p-4 rounded-xl shadow space-y-2">
          <h2 className="text-2xl font-bold text-center mb-2">🗓 Timeslot Overview</h2>
          {session.timeslots.map((slot, i) => {
            const yes = responses.filter((r) => r.data[i]?.availability === 'yes').length;
            const no = responses.filter((r) => r.data[i]?.availability === 'no').length;
            const color = getColorFromVotes(i, responses);

            return (
              <div key={i} className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: color }}>
                <div>
                  <p className="font-semibold">
                    {slot.date} — {slot.period}
                  </p>
                  <p className="text-sm">✅ {yes} ❌ {no}</p>
                </div>
              </div>
            );
          })}
        </div>

        {responses.map((res, idx) => (
          <div key={idx} className="bg-gray-800 p-4 rounded-xl shadow space-y-2">
            <h2 className="text-xl font-semibold">🧝 {res.playerName}</h2>

            {res.data.map((vote, i) => {
              const slot = session.timeslots[i];
              const color =
                vote.availability === 'yes'
                  ? 'text-green-400'
                  : 'text-red-400';

              return (
                <div key={i} className={`border-l-4 pl-2 mt-1 ${color}`}>
                  <p className="font-medium">
                    {slot.date} — {slot.period} — {vote.availability === 'yes' ? '✅' : '❌'}
                  </p>
                  {vote.comment && (
                    <p className="text-sm italic text-gray-300">“{vote.comment}”</p>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
