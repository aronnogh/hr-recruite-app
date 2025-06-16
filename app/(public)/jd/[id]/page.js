'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function JDPage({ params }) {
  const { id } = params;
  const [jd, setJd] = useState(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    if (id) {
      fetch(`/api/jd/${id}`)
        .then(res => res.json())
        .then(data => {
          setJd(data);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <p>Loading Job Description...</p>;
  if (!jd) return <p>Job Description not found.</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-2">{jd.title}</h1>
      <p className="text-gray-400 mb-6">Posted by HR Team</p>
      <div className="prose prose-invert max-w-none bg-gray-800 p-6 rounded-lg">
        <pre className="whitespace-pre-wrap font-sans">{jd.descriptionText}</pre>
      </div>
      {session && session.user.role === 'applie' && (
        <Link href={`/apply/${id}`}>
          <button className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
            Apply for this Position
          </button>
        </Link>
      )}
      {!session && (
         <p className="mt-8 text-yellow-400">Please sign in as an applicant to apply.</p>
      )}
    </div>
  );
}