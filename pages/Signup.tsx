import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EnvelopeSimple, Lock, UserPlus, Warning, CheckCircle } from '@phosphor-icons/react';

export const SignupModule = () => {
    const navigate = useNavigate();
    const { signUp } = useAuth();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        if (!name.trim()) {
            setError('Por favor, informe seu nome');
            return;
        }

        setLoading(true);

        const { error } = await signUp(email, password, name);

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
            // Redirect to login after 2 seconds
            setTimeout(() => navigate('/login'), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-vgray flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-vred rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                            V
                        </div>
                        <span className="font-bold text-vblack text-2xl tracking-tight">Vanguarda</span>
                    </div>
                    <p className="text-sm text-gray-500 uppercase tracking-widest">Unidade de Crescimento</p>
                </div>

                {/* Signup Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <h1 className="text-2xl font-bold text-vblack mb-2">Criar conta</h1>
                    <p className="text-gray-500 mb-6">Preencha os dados para começar</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <Warning size={20} className="text-red-600 flex-shrink-0 mt-0.5" weight="fill" />
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                            <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" weight="fill" />
                            <div>
                                <p className="text-sm text-green-800 font-semibold">Conta criada com sucesso!</p>
                                <p className="text-xs text-green-700 mt-1">Redirecionando para o login...</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-vblack mb-2">Nome Completo</label>
                            <div className="relative">
                                <UserPlus
                                    size={20}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vred focus:border-transparent"
                                    placeholder="Seu Nome"
                                    required
                                    disabled={loading || success}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-vblack mb-2">Email</label>
                            <div className="relative">
                                <EnvelopeSimple
                                    size={20}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vred focus:border-transparent"
                                    placeholder="seu@email.com"
                                    required
                                    disabled={loading || success}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-vblack mb-2">Senha</label>
                            <div className="relative">
                                <Lock
                                    size={20}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vred focus:border-transparent"
                                    placeholder="••••••••"
                                    required
                                    disabled={loading || success}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-vblack mb-2">Confirmar Senha</label>
                            <div className="relative">
                                <Lock
                                    size={20}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vred focus:border-transparent"
                                    placeholder="••••••••"
                                    required
                                    disabled={loading || success}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || success}
                            className="w-full bg-vred hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>Criando conta...</>
                            ) : success ? (
                                <>Conta criada!</>
                            ) : (
                                <>
                                    <UserPlus size={20} weight="bold" />
                                    Criar conta
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Já tem uma conta?{' '}
                            <Link to="/login" className="text-vred font-semibold hover:underline">
                                Fazer login
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-6">
                    © 2025 Vanguarda. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
};
