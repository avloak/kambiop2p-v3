'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Offer {
  id: string;
  user_id: string;
  type: 'BUY' | 'SELL';
  currency: string;
  amount: number;
  rate: number;
  status: string;
  created_at: string;
}

export default function Marketplace() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // Verificar si está logueado
    const userId = localStorage.getItem('user_id');
    setIsLoggedIn(!!userId);
    
    // Cargar ofertas
    fetchOffers();

    // Actualizar cada 10 segundos (tiempo real simulado)
    const interval = setInterval(fetchOffers, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOffers = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_MERCADO || 'https://your-api-gateway-url';
      
      // Simular datos por ahora
      const mockOffers: Offer[] = [
        {
          id: '1',
          user_id: 'user1',
          type: 'SELL',
          currency: 'USD',
          amount: 500,
          rate: 3.71,
          status: 'OPEN',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          user_id: 'user2',
          type: 'BUY',
          currency: 'USD',
          amount: 300,
          rate: 3.70,
          status: 'OPEN',
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          user_id: 'user3',
          type: 'SELL',
          currency: 'USD',
          amount: 1000,
          rate: 3.72,
          status: 'OPEN',
          created_at: new Date().toISOString(),
        },
      ];

      setOffers(mockOffers);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOffers = offers.filter(offer => {
    if (filterType === 'ALL') return true;
    return offer.type === filterType;
  });

  const handleAcceptOffer = (offerId: string) => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    router.push(`/trade/${offerId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-blue-600">KambioP2P</h1>
            </Link>
            <nav className="flex gap-4">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Crear Oferta
                  </button>
                  <Link href="/profile" className="text-gray-600 hover:text-blue-600 px-4 py-2">
                    Mi Perfil
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-600 hover:text-blue-600">
                    Iniciar Sesión
                  </Link>
                  <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Registrarse
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isLoggedIn && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-center">
              ⚠️ Debes <Link href="/login" className="font-semibold underline">iniciar sesión</Link> para participar en el mercado
            </p>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Marketplace P2P</h2>
          <p className="text-gray-600">Ofertas en tiempo real • Mejor precio del mercado</p>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterType === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilterType('BUY')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterType === 'BUY'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Compra USD
          </button>
          <button
            onClick={() => setFilterType('SELL')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterType === 'SELL'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Vende USD
          </button>
        </div>

        {/* Lista de Ofertas */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Cargando ofertas...</p>
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600">No hay ofertas disponibles</p>
            </div>
          ) : (
            filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          offer.type === 'BUY'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {offer.type === 'BUY' ? 'COMPRA' : 'VENDE'} {offer.currency}
                      </span>
                      <span className="text-xs text-gray-500">
                        ⭐ 4.8 (23 operaciones)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-sm text-gray-600">Monto Disponible</p>
                        <p className="text-xl font-bold text-gray-900">
                          ${offer.amount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tipo de Cambio</p>
                        <p className="text-xl font-bold text-blue-600">
                          S/ {offer.rate.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => handleAcceptOffer(offer.id)}
                      disabled={!isLoggedIn}
                      className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isLoggedIn ? 'Aceptar Oferta' : 'Inicia Sesión'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal Crear Oferta */}
      {showCreateModal && (
        <CreateOfferModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchOffers();
          }}
        />
      )}
    </div>
  );
}

// Componente Modal para Crear Oferta
function CreateOfferModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    type: 'SELL',
    amount: '',
    rate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userId = localStorage.getItem('user_id');
      
      // Simular creación de oferta
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al crear oferta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Crear Oferta</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Oferta
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="SELL">Vender USD</option>
              <option value="BUY">Comprar USD</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto (USD)
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Cambio (PEN)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="3.71"
              required
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-blue-700">
              💡 Los fondos quedarán bloqueados en escrow hasta que se complete la transacción
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Publicando...' : 'Publicar Oferta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
