'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Trade({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [trade, setTrade] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    // Verificar autenticación
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      router.push('/login');
      return;
    }

    fetchTrade();

    // Timer para habilitar el botón de disputa después de 15 minutos
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 60000); // cada minuto

    return () => clearInterval(timer);
  }, []);

  const fetchTrade = async () => {
    try {
      // Simular datos de trade
      const mockTrade = {
        id: params.id,
        offer_id: '1',
        buyer_id: 'user1',
        seller_id: 'demo-user-id',
        amount_fiat: 500,
        rate: 3.71,
        escrow_status: 'INITIATED',
        deposit_confirmed: false,
        funds_released: false,
        created_at: new Date().toISOString(),
      };

      setTrade(mockTrade);
    } catch (error) {
      console.error('Error fetching trade:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeposit = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('user_id');

      // Simular confirmación de depósito
      await new Promise(resolve => setTimeout(resolve, 1000));

      setTrade({
        ...trade,
        escrow_status: 'FUNDS_IN_CUSTODY',
        deposit_confirmed: true,
      });

      alert('Depósito confirmado. Fondos en custodia.');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseFunds = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('user_id');

      // Simular liberación de fondos
      await new Promise(resolve => setTimeout(resolve, 1000));

      setTrade({
        ...trade,
        escrow_status: 'COMPLETED',
        funds_released: true,
      });

      // Redirigir a página de calificación
      router.push(`/rating/${params.id}`);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando transacción...</p>
      </div>
    );
  }

  const canDispute = timeElapsed >= 15;
  const currentUserId = localStorage.getItem('user_id');
  const isBuyer = currentUserId === trade.buyer_id;
  const totalPEN = trade.amount_fiat * trade.rate;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/marketplace">
              <h1 className="text-2xl font-bold text-blue-600">KambioP2P</h1>
            </Link>
            <Link href="/marketplace" className="text-gray-600 hover:text-blue-600">
              Volver al Mercado
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Transacción #{trade.id.substring(0, 8)}
          </h2>
          <p className="text-gray-600">Gestiona tu intercambio de forma segura</p>
        </div>

        {/* Estado del Escrow */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Estado del Escrow</h3>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                trade.escrow_status === 'COMPLETED'
                  ? 'bg-green-100 text-green-700'
                  : trade.escrow_status === 'FUNDS_IN_CUSTODY'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {trade.escrow_status === 'COMPLETED'
                ? 'Completado'
                : trade.escrow_status === 'FUNDS_IN_CUSTODY'
                ? 'Fondos en Custodia'
                : 'Iniciado'}
            </span>
          </div>

          <div className="space-y-3">
            <div className={`flex items-center gap-3 ${trade.escrow_status !== 'INITIATED' ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                trade.escrow_status !== 'INITIATED' ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                {trade.escrow_status !== 'INITIATED' ? '✓' : '1'}
              </div>
              <div>
                <p className="font-medium text-gray-900">Depósito Confirmado</p>
                <p className="text-sm text-gray-600">El comprador ha enviado el dinero</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 ${trade.funds_released ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                trade.funds_released ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                {trade.funds_released ? '✓' : '2'}
              </div>
              <div>
                <p className="font-medium text-gray-900">Fondos Liberados</p>
                <p className="text-sm text-gray-600">El vendedor ha recibido el pago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detalles de la Transacción */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Detalles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Monto USD</p>
              <p className="text-lg font-bold text-gray-900">${trade.amount_fiat}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tipo de Cambio</p>
              <p className="text-lg font-bold text-gray-900">S/ {trade.rate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total en Soles</p>
              <p className="text-lg font-bold text-blue-600">S/ {totalPEN.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tu Rol</p>
              <p className="text-lg font-bold text-gray-900">{isBuyer ? 'Comprador' : 'Vendedor'}</p>
            </div>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">📋 Instrucciones</h3>
          {isBuyer ? (
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Realiza la transferencia bancaria al vendedor</li>
              <li>Guarda el comprobante de pago</li>
              <li>Haz clic en "Confirmar Depósito" y adjunta el comprobante</li>
              <li>Espera a que el vendedor libere los fondos</li>
            </ol>
          ) : (
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Espera a que el comprador realice la transferencia</li>
              <li>Verifica que recibiste el pago en tu cuenta</li>
              <li>Haz clic en "Liberar Fondos" para completar la transacción</li>
              <li>Califica al comprador para mantener la confianza en la plataforma</li>
            </ol>
          )}
        </div>

        {/* Acciones */}
        <div className="space-y-4">
          {isBuyer && !trade.deposit_confirmed && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Confirmar Depósito</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL del Comprobante (opcional)
                </label>
                <input
                  type="text"
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleConfirmDeposit}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300"
              >
                {loading ? 'Confirmando...' : 'Confirmar Depósito'}
              </button>
            </div>
          )}

          {!isBuyer && trade.deposit_confirmed && !trade.funds_released && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Liberar Fondos</h3>
              <p className="text-gray-600 mb-4">
                Confirma que has recibido el pago antes de liberar los fondos del escrow.
              </p>
              <button
                onClick={handleReleaseFunds}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-300"
              >
                {loading ? 'Liberando...' : 'Liberar Fondos'}
              </button>
            </div>
          )}

          {/* Botón de Disputa */}
          {!trade.funds_released && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">¿Problemas con la transacción?</h3>
              <p className="text-sm text-gray-600 mb-4">
                {canDispute
                  ? 'Han pasado más de 15 minutos. Puedes reportar una incidencia.'
                  : 'Podrás reportar incidencias después de 15 minutos sin confirmación.'}
              </p>
              <button
                onClick={() => setShowDisputeModal(true)}
                disabled={!canDispute}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Reportar Incidencia
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Disputa */}
      {showDisputeModal && (
        <DisputeModal
          tradeId={trade.id}
          onClose={() => setShowDisputeModal(false)}
        />
      )}
    </div>
  );
}

// Componente Modal de Disputa
function DisputeModal({ tradeId, onClose }: { tradeId: string; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = localStorage.getItem('user_id');
      
      // Simular apertura de disputa
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Disputa abierta. Un agente de soporte revisará tu caso.');
      onClose();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Reportar Incidencia</h3>
        <p className="text-gray-600 mb-6">
          Describe el problema y un agente de soporte lo revisará. Los fondos quedarán congelados hasta resolver la disputa.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Razón de la disputa
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Describe el problema..."
              required
            />
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
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-red-300"
            >
              {loading ? 'Enviando...' : 'Abrir Disputa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
