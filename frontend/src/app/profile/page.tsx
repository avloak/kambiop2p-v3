'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddBankModal, setShowAddBankModal] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      router.push('/login');
      return;
    }

    fetchProfile();
    fetchBankAccounts();
  }, []);

  const fetchProfile = async () => {
    try {
      // Simular datos de perfil
      const mockProfile = {
        id: 'demo-user-id',
        email: 'demo@kambiop2p.com',
        full_name: 'Juan Pérez García',
        dni: '12345678',
        reputation: {
          score_avg: 4.8,
          total_trades: 23,
        },
      };

      setProfile(mockProfile);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBankAccounts = async () => {
    try {
      // Simular cuentas bancarias
      const mockAccounts = [
        {
          id: '1',
          bank_name: 'BCP',
          account_number: '123-456789-0-12',
          currency_type: 'PEN',
        },
        {
          id: '2',
          bank_name: 'Interbank',
          account_number: '987-654321-0-98',
          currency_type: 'USD',
        },
      ];

      setBankAccounts(mockAccounts);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/marketplace">
              <h1 className="text-2xl font-bold text-blue-600">KambioP2P</h1>
            </Link>
            <div className="flex gap-4">
              <Link href="/marketplace" className="text-gray-600 hover:text-blue-600">
                Mercado
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h2>
          <p className="text-gray-600">Gestiona tu información y reputación</p>
        </div>

        {/* Información del Perfil */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{profile.full_name}</h3>
              <p className="text-gray-600">{profile.email}</p>
              <p className="text-sm text-gray-500 mt-1">DNI: {profile.dni}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-2xl">⭐</span>
                <span className="text-2xl font-bold text-gray-900">
                  {profile.reputation.score_avg}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {profile.reputation.total_trades} operaciones
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Estado de la cuenta</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                Activa
              </span>
            </div>
          </div>
        </div>

        {/* Cuentas Bancarias */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Cuentas Bancarias</h3>
            <button
              onClick={() => setShowAddBankModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold"
            >
              + Agregar Cuenta
            </button>
          </div>

          {bankAccounts.length === 0 ? (
            <p className="text-gray-600 text-center py-6">
              No tienes cuentas bancarias registradas
            </p>
          ) : (
            <div className="space-y-3">
              {bankAccounts.map((account) => (
                <div
                  key={account.id}
                  className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{account.bank_name}</p>
                    <p className="text-sm text-gray-600">{account.account_number}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {account.currency_type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 mb-2">Total Operaciones</p>
            <p className="text-3xl font-bold text-blue-600">
              {profile.reputation.total_trades}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 mb-2">Calificación Promedio</p>
            <p className="text-3xl font-bold text-yellow-600">
              {profile.reputation.score_avg} ⭐
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 mb-2">Tasa de Éxito</p>
            <p className="text-3xl font-bold text-green-600">98%</p>
          </div>
        </div>
      </main>

      {/* Modal Agregar Cuenta Bancaria */}
      {showAddBankModal && (
        <AddBankAccountModal
          onClose={() => setShowAddBankModal(false)}
          onSuccess={() => {
            setShowAddBankModal(false);
            fetchBankAccounts();
          }}
        />
      )}
    </div>
  );
}

// Componente Modal para Agregar Cuenta Bancaria
function AddBankAccountModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    bank_name: 'BCP',
    account_number: '',
    currency_type: 'PEN',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = localStorage.getItem('user_id');
      
      // Simular agregar cuenta
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Agregar Cuenta Bancaria</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banco
            </label>
            <select
              value={formData.bank_name}
              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="BCP">BCP</option>
              <option value="Interbank">Interbank</option>
              <option value="BBVA">BBVA</option>
              <option value="Scotiabank">Scotiabank</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Cuenta
            </label>
            <input
              type="text"
              value={formData.account_number}
              onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="123-456789-0-12"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moneda
            </label>
            <select
              value={formData.currency_type}
              onChange={(e) => setFormData({ ...formData, currency_type: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="PEN">Soles (PEN)</option>
              <option value="USD">Dólares (USD)</option>
            </select>
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
              {loading ? 'Agregando...' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
