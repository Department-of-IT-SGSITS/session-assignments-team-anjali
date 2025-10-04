import React, { useState, useEffect, useMemo } from 'react';
import './App.css'
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';
import { 
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  serverTimestamp,
  orderBy,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Main App Component
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('home');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Monitor authentication state and create user document if needed
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (!docSnap.exists()) {
          try {
            await setDoc(userDocRef, {
              displayName: currentUser.displayName,
              email: currentUser.email,
              photoURL: currentUser.photoURL,
              createdAt: serverTimestamp(),
              budget: 1000,
            });
          } catch (err) { console.error("Error creating user document:", err); }
        }
        setUser(currentUser);
        setPage('dashboard');
      } else {
        setUser(null);
        if (page !== 'auth') { setPage('home'); }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [page]); 

  const navigate = (newPage) => {
    setError('');
    setPage(newPage);
  };

  if (loading) { return <LoadingSpinner />; }

  // Route to appropriate page
  switch (page) {
    case 'auth': return <AuthPage setError={setError} error={error} navigate={navigate} />;
    case 'dashboard': return <DashboardPage user={user} />;
    default: return <HomePage setError={setError} error={error} navigate={navigate} />;
  }
}

// Generate time-based greeting
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

// Landing page with Google sign-in
const HomePage = ({ setError, error, navigate }) => {
    const handleGoogleSignIn = () => {
        setError('');
        signInWithPopup(auth, provider)
            .catch((err) => {
                setError(`Authentication Failed: ${err.message}`);
            });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800 p-4">
            <div className="text-center max-w-lg mx-auto">
                <h1 className="text-5xl md:text-6xl font-bold text-blue-600 mb-4">Expense Tracker</h1>
                <p className="text-lg md:text-xl text-gray-600 mb-8">Take control of your finances. Simple, intuitive, and powerful.</p>
                
                {error && (
                    <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                        {error}
                    </div>
                )}

                <button 
                    onClick={handleGoogleSignIn} 
                    className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300"
                >
                    <svg className="w-5 h-5 mr-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 19">
                        <path fillRule="evenodd" d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.342A8.8 8.8 0 0 1 8.842 18.083Z" clipRule="evenodd" />
                    </svg>
                    Get Started with Google
                </button>
            </div>
        </div>
    );
};

// Loading spinner component
const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen bg-white"><div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div></div>
);

// Pie chart for category breakdown
const CategoryPieChart = ({ data }) => {
    const chartData = {
        labels: data.labels,
        datasets: [{
            data: data.values,
            backgroundColor: ['#4ade80', '#38bdf8', '#fbbf24', '#f87171', '#818cf8', '#a78bfa', '#f472b6', '#78716c'],
        }],
    };
    return <Pie data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />;
};

// Horizontal bar chart for categories
const CategoryBarChart = ({ data }) => {
    const chartData = {
        labels: data.labels,
        datasets: [{
            label: 'Expenses by Category',
            data: data.values,
            backgroundColor: '#3b82f6',
        }],
    };
    return <Bar data={chartData} options={{ indexAxis: 'y', responsive: true, plugins: { legend: { display: false } } }} />;
};

// Available expense categories
const CATEGORIES = ['Shopping', 'Food', 'Travel', 'Clothes', 'Groceries', 'Rent', 'Bills','Entertainment','Study','Cosmetics','Healthcare','Others'];

// Modal for adding new expenses
const AddExpenseModal = ({ isOpen, onClose, onAddExpense }) => {
  
    const getFormattedDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [date, setDate] = useState(getFormattedDate(new Date()));
    const [error, setError] = useState('');

    const todayString = getFormattedDate(new Date());

    // Reset form when modal opens
    useEffect(() => {
      if (isOpen) {
        setDescription('');
        setAmount('');
        setCategory(CATEGORIES[0]);
        setDate(getFormattedDate(new Date()));
        setError('');
      }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const today = new Date();
        const selectedDate = new Date(date);

        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        // Validate input
        if (!description.trim() || !amount || isNaN(amount) || +amount <= 0 || !date) {
            setError('Please enter a valid description, positive amount, and date.');
            return;
        }

        // Prevent future dates
        if (selectedDate > today) {
            setError('You cannot add an expense for a future date.');
            return;
        }
        
        onAddExpense({ description, amount: parseFloat(amount), category, date });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Expense</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="modal-description" className="block text-sm font-medium text-gray-700">Description</label>
                        <input type="text" id="modal-description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g., Coffee" />
                    </div>
                    <div>
                        <label htmlFor="modal-amount" className="block text-sm font-medium text-gray-700">Amount (₹)</label>
                        <input type="number" id="modal-amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g., 50" step="0.01" />
                    </div>
                    <div>
                        <label htmlFor="modal-date" className="block text-sm font-medium text-gray-700">Date</label>
                        <input 
                            type="date" 
                            id="modal-date" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)}
                            max={todayString}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="modal-category" className="block text-sm font-medium text-gray-700">Category</label>
                        <select id="modal-category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Add Expense</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Main dashboard with expense tracking functionality
const DashboardPage = ({ user }) => {
    const [expenses, setExpenses] = useState([]);
    const [budget, setBudget] = useState(0);
    const [newBudget, setNewBudget] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter state
    const [filterType, setFilterType] = useState('month');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    
    // Subscribe to user budget and expenses from Firestore
    useEffect(() => {
        if (!user) return;
        const userDocRef = doc(db, 'users', user.uid);
        const expensesColRef = collection(db, 'users', user.uid, 'expenses');
        const q = query(expensesColRef, orderBy('createdAt', 'desc'));

        const unsubUser = onSnapshot(userDocRef, (doc) => setBudget(doc.data()?.budget ?? 0));
        const unsubExpenses = onSnapshot(q, (snapshot) => {
            setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });

        return () => { unsubUser(); unsubExpenses(); };
    }, [user]);
    
    // Update budget in Firestore
    const handleSetBudget = async (e) => {
        e.preventDefault();
        const budgetValue = parseFloat(newBudget);
        if (isNaN(budgetValue) || budgetValue < 0) return;
        await updateDoc(doc(db, 'users', user.uid), { budget: budgetValue });
        setNewBudget('');
    };
    
    // Add new expense to Firestore
    const handleAddExpense = async (expenseData) => {
        try {
            const expenseDate = new Date(expenseData.date);
            expenseDate.setHours(12, 0, 0, 0);

            await addDoc(collection(db, 'users', user.uid, 'expenses'), {
                description: expenseData.description,
                amount: expenseData.amount,
                category: expenseData.category,
                createdAt: expenseDate 
            });
            setIsModalOpen(false);
        } catch (err) {
            console.error("Error adding expense: ", err);
        }
    };

    // Delete expense from Firestore
    const handleDeleteExpense = async (expenseId) => {
        if (!user || !expenseId) return;
        if (window.confirm("Are you sure you want to delete this expense?")) {
            try {
                await deleteDoc(doc(db, 'users', user.uid, 'expenses', expenseId));
            } catch (err) {
                console.error("Error deleting expense: ", err);
            }
        }
    };
    
    const handleSignOut = () => signOut(auth).catch(console.error);

    // Get unique years from expenses for filter dropdown
    const availableYears = useMemo(() => {
        if (expenses.length === 0) return [new Date().getFullYear()];
        const years = new Set(expenses.map(exp => exp.createdAt?.toDate().getFullYear()).filter(Boolean));
        years.add(new Date().getFullYear());
        return Array.from(years).sort((a, b) => b - a);
    }, [expenses]);
    
    // Filter expenses based on selected time period
    const filteredExpenses = useMemo(() => {
        return expenses.filter(exp => {
            if (!exp.createdAt) return false;
            const expenseDate = exp.createdAt.toDate();
            
            switch(filterType) {
                case 'year':
                    return expenseDate.getFullYear() === selectedYear;
                case 'month':
                    return expenseDate.getFullYear() === selectedYear && expenseDate.getMonth() === selectedMonth;
                case 'all':
                default:
                    return true;
            }
        });
    }, [expenses, filterType, selectedYear, selectedMonth]);

    // Generate filter title text
    const filterTitle = useMemo(() => {
        switch (filterType) {
            case 'year': return `in ${selectedYear}`;
            case 'month': return `in ${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
            default: return '(All Time)';
        }
    }, [filterType, selectedYear, selectedMonth]);

    // Calculate totals
    const totalExpenses = useMemo(() => filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0), [filteredExpenses]);
    const remainingBudget = budget - totalExpenses;

    // Aggregate expenses by category for charts
    const categoryData = useMemo(() => {
        const data = filteredExpenses.reduce((acc, exp) => {
            const category = exp.category || 'Others';
            acc[category] = (acc[category] || 0) + exp.amount;
            return acc;
        }, {});
        return {
            labels: Object.keys(data),
            values: Object.values(data)
        };
    }, [filteredExpenses]);
    
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Navigation bar */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="text-xl font-bold text-blue-600">
                ExpenseTracker
              </div>
              <div className="flex items-center">
                <span className="text-gray-700 mr-4 hidden sm:block">
                  {getGreeting()}, {user.displayName}
                </span>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-sm hover:bg-red-600"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {loading ? (
            <p>Loading dashboard...</p>
          ) : (
            <div className="space-y-8">
              {/* Budget, total expenses, and remaining budget cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-lg shadow text-center">
                  <h3 className="text-lg font-medium text-gray-500">
                    Monthly Budget
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    ₹{budget.toFixed(2)}
                  </p>
                  <form onSubmit={handleSetBudget} className="flex gap-2 mt-4">
                    <input
                      type="number"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      placeholder="Update budget..."
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
                    >
                      Set
                    </button>
                  </form>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-500">
                    Total Expenses <span className="capitalize">{filterTitle}</span>
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    ₹{totalExpenses.toFixed(2)}
                  </p>
                  <div className="mt-4 h-24">
                    <CategoryBarChart data={categoryData} />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-500">
                      Remaining Budget
                    </h3>
                    <p
                      className={`text-3xl font-bold mt-2 ${
                        remainingBudget < 0 ? "text-red-500" : "text-green-600"
                      }`}
                    >
                      ₹{remainingBudget.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full mt-4 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600"
                  >
                    Add New Expense
                  </button>
                </div>
              </div>

              {/* Expense list and pie chart */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow">
                  {/* Filter controls */}
                  <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                      <h2 className="text-xl font-bold text-gray-800">Expense List</h2>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                          {['all', 'year', 'month'].map((f) => (
                              <button
                                  key={f}
                                  onClick={() => setFilterType(f)}
                                  className={`px-3 py-1 rounded-full capitalize ${filterType === f ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                              >
                                  {f === 'all' ? 'All Time' : f}
                              </button>
                          ))}
                          {filterType === 'month' && (
                              <>
                                <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} className="px-2 py-1 border border-gray-300 rounded-md bg-white">
                                    {MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}
                                </select>
                                <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="px-2 py-1 border border-gray-300 rounded-md bg-white">
                                    {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                              </>
                          )}
                          {filterType === 'year' && (
                              <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="px-2 py-1 border border-gray-300 rounded-md bg-white">
                                  {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                              </select>
                          )}
                      </div>
                  </div>
                  {/* Expense list */}
                  <div className="max-h-[70vh] overflow-y-auto pr-2">
                    {filteredExpenses.length > 0 ? (
                      <ul className="space-y-3">
                        {filteredExpenses.map((exp) => (
                          <li
                            key={exp.id}
                            className="flex justify-between items-center bg-gray-50 p-3 rounded-md"
                          >
                            <div>
                              <p className="font-semibold text-gray-800">
                                {exp.description}
                              </p>
                              <p className="text-sm text-gray-500">
                                {exp.category || "Others"} &bull;{" "}
                                {exp.createdAt
                                  ? new Date(
                                      exp.createdAt.toDate()
                                    ).toLocaleDateString()
                                  : ""}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-lg">
                                ₹{exp.amount.toFixed(2)}
                              </span>
                              <button
                                onClick={() => handleDeleteExpense(exp.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete expense"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No expenses for this period.
                      </p>
                    )}
                  </div>
                </div>

                {/* Category breakdown pie chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow flex flex-col items-center justify-center">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Spending Breakdown
                  </h2>
                  {categoryData.labels.length > 0 ? (
                    <CategoryPieChart data={categoryData} />
                  ) : (
                    <p className="text-gray-500">No data for chart.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
        <AddExpenseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddExpense={handleAddExpense}
        />
      </div>
    );
};