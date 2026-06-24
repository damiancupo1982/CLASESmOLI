import React, { useState, useEffect, useMemo } from 'react';
import { X, BarChart3, Users, DollarSign, TrendingUp, AlertCircle, Calendar, Download, Filter, ChevronDown, ChevronUp, Edit2, Trash2, Save } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { firebaseService } from '../firebase/firebaseService';

interface Club {
  id: string;
  name: string;
  owner: string;
  createdAt: Date;
}

interface Student {
  id: string;
  name: string;
  dni: string;
  phone: string;
  currentBalance: number;
  condition: string;
  clubId: string;
}

interface Transaction {
  id: string;
  studentId: string;
  amount: number;
  type: 'payment' | 'charge';
  date: Date;
  clubId: string;
  description: string;
  status: 'Pendiente' | 'Pagado';
}

interface AdminPanelProps {
  onClose: () => void;
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [selectedView, setSelectedView] = useState<'dashboard' | 'clubs' | 'delinquent' | 'reports'>('dashboard');
  const [selectedClub, setSelectedClub] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '842114') {
      setIsAuthenticated(true);
      loadAllData();
    } else {
      alert('Contraseña incorrecta');
      setPassword('');
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const clubsData = await firebaseService.getAllClubs();
      const allStudents: Student[] = [];
      const allTransactions: Transaction[] = [];

      for (const club of clubsData) {
        const students = await firebaseService.getAllStudents(club.id);
        students.forEach(student => {
          allStudents.push({
            id: student.id,
            clubId: club.id,
            name: student.name,
            dni: student.dni,
            phone: student.phone,
            currentBalance: student.currentBalance,
            condition: student.condition
          });
        });

        const transactions = await firebaseService.getAllTransactions(club.id);
        transactions.forEach(transaction => {
          allTransactions.push({
            id: transaction.id,
            clubId: club.id,
            studentId: transaction.studentId,
            amount: transaction.amount,
            type: transaction.type,
            date: transaction.date,
            description: transaction.description,
            status: transaction.status || 'Pendiente'
          });
        });
      }

      setClubs(clubsData.map(c => ({
        id: c.id,
        name: c.name,
        owner: 'Admin',
        createdAt: c.createdAt
      })));
      setStudents(allStudents);
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error cargando datos de admin:', error);
      alert('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    let filtered = {
      students: [...students],
      transactions: [...transactions]
    };

    if (selectedClub !== 'all') {
      filtered.students = filtered.students.filter(s => s.clubId === selectedClub);
      filtered.transactions = filtered.transactions.filter(t => t.clubId === selectedClub);
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered.transactions = filtered.transactions.filter(t => t.date >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59);
      filtered.transactions = filtered.transactions.filter(t => t.date <= toDate);
    }

    if (monthFilter) {
      const [year, month] = monthFilter.split('-');
      filtered.transactions = filtered.transactions.filter(t => {
        const tYear = t.date.getFullYear();
        const tMonth = t.date.getMonth() + 1;
        return tYear === parseInt(year) && tMonth === parseInt(month);
      });
    }

    return filtered;
  }, [students, transactions, selectedClub, dateFrom, dateTo, monthFilter]);

  const stats = useMemo(() => {
    const totalStudents = filteredData.students.length;

    // Calcular deuda por alumno basándose en transacciones pendientes
    const debtByStudent = new Map<string, number>();
    filteredData.transactions.forEach(t => {
      if (t.status === 'Pendiente' && t.type === 'charge') {
        const current = debtByStudent.get(t.studentId) || 0;
        debtByStudent.set(t.studentId, current + Number(t.amount));
      }
    });

    const delinquentStudents = filteredData.students.filter(s =>
      (debtByStudent.get(s.id) || 0) > 0
    );
    const upToDateStudents = filteredData.students.filter(s =>
      (debtByStudent.get(s.id) || 0) === 0
    );

    const totalDebt = Array.from(debtByStudent.values()).reduce((sum, debt) => sum + debt, 0);
    const totalCredit = 0; // No hay saldo a favor en este sistema

    // Calcular ingresos basándose en transacciones pagadas
    const paidCharges = filteredData.transactions.filter(t =>
      t.type === 'charge' && t.status === 'Pagado'
    );
    const totalRevenue = paidCharges.reduce((sum, t) => sum + Number(t.amount), 0);

    // Calcular cargos totales (pagados + pendientes)
    const allCharges = filteredData.transactions.filter(t => t.type === 'charge');
    const totalCharges = allCharges.reduce((sum, t) => sum + Number(t.amount), 0);

    // Egresos (si existen transacciones de pago negativas)
    const expenses = filteredData.transactions.filter(t =>
      t.type === 'payment' || (t.type === 'charge' && Number(t.amount) < 0)
    );
    const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

    const studentsByClub = clubs.map(club => {
      const clubStudents = students.filter(s => s.clubId === club.id);
      const clubTransactions = transactions.filter(t => t.clubId === club.id);

      const clubDebtByStudent = new Map<string, number>();
      clubTransactions.forEach(t => {
        if (t.status === 'Pendiente' && t.type === 'charge') {
          const current = clubDebtByStudent.get(t.studentId) || 0;
          clubDebtByStudent.set(t.studentId, current + Number(t.amount));
        }
      });

      const clubDelinquent = clubStudents.filter(s =>
        (clubDebtByStudent.get(s.id) || 0) > 0
      );
      const clubDebt = Array.from(clubDebtByStudent.values()).reduce((sum, debt) => sum + debt, 0);

      return {
        club: club.name,
        count: clubStudents.length,
        delinquent: clubDelinquent.length,
        debt: clubDebt
      };
    });

    const revenueByMonth: { [key: string]: number } = {};
    filteredData.transactions.forEach(t => {
      if (t.type === 'charge' && t.status === 'Pagado') {
        const monthKey = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
        revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + Number(t.amount);
      }
    });

    // Crear lista de morosos con sus deudas
    const delinquentList = delinquentStudents.map(student => ({
      ...student,
      currentBalance: debtByStudent.get(student.id) || 0
    }));

    return {
      totalStudents,
      delinquentStudents: delinquentStudents.length,
      upToDateStudents: upToDateStudents.length,
      totalDebt,
      totalCredit,
      totalPayments: totalRevenue,
      totalCharges,
      netRevenue: totalRevenue - totalExpenses,
      studentsByClub,
      revenueByMonth,
      delinquentList
    };
  }, [filteredData, clubs, students, transactions]);

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Modo Administrador</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingrese la contraseña de administrador
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <p className="text-lg">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 overflow-y-auto">
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Panel de Administración</h1>
                <p className="text-blue-100 mt-1">Control total de todos los clubes</p>
              </div>
              <button
                onClick={onClose}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <X size={20} />
                Cerrar
              </button>
            </div>

            {/* Navigation */}
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setSelectedView('dashboard')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  selectedView === 'dashboard'
                    ? 'bg-white text-blue-600'
                    : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                }`}
              >
                <BarChart3 size={18} />
                Dashboard
              </button>
              <button
                onClick={() => setSelectedView('clubs')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  selectedView === 'clubs'
                    ? 'bg-white text-blue-600'
                    : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                }`}
              >
                <Users size={18} />
                Clubes
              </button>
              <button
                onClick={() => setSelectedView('delinquent')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  selectedView === 'delinquent'
                    ? 'bg-white text-blue-600'
                    : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                }`}
              >
                <AlertCircle size={18} />
                Morosos
              </button>
              <button
                onClick={() => setSelectedView('reports')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  selectedView === 'reports'
                    ? 'bg-white text-blue-600'
                    : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                }`}
              >
                <Download size={18} />
                Reportes
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              <Filter size={18} />
              Filtros
              {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Club</label>
                  <select
                    value={selectedClub}
                    onChange={(e) => setSelectedClub(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="all">Todos los clubes</option>
                    {clubs.map(club => (
                      <option key={club.id} value={club.id}>{club.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
                  <input
                    type="month"
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="md:col-span-4">
                  <button
                    onClick={() => {
                      setSelectedClub('all');
                      setDateFrom('');
                      setDateTo('');
                      setMonthFilter('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {selectedView === 'dashboard' && (
            <DashboardView stats={stats} clubs={clubs} />
          )}
          {selectedView === 'clubs' && (
            <ClubsView stats={stats} clubs={clubs} onRefresh={loadAllData} />
          )}
          {selectedView === 'delinquent' && (
            <DelinquentView stats={stats} clubs={clubs} />
          )}
          {selectedView === 'reports' && (
            <ReportsView stats={stats} clubs={clubs} selectedClub={selectedClub} />
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardView({ stats, clubs }: any) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clubes</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{clubs.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Alumnos</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalStudents}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Deuda Total</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{formatCurrency(stats.totalDebt)}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle size={24} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Facturación</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{formatCurrency(stats.totalPayments)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Clientes</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Al día</span>
              <span className="font-semibold text-green-600">{stats.upToDateStudents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Morosos</span>
              <span className="font-semibold text-red-600">{stats.delinquentStudents}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-gray-600">Total</span>
              <span className="font-semibold">{stats.totalStudents}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Financiero</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ingresos</span>
              <span className="font-semibold text-green-600">{formatCurrency(stats.totalPayments)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Egresos</span>
              <span className="font-semibold text-red-600">{formatCurrency(stats.totalCharges)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-gray-600">Neto</span>
              <span className="font-semibold text-blue-600">{formatCurrency(stats.netRevenue)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Saldos</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">A favor</span>
              <span className="font-semibold text-green-600">{formatCurrency(stats.totalCredit)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Deudas</span>
              <span className="font-semibold text-red-600">{formatCurrency(stats.totalDebt)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-gray-600">Balance</span>
              <span className="font-semibold">{formatCurrency(stats.totalCredit - stats.totalDebt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Facturación por Mes</h3>
        <div className="space-y-2">
          {Object.entries(stats.revenueByMonth)
            .sort(([a], [b]) => b.localeCompare(a))
            .slice(0, 6)
            .map(([month, amount]: [string, any]) => {
              const maxRevenue = Math.max(...Object.values(stats.revenueByMonth) as number[]);
              const percentage = (amount / maxRevenue) * 100;
              return (
                <div key={month}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{month}</span>
                    <span className="font-semibold">{formatCurrency(amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function ClubsView({ stats, clubs, onRefresh }: any) {
  const [editingClub, setEditingClub] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deletingClub, setDeletingClub] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [actionType, setActionType] = useState<'edit' | 'delete' | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEditClick = (clubId: string, clubName: string) => {
    setEditingClub(clubId);
    setEditName(clubName);
    setActionType('edit');
    setPassword('');
    setError('');
  };

  const handleDeleteClick = (clubId: string) => {
    setDeletingClub(clubId);
    setActionType('delete');
    setPassword('');
    setError('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== '842114') {
      setError('Contraseña de administrador incorrecta');
      return;
    }

    if (!editName.trim()) {
      setError('El nombre del club no puede estar vacío');
      return;
    }

    setLoading(true);
    try {
      await firebaseService.updateClub(editingClub!, { name: editName.trim() });
      await onRefresh();
      setEditingClub(null);
      setPassword('');
      setError('');
      setActionType(null);
    } catch (error) {
      console.error('Error updating club:', error);
      setError('Error al actualizar el club');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== '842114') {
      setError('Contraseña de administrador incorrecta');
      return;
    }

    setLoading(true);
    try {
      await firebaseService.deleteClub(deletingClub!);
      await onRefresh();
      setDeletingClub(null);
      setPassword('');
      setError('');
      setActionType(null);
    } catch (error) {
      console.error('Error deleting club:', error);
      setError('Error al eliminar el club');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingClub(null);
    setDeletingClub(null);
    setPassword('');
    setError('');
    setActionType(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Gestión de Clubes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.studentsByClub.map((clubStat: any, idx: number) => {
          const club = clubs.find((c: any) => c.name === clubStat.club);
          if (!club) return null;

          return (
            <div key={idx} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{clubStat.club}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(club.id, clubStat.club)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar nombre"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(club.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar club"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total alumnos</span>
                  <span className="font-semibold">{clubStat.count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Morosos</span>
                  <span className="font-semibold text-red-600">{clubStat.delinquent}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-gray-600">Deuda total</span>
                  <span className="font-semibold text-red-600">{formatCurrency(clubStat.debt)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {actionType === 'edit' && editingClub && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Editar Nombre del Club</h3>
              <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nuevo nombre del club
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre del club"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña de administrador
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ingrese contraseña de admin"
                  required
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    'Guardando...'
                  ) : (
                    <>
                      <Save size={18} />
                      Guardar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {actionType === 'delete' && deletingClub && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-red-600">Eliminar Club</h3>
              <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleConfirmDelete} className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium mb-2">¡ADVERTENCIA!</p>
                <p className="text-red-700 text-sm">
                  Esta acción eliminará el club y TODOS sus datos (alumnos, clases, transacciones, recibos).
                  Esta operación NO se puede deshacer.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña de administrador para confirmar
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Ingrese contraseña de admin"
                  required
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    'Eliminando...'
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Eliminar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DelinquentView({ stats, clubs }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Clientes Morosos</h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DNI</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Club</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deuda</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stats.delinquentList
              .sort((a: any, b: any) => a.currentBalance - b.currentBalance)
              .map((student: any) => {
                const club = clubs.find((c: any) => c.id === student.clubId);
                return (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.dni}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {club?.name || 'Sin club'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                      {formatCurrency(student.currentBalance)}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportsView({ stats, clubs, selectedClub }: any) {
  const exportData = () => {
    const data = {
      fecha: new Date().toISOString(),
      club: selectedClub === 'all' ? 'Todos' : clubs.find((c: any) => c.id === selectedClub)?.name,
      estadisticas: {
        totalAlumnos: stats.totalStudents,
        alumnosAlDia: stats.upToDateStudents,
        alumnosMorosos: stats.delinquentStudents,
        deudaTotal: stats.totalDebt,
        facturacionTotal: stats.totalPayments,
        ingresosNetos: stats.netRevenue
      },
      porClub: stats.studentsByClub
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-admin-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Reportes y Exportación</h2>
        <button
          onClick={exportData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Download size={18} />
          Exportar Reporte
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Ejecutivo</h3>
        <div className="prose max-w-none">
          <p className="text-gray-600">
            Este reporte incluye todos los datos de gestión disponibles para el periodo seleccionado.
          </p>
          <ul className="text-gray-600 mt-4 space-y-2">
            <li>Total de clubes activos: <strong>{clubs.length}</strong></li>
            <li>Total de alumnos: <strong>{stats.totalStudents}</strong></li>
            <li>Tasa de morosidad: <strong>{((stats.delinquentStudents / stats.totalStudents) * 100).toFixed(1)}%</strong></li>
            <li>Facturación total: <strong>{formatCurrency(stats.totalPayments)}</strong></li>
            <li>Deuda pendiente: <strong>{formatCurrency(stats.totalDebt)}</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
