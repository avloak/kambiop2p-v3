'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [amount, setAmount] = useState<string>('');
  const [savings, setSavings] = useState<number>(0);
  const [bankRate, setBankRate] = useState<number>(3.75);
  const [p2pRate, setP2pRate] = useState<number>(3.71);

  useEffect(() => {
    // Cargar tasas del mercado
    fetchMarketRates();
  }, []);

  const fetchMarketRates = async () => {
    try {
      // En producción, esto consumiría el API real
      // const response = await fetch('API_GATEWAY_URL/market/rates');
      // const data = await response.json();
      
      // Por ahora usamos valores simulados
      setBankRate(3.75);
      setP2pRate(3.71);
    } catch (error) {
      console.error('Error fetching rates:', error);
    }
  };

  const calculateSavings = (value: string) => {
    setAmount(value);
    const numValue = parseFloat(value) || 0;
    const bankCost = numValue * bankRate;
    const p2pCost = numValue * p2pRate;
    const saved = Math.abs(bankCost - p2pCost);
    setSavings(saved);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">KambioP2P</h1>
            </div>
            <nav className="flex gap-4">
              <Link href="/login" className="text-gray-600 hover:text-blue-600">
                Iniciar Sesión
              </Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Registrarse
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Cambia Dólares y Soles <br />
            <span className="text-blue-600">al Mejor Precio</span>
          </h2>
          <p className="text-xl text-gray-600">
            Conectamos personas directamente. Sin intermediarios bancarios.
          </p>
        </div>

        {/* Calculadora de Ahorro */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            ¿Cuánto quieres cambiar?
          </h3>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto en USD
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => calculateSavings(e.target.value)}
              placeholder="100"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Tipo de cambio bancario</p>
              <p className="text-2xl font-bold text-gray-900">S/ {bankRate.toFixed(2)}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600">Mejor oferta P2P</p>
              <p className="text-2xl font-bold text-blue-600">S/ {p2pRate.toFixed(2)}</p>
            </div>
          </div>

          {savings > 0 && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
              <p className="text-sm text-green-700 mb-2">¡Estás ahorrando!</p>
              <p className="text-3xl font-bold text-green-600">
                S/ {savings.toFixed(2)}
              </p>
              <p className="text-sm text-green-700 mt-2">
                comparado con el banco
              </p>
            </div>
          )}

          <div className="mt-6">
            <Link
              href="/register"
              className="w-full block text-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Empezar a Ahorrar
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Seguro</h3>
            <p className="text-gray-600">
              Sistema Escrow que protege tus fondos hasta que ambas partes confirmen la transacción.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Rápido</h3>
            <p className="text-gray-600">
              Operaciones en tiempo real. Encuentra las mejores ofertas al instante.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Mejor Precio</h3>
            <p className="text-gray-600">
              Ahorra hasta S/ 0.10 por dólar comparado con tasas bancarias tradicionales.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-blue-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">
            Únete a KambioP2P hoy
          </h3>
          <p className="text-xl mb-6 opacity-90">
            Miles de peruanos ya están ahorrando en sus cambios de divisas
          </p>
          <Link
            href="/marketplace"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Ver Ofertas del Mercado
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2026 KambioP2P. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
