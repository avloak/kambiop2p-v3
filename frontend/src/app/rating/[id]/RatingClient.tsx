'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RatingClient({ id }: { id: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Por favor selecciona una calificación');
      return;
    }

    setLoading(true);

    try {
      // Simular envío de calificación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('¡Gracias por tu calificación!');
      router.push('/marketplace');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Transacción Completada!
          </h2>
          <p className="text-gray-600">
            ¿Cómo fue tu experiencia con la contraparte?
          </p>
        </div>

        <div className="mb-8">
          <p className="text-center text-gray-700 font-medium mb-4">
            Califica esta transacción
          </p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="text-4xl transition-transform hover:scale-110"
              >
                {star <= (hoveredRating || rating) ? '⭐' : '☆'}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || rating === 0}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-300 mb-4"
        >
          {loading ? 'Enviando...' : 'Enviar Calificación'}
        </button>

        <button
          onClick={() => router.push('/marketplace')}
          className="w-full text-gray-600 hover:text-gray-900"
        >
          Omitir
        </button>
      </div>
    </div>
  );
}
